import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  startParkingSessionSchema,
  endParkingSessionSchema,
} from '@/lib/validations/parking-session';
import { logger } from '@/lib/logger';

// Start a parking session (vehicle entry)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = startParkingSessionSchema.parse(body);

    // Generate session number
    const date = new Date();
    const year = date.getFullYear();
    const random = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, '0');
    const sessionNumber = `SES-${year}-${random}`;

    // Get pricing configuration
    const parkingLot = await prisma.parkingLot.findUnique({
      where: { id: validatedData.parkingLotId },
      include: {
        priceConfigs: {
          where: { isActive: true },
          orderBy: { priority: 'desc' },
        },
      },
    });

    if (!parkingLot) {
      return NextResponse.json(
        { error: 'Parking lot not found' },
        { status: 404 }
      );
    }

    // Find applicable price
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = now.toTimeString().slice(0, 5);

    const applicablePrice = parkingLot.priceConfigs.find((config) => {
      if (config.daysOfWeek && !config.daysOfWeek.includes(currentDay)) {
        return false;
      }
      if (config.startTime && config.endTime) {
        return currentTime >= config.startTime && currentTime <= config.endTime;
      }
      return true;
    });

    const pricePerMinute = applicablePrice?.pricePerMinute || null;
    const pricePerHour =
      applicablePrice?.pricePerHour || parkingLot.basePrice;

    // Create session
    const parkingSession = await prisma.parkingSession.create({
      data: {
        sessionNumber,
        vehicleId: validatedData.vehicleId,
        licensePlate: validatedData.licensePlate,
        userId: session.user.id,
        parkingLotId: validatedData.parkingLotId,
        parkingSpotId: validatedData.parkingSpotId,
        membershipId: validatedData.membershipId,
        pricePerMinute,
        pricePerHour,
        entryStaffId: session.user.id,
        entryNotes: validatedData.entryNotes,
        status: 'IN_PROGRESS',
      },
      include: {
        vehicle: true,
        parkingLot: true,
        parkingSpot: true,
        membership: true,
      },
    });

    // Update spot status if assigned
    if (validatedData.parkingSpotId) {
      await prisma.parkingSpot.update({
        where: { id: validatedData.parkingSpotId },
        data: { status: 'OCCUPIED' },
      });

      // Update available spots
      await prisma.parkingLot.update({
        where: { id: validatedData.parkingLotId },
        data: { availableSpots: { decrement: 1 } },
      });
    }

    logger.info(
      `Parking session started: ${sessionNumber} for ${validatedData.licensePlate}`
    );

    return NextResponse.json(parkingSession, { status: 201 });
  } catch (error: any) {
    logger.error(`Start session error: ${error.message}`);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get active parking sessions
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const parkingLotId = searchParams.get('parkingLotId');
    const status = searchParams.get('status') || 'IN_PROGRESS';
    const licensePlate = searchParams.get('licensePlate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: any = {
      status,
    };

    if (parkingLotId) where.parkingLotId = parkingLotId;
    if (licensePlate) where.licensePlate = { contains: licensePlate };

    // If user is not admin/staff, only show their sessions
    if (!['SUPER_ADMIN', 'TENANT_ADMIN', 'MANAGER', 'STAFF'].includes(
      session.user.role
    )) {
      where.userId = session.user.id;
    } else if (session.user.tenantId) {
      // Tenant admins/managers only see their tenant's sessions
      where.parkingLot = {
        tenantId: session.user.tenantId,
      };
    }

    const [sessions, total] = await Promise.all([
      prisma.parkingSession.findMany({
        where,
        include: {
          vehicle: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          parkingLot: true,
          parkingSpot: true,
          membership: true,
        },
        orderBy: { entryTime: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.parkingSession.count({ where }),
    ]);

    return NextResponse.json({
      sessions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    logger.error(`Get sessions error: ${error.message}`);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

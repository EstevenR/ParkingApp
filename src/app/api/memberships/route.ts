import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createMembershipSchema } from '@/lib/validations/parking-session';
import { logger } from '@/lib/logger';
import { hasPermission } from '@/lib/permissions';

// Create membership
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasPermission(session.user.role, 'CREATE_PARKING_LOT')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const validatedData = createMembershipSchema.parse(body);

    // Generate membership number
    const date = new Date();
    const year = date.getFullYear();
    const random = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, '0');
    const membershipNumber = `MEM-${year}-${random}`;

    const membership = await prisma.membership.create({
      data: {
        ...validatedData,
        membershipNumber,
        startDate: new Date(validatedData.startDate),
        endDate: new Date(validatedData.endDate),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        parkingLot: true,
      },
    });

    logger.info(`Membership created: ${membershipNumber}`);

    return NextResponse.json(membership, { status: 201 });
  } catch (error: any) {
    logger.error(`Create membership error: ${error.message}`);

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

// Get memberships
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const parkingLotId = searchParams.get('parkingLotId');
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    const where: any = {};

    if (parkingLotId) where.parkingLotId = parkingLotId;
    if (userId) where.userId = userId;
    if (status) where.status = status;
    if (type) where.type = type;

    // Regular users only see their own memberships
    if (!['SUPER_ADMIN', 'TENANT_ADMIN', 'MANAGER', 'STAFF'].includes(
      session.user.role
    )) {
      where.userId = session.user.id;
    }

    const memberships = await prisma.membership.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        parkingLot: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(memberships);
  } catch (error: any) {
    logger.error(`Get memberships error: ${error.message}`);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

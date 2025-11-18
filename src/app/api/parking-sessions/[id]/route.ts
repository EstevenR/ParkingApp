import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { endParkingSessionSchema } from '@/lib/validations/parking-session';
import { logger } from '@/lib/logger';

// End parking session (vehicle exit)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = endParkingSessionSchema.parse({
      ...body,
      sessionId: params.id,
    });

    // Get session
    const parkingSession = await prisma.parkingSession.findUnique({
      where: { id: params.id },
      include: {
        parkingSpot: true,
        membership: true,
      },
    });

    if (!parkingSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (parkingSession.status !== 'IN_PROGRESS') {
      return NextResponse.json(
        { error: 'Session already completed' },
        { status: 400 }
      );
    }

    const exitTime = validatedData.exitTime
      ? new Date(validatedData.exitTime)
      : new Date();

    // Calculate duration in minutes
    const entryTime = new Date(parkingSession.entryTime);
    const durationMs = exitTime.getTime() - entryTime.getTime();
    const durationMinutes = Math.ceil(durationMs / (1000 * 60));

    // Calculate cost
    let totalCost = 0;

    if (parkingSession.membership) {
      // If has active membership, cost is 0
      totalCost = 0;
    } else {
      // Calculate based on pricing
      if (parkingSession.pricePerMinute) {
        totalCost = durationMinutes * parkingSession.pricePerMinute;
      } else if (parkingSession.pricePerHour) {
        const hours = Math.ceil(durationMinutes / 60);
        totalCost = hours * parkingSession.pricePerHour;
      }
    }

    // Update session
    const updatedSession = await prisma.parkingSession.update({
      where: { id: params.id },
      data: {
        exitTime,
        durationMinutes,
        totalCost,
        status: 'COMPLETED',
        exitStaffId: session.user.id,
        exitNotes: validatedData.exitNotes,
        isPaid: parkingSession.membership ? true : false,
        paidAt: parkingSession.membership ? exitTime : undefined,
        paymentMethod: validatedData.paymentMethod,
      },
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
    });

    // Update spot status
    if (parkingSession.parkingSpotId) {
      await prisma.parkingSpot.update({
        where: { id: parkingSession.parkingSpotId },
        data: { status: 'AVAILABLE' },
      });

      // Update available spots
      await prisma.parkingLot.update({
        where: { id: parkingSession.parkingLotId },
        data: { availableSpots: { increment: 1 } },
      });
    }

    // Create invoice if payment required
    if (!parkingSession.membership && totalCost > 0) {
      const date = new Date();
      const year = date.getFullYear();
      const random = Math.floor(Math.random() * 1000000)
        .toString()
        .padStart(6, '0');
      const invoiceNumber = `INV-${year}-${random}`;

      await prisma.invoice.create({
        data: {
          invoiceNumber,
          userId: parkingSession.userId,
          parkingLotId: parkingSession.parkingLotId,
          parkingSessionId: parkingSession.id,
          dueDate: exitTime,
          lineItems: [
            {
              description: `Parking - ${durationMinutes} minutes`,
              quantity: durationMinutes,
              unitPrice: parkingSession.pricePerMinute || parkingSession.pricePerHour || 0,
              total: totalCost,
            },
          ],
          subtotal: totalCost,
          total: totalCost,
          balance: validatedData.paymentMethod ? 0 : totalCost,
          status: validatedData.paymentMethod ? 'PAID' : 'ISSUED',
          paidAmount: validatedData.paymentMethod ? totalCost : 0,
          paidAt: validatedData.paymentMethod ? exitTime : undefined,
          paymentMethod: validatedData.paymentMethod,
        },
      });
    }

    logger.info(
      `Parking session ended: ${parkingSession.sessionNumber} - Duration: ${durationMinutes} min - Cost: $${(totalCost / 100).toFixed(2)}`
    );

    return NextResponse.json(updatedSession);
  } catch (error: any) {
    logger.error(`End session error: ${error.message}`);

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

// Get session details
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const parkingSession = await prisma.parkingSession.findUnique({
      where: { id: params.id },
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
        invoice: true,
      },
    });

    if (!parkingSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Check permissions
    if (
      parkingSession.userId !== session.user.id &&
      !['SUPER_ADMIN', 'TENANT_ADMIN', 'MANAGER', 'STAFF'].includes(
        session.user.role
      )
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(parkingSession);
  } catch (error: any) {
    logger.error(`Get session error: ${error.message}`);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

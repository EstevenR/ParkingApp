import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createPriceConfigSchema } from '@/lib/validations/parking-session';
import { logger } from '@/lib/logger';
import { hasPermission } from '@/lib/permissions';

// Create price configuration
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasPermission(session.user.role, 'UPDATE_PARKING_LOT')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const validatedData = createPriceConfigSchema.parse(body);

    const priceConfig = await prisma.priceConfiguration.create({
      data: validatedData,
      include: {
        parkingLot: true,
      },
    });

    logger.info(`Price configuration created: ${priceConfig.name}`);

    return NextResponse.json(priceConfig, { status: 201 });
  } catch (error: any) {
    logger.error(`Create price config error: ${error.message}`);

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

// Get price configurations
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const parkingLotId = searchParams.get('parkingLotId');

    const where: any = {};
    if (parkingLotId) where.parkingLotId = parkingLotId;

    const priceConfigs = await prisma.priceConfiguration.findMany({
      where,
      include: {
        parkingLot: true,
      },
      orderBy: { priority: 'desc' },
    });

    return NextResponse.json(priceConfigs);
  } catch (error: any) {
    logger.error(`Get price configs error: ${error.message}`);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

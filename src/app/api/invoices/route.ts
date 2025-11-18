import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next/auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { hasPermission } from '@/lib/permissions';

// Get invoices with filters
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
    const isOverdue = searchParams.get('isOverdue');
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: any = {};

    if (parkingLotId) where.parkingLotId = parkingLotId;
    if (userId) where.userId = userId;
    if (status) where.status = status;
    if (isOverdue !== null && isOverdue !== undefined) {
      where.isOverdue = isOverdue === 'true';
    }

    if (fromDate || toDate) {
      where.issueDate = {};
      if (fromDate) where.issueDate.gte = new Date(fromDate);
      if (toDate) where.issueDate.lte = new Date(toDate);
    }

    // Regular users only see their own invoices
    if (!['SUPER_ADMIN', 'TENANT_ADMIN', 'MANAGER', 'STAFF'].includes(
      session.user.role
    )) {
      where.userId = session.user.id;
    } else if (session.user.tenantId) {
      // Tenant admins only see their tenant's invoices
      where.parkingLot = {
        tenantId: session.user.tenantId,
      };
    }

    const [invoices, total, totalOverdue, totalDebt] = await Promise.all([
      prisma.invoice.findMany({
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
          parkingSession: true,
        },
        orderBy: { issueDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.invoice.count({ where }),
      prisma.invoice.count({
        where: { ...where, isOverdue: true },
      }),
      prisma.invoice.aggregate({
        where: { ...where, status: { not: 'PAID' } },
        _sum: {
          balance: true,
        },
      }),
    ]);

    return NextResponse.json({
      invoices,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      summary: {
        totalOverdue,
        totalDebt: totalDebt._sum.balance || 0,
      },
    });
  } catch (error: any) {
    logger.error(`Get invoices error: ${error.message}`);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

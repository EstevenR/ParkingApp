import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { formatDateTime, formatCurrency } from '@/lib/utils';

export default async function SessionsManagementPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  // Check permissions
  if (
    !['SUPER_ADMIN', 'TENANT_ADMIN', 'MANAGER', 'STAFF'].includes(
      session.user.role
    )
  ) {
    redirect('/dashboard');
  }

  // Get filters from URL
  const status = (searchParams.status as string) || 'IN_PROGRESS';
  const licensePlate = searchParams.licensePlate as string;
  const date = searchParams.date as string;

  // Build query
  const where: any = {
    status,
    parkingLot: {
      tenantId: session.user.tenantId,
    },
  };

  if (licensePlate) {
    where.licensePlate = {
      contains: licensePlate,
      mode: 'insensitive',
    };
  }

  if (date) {
    const startOfDay = new Date(date);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    where.entryTime = {
      gte: startOfDay,
      lte: endOfDay,
    };
  }

  // Fetch sessions
  const [parkingSessions, stats] = await Promise.all([
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
      take: 50,
    }),
    prisma.parkingSession.groupBy({
      by: ['status'],
      where: {
        parkingLot: {
          tenantId: session.user.tenantId,
        },
      },
      _count: true,
    }),
  ]);

  const statsMap = stats.reduce((acc: any, stat) => {
    acc[stat.status] = stat._count;
    return acc;
  }, {});

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <h1 className="text-2xl font-bold">Gestión de Sesiones</h1>
          <span className="text-sm text-muted-foreground">
            {session.user.email}
          </span>
        </div>
      </header>

      <main className="flex-1 container py-8">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Sesiones Activas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsMap['IN_PROGRESS'] || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Completadas Hoy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsMap['COMPLETED'] || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Vencidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {statsMap['OVERDUE'] || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
            <CardDescription>
              Filtra las sesiones por placa, fecha, estado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="flex gap-4">
              <input
                type="text"
                name="licensePlate"
                placeholder="Placa del vehículo"
                defaultValue={licensePlate}
                className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <input
                type="date"
                name="date"
                defaultValue={date}
                className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <select
                name="status"
                defaultValue={status}
                className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="IN_PROGRESS">En Progreso</option>
                <option value="COMPLETED">Completadas</option>
                <option value="OVERDUE">Vencidas</option>
              </select>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
              >
                Filtrar
              </button>
            </form>
          </CardContent>
        </Card>

        {/* Sessions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Sesiones de Estacionamiento</CardTitle>
            <CardDescription>
              {parkingSessions.length} sesiones encontradas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Placa</th>
                    <th className="text-left py-3 px-4">Cliente</th>
                    <th className="text-left py-3 px-4">Espacio</th>
                    <th className="text-left py-3 px-4">Entrada</th>
                    <th className="text-left py-3 px-4">Salida</th>
                    <th className="text-left py-3 px-4">Duración</th>
                    <th className="text-right py-3 px-4">Costo</th>
                    <th className="text-center py-3 px-4">Estado Pago</th>
                  </tr>
                </thead>
                <tbody>
                  {parkingSessions.map((s) => (
                    <tr key={s.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">
                        {s.licensePlate}
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{s.user.name || 'N/A'}</p>
                          <p className="text-sm text-muted-foreground">
                            {s.user.phone || s.user.email}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {s.parkingSpot?.spotNumber || 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        {formatDateTime(s.entryTime)}
                      </td>
                      <td className="py-3 px-4">
                        {s.exitTime ? formatDateTime(s.exitTime) : '-'}
                      </td>
                      <td className="py-3 px-4">
                        {s.durationMinutes ? `${s.durationMinutes} min` : '-'}
                      </td>
                      <td className="py-3 px-4 text-right font-medium">
                        {s.totalCost !== null
                          ? formatCurrency(s.totalCost)
                          : '-'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {s.isPaid ? (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                            Pagado
                          </span>
                        ) : s.membership ? (
                          <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                            Membresía
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                            Pendiente
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {parkingSessions.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No se encontraron sesiones
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

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
import { formatDate, formatCurrency } from '@/lib/utils';

export default async function InvoicesManagementPage({
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
    !['SUPER_ADMIN', 'TENANT_ADMIN', 'MANAGER'].includes(session.user.role)
  ) {
    redirect('/dashboard');
  }

  // Get filters
  const status = searchParams.status as string;
  const isOverdue = searchParams.isOverdue as string;

  // Build query
  const where: any = {
    parkingLot: {
      tenantId: session.user.tenantId,
    },
  };

  if (status) where.status = status;
  if (isOverdue === 'true') where.isOverdue = true;

  // Fetch invoices and stats
  const [invoices, totalDebt, overdueCount] = await Promise.all([
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
      take: 100,
    }),
    prisma.invoice.aggregate({
      where: {
        parkingLot: {
          tenantId: session.user.tenantId,
        },
        status: { not: 'PAID' },
      },
      _sum: {
        balance: true,
      },
    }),
    prisma.invoice.count({
      where: {
        parkingLot: {
          tenantId: session.user.tenantId,
        },
        isOverdue: true,
      },
    }),
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <h1 className="text-2xl font-bold">Facturación y Deudas</h1>
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
                Deuda Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {formatCurrency(totalDebt._sum.balance || 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Facturas Vencidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {overdueCount}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Total Facturas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{invoices.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="flex gap-4">
              <select
                name="status"
                defaultValue={status}
                className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Todos los estados</option>
                <option value="ISSUED">Emitidas</option>
                <option value="PAID">Pagadas</option>
                <option value="OVERDUE">Vencidas</option>
                <option value="CANCELLED">Canceladas</option>
              </select>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isOverdue"
                  value="true"
                  defaultChecked={isOverdue === 'true'}
                  className="rounded border-input"
                />
                <span className="text-sm">Solo vencidas</span>
              </label>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
              >
                Filtrar
              </button>
            </form>
          </CardContent>
        </Card>

        {/* Invoices Table */}
        <Card>
          <CardHeader>
            <CardTitle>Facturas</CardTitle>
            <CardDescription>Control de pagos y deudas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Nº Factura</th>
                    <th className="text-left py-3 px-4">Cliente</th>
                    <th className="text-left py-3 px-4">Fecha Emisión</th>
                    <th className="text-left py-3 px-4">Vencimiento</th>
                    <th className="text-right py-3 px-4">Total</th>
                    <th className="text-right py-3 px-4">Pagado</th>
                    <th className="text-right py-3 px-4">Saldo</th>
                    <th className="text-center py-3 px-4">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr
                      key={inv.id}
                      className={`border-b hover:bg-muted/50 ${
                        inv.isOverdue ? 'bg-destructive/5' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-medium">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">
                            {inv.user.name || 'N/A'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {inv.user.phone || inv.user.email}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">{formatDate(inv.issueDate)}</td>
                      <td className="py-3 px-4">
                        {formatDate(inv.dueDate)}
                        {inv.isOverdue && (
                          <span className="ml-2 text-xs text-destructive font-medium">
                            VENCIDA
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-medium">
                        {formatCurrency(inv.total)}
                      </td>
                      <td className="py-3 px-4 text-right text-green-600">
                        {formatCurrency(inv.paidAmount)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-destructive">
                        {formatCurrency(inv.balance)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {inv.status === 'PAID' && (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                            Pagada
                          </span>
                        )}
                        {inv.status === 'ISSUED' && (
                          <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                            Emitida
                          </span>
                        )}
                        {inv.status === 'OVERDUE' && (
                          <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                            Vencida
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {invoices.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No se encontraron facturas
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

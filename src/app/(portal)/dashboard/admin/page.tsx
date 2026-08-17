import { getActor } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { StatCard } from '@/components/ui/stat-card';
import { formatSAR } from '@/lib/utils';
import {
  Briefcase,
  Users,
  TrendingUp,
  Wallet,
  AlertCircle,
  Gauge,
  Store,
  Scale,
} from 'lucide-react';

export default async function AdminDashboard() {
  const actor = await getActor();
  if (!actor) return null;
  const organizationId = actor.organizationId;

  const [
    totalCases,
    activeCases,
    closedCases,
    newClientsThisMonth,
    invoices,
    overdueInvoices,
    orders,
  ] = await Promise.all([
    prisma.case.count({ where: { organizationId } }),
    prisma.case.count({ where: { organizationId, status: { in: ['ACTIVE', 'IN_COURT', 'SETTLEMENT'] } } }),
    prisma.case.count({ where: { organizationId, status: { in: ['CLOSED_WON', 'CLOSED_LOST', 'CLOSED_SETTLED'] } } }),
    prisma.client.count({
      where: { organizationId, createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } },
    }),
    prisma.invoice.findMany({ where: { organizationId }, select: { status: true, totalAmount: true } }),
    prisma.invoice.count({ where: { organizationId, status: 'OVERDUE' } }),
    prisma.order.findMany({ where: { organizationId }, select: { status: true, quotedAmount: true } }),
  ]);

  const totalRevenue = invoices.reduce((sum, i) => sum + Number(i.totalAmount), 0);
  const collected = invoices.filter((i) => i.status === 'PAID').reduce((sum, i) => sum + Number(i.totalAmount), 0);
  const outstanding = totalRevenue - collected;
  const collectionRate = totalRevenue > 0 ? Math.round((collected / totalRevenue) * 100) : 0;
  const marketplaceRevenue = orders.reduce((sum, o) => sum + Number(o.quotedAmount ?? 0), 0);

  const casesByStatus = await prisma.case.groupBy({
    by: ['status'],
    where: { organizationId },
    _count: true,
  });

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-2xl font-bold text-charcoal-900">مركز القيادة الإداري</h1>
        <p className="mt-1 text-sm text-neutral-500">نظرة شاملة على أداء المكتب.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="إجمالي القضايا" value={String(totalCases)} icon={Briefcase} />
        <StatCard label="القضايا النشطة" value={String(activeCases)} icon={Gauge} tone="gold" />
        <StatCard label="القضايا المغلقة" value={String(closedCases)} icon={Scale} />
        <StatCard label="عملاء جدد هذا الشهر" value={String(newClientsThisMonth)} icon={Users} />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="الإيرادات (إجمالي)" value={formatSAR(totalRevenue)} icon={Wallet} tone="dark" />
        <StatCard label="المُحصَّل" value={formatSAR(collected)} icon={TrendingUp} />
        <StatCard label="المستحق" value={formatSAR(outstanding)} icon={AlertCircle} />
        <StatCard label="نسبة التحصيل" value={`${collectionRate}%`} icon={Gauge} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="ds-card p-6 lg:col-span-2">
          <h2 className="mb-5 font-display text-base font-bold text-charcoal-900">توزيع القضايا حسب الحالة</h2>
          <div className="space-y-3">
            {casesByStatus.map((row) => (
              <div key={row.status} className="flex items-center gap-4">
                <span className="w-40 shrink-0 text-xs text-neutral-500">{row.status}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className="h-full rounded-full bg-gold-500"
                    style={{ width: `${totalCases > 0 ? (row._count / totalCases) * 100 : 0}%` }}
                  />
                </div>
                <span className="w-8 shrink-0 text-left text-xs font-medium text-charcoal-800">{row._count}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="ds-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <Store className="h-4 w-4 text-neutral-400" strokeWidth={1.5} />
            <h3 className="text-sm font-semibold text-charcoal-900">إيرادات السوق القانوني</h3>
          </div>
          <p className="font-display text-2xl font-bold text-charcoal-900">{formatSAR(marketplaceRevenue)}</p>
          <p className="mt-1 text-xs text-neutral-500">{orders.length} طلب خدمة</p>
        </section>
      </div>

      <section className="ds-card border-danger/20 bg-danger/5 p-6">
        <div className="mb-2 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-danger" strokeWidth={1.5} />
          <h3 className="text-sm font-semibold text-charcoal-900">فواتير متأخرة تحتاج متابعة</h3>
        </div>
        <p className="font-display text-2xl font-bold text-danger">{overdueInvoices}</p>
      </section>
    </div>
  );
}

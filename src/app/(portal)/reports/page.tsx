import { getActor } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { assertPermission } from '@/lib/rbac/can';
import { PERMISSIONS } from '@/lib/rbac/permissions';
import { ReportsCharts } from '@/components/dashboard/reports-charts';
import { formatSAR } from '@/lib/utils';

export default async function ReportsPage() {
  const actor = await getActor();
  if (!actor) return null;
  assertPermission(actor, PERMISSIONS.ADMIN_VIEW_ANALYTICS);

  const organizationId = actor.organizationId;

  const [cases, invoices, lawyerLoad] = await Promise.all([
    prisma.case.findMany({
      where: { organizationId },
      select: { status: true, practiceArea: { select: { nameAr: true } }, openedAt: true, closedAt: true },
    }),
    prisma.invoice.findMany({
      where: { organizationId },
      select: { totalAmount: true, status: true, issuedAt: true, createdAt: true },
    }),
    prisma.caseAssignment.groupBy({ by: ['userId'], _count: true }),
  ]);

  // الإيرادات الشهرية لآخر 6 أشهر
  const revenueByMonth = buildMonthlyRevenue(invoices);

  // القضايا حسب التخصص
  const casesByType = Object.entries(
    cases.reduce<Record<string, number>>((acc, c) => {
      const key = c.practiceArea?.nameAr ?? 'غير مصنّف';
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name, value }));

  // متوسط مدة القضية بالأيام (للقضايا المغلقة)
  const closedDurations = cases
    .filter((c) => c.closedAt)
    .map((c) => (c.closedAt!.getTime() - c.openedAt.getTime()) / (1000 * 60 * 60 * 24));
  const avgDuration = closedDurations.length
    ? Math.round(closedDurations.reduce((a, b) => a + b, 0) / closedDurations.length)
    : 0;

  const totalRevenue = invoices.reduce((s, i) => s + Number(i.totalAmount), 0);
  const collected = invoices.filter((i) => i.status === 'PAID').reduce((s, i) => s + Number(i.totalAmount), 0);
  const collectionRate = totalRevenue > 0 ? Math.round((collected / totalRevenue) * 100) : 0;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-2xl font-bold text-charcoal-900">التقارير والتحليلات</h1>
        <p className="mt-1 text-sm text-neutral-500">مؤشرات أداء المكتب التفصيلية.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MiniStat label="متوسط مدة القضية" value={`${avgDuration} يوم`} />
        <MiniStat label="نسبة التحصيل" value={`${collectionRate}%`} />
        <MiniStat label="إجمالي الإيرادات" value={formatSAR(totalRevenue)} />
        <MiniStat label="محامون نشطون" value={String(lawyerLoad.length)} />
      </div>

      <ReportsCharts revenueByMonth={revenueByMonth} casesByType={casesByType} />
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="ds-card p-5">
      <p className="text-xs text-neutral-500">{label}</p>
      <p className="mt-2 font-display text-xl font-bold text-charcoal-900">{value}</p>
    </div>
  );
}

function buildMonthlyRevenue(invoices: { totalAmount: any; createdAt: Date }[]) {
  const now = new Date();
  const months: { key: string; label: string; value: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: d.toLocaleDateString('ar-SA', { month: 'short' }),
      value: 0,
    });
  }
  const map = new Map(months.map((m) => [m.key, m]));
  for (const inv of invoices) {
    const d = new Date(inv.createdAt);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const entry = map.get(key);
    if (entry) entry.value += Number(inv.totalAmount);
  }
  return months.map(({ label, value }) => ({ name: label, value }));
}

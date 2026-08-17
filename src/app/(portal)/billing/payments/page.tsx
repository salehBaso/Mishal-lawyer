import { getActor } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { assertPermission } from '@/lib/rbac/can';
import { PERMISSIONS } from '@/lib/rbac/permissions';
import { EmptyState } from '@/components/ui/empty-state';
import { Badge } from '@/components/ui/badge';
import { formatSAR, formatArabicDate } from '@/lib/utils';
import { CreditCard } from 'lucide-react';

const STATUS_TONE: Record<string, 'neutral' | 'success' | 'danger' | 'warning'> = {
  INITIATED: 'neutral',
  AUTHORIZED: 'warning',
  CAPTURED: 'success',
  FAILED: 'danger',
  REFUNDED: 'neutral',
};

export default async function PaymentsPage() {
  const actor = await getActor();
  if (!actor) return null;
  assertPermission(actor, PERMISSIONS.PAYMENT_VIEW);

  const payments = await prisma.payment.findMany({
    where: { invoice: { organizationId: actor.organizationId } },
    include: { invoice: true },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-charcoal-900">المدفوعات</h1>
        <p className="mt-1 text-sm text-neutral-500">
          سجل الدفعات عبر مزودي الدفع المعتمدين — لا تُخزَّن أي بيانات بطاقة على خوادمنا.
        </p>
      </div>

      {payments.length === 0 ? (
        <EmptyState icon={CreditCard} title="لا توجد دفعات مسجّلة بعد" />
      ) : (
        <div className="ds-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-right text-xs text-neutral-500">
              <tr>
                <th className="px-5 py-3 font-medium">مرجع العملية</th>
                <th className="px-5 py-3 font-medium">المزوّد</th>
                <th className="px-5 py-3 font-medium">المبلغ</th>
                <th className="px-5 py-3 font-medium">التاريخ</th>
                <th className="px-5 py-3 font-medium">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {payments.map((p) => (
                <tr key={p.id}>
                  <td className="px-5 py-3 font-mono text-xs text-neutral-500">{p.providerRef}</td>
                  <td className="px-5 py-3 text-xs capitalize text-neutral-600">{p.provider}</td>
                  <td className="px-5 py-3 font-medium text-charcoal-900">{formatSAR(Number(p.amount))}</td>
                  <td className="px-5 py-3 text-xs text-neutral-500">{formatArabicDate(p.createdAt)}</td>
                  <td className="px-5 py-3"><Badge tone={STATUS_TONE[p.status]}>{p.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

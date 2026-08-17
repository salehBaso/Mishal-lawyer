import { getActor } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { EmptyState } from '@/components/ui/empty-state';
import { Badge } from '@/components/ui/badge';
import { formatSAR } from '@/lib/utils';
import { Store } from 'lucide-react';

const STATUS_LABELS: Record<string, string> = {
  REQUESTED: 'طلب جديد',
  QUOTED: 'تم التسعير',
  APPROVED: 'مُعتمد',
  IN_PROGRESS: 'قيد التنفيذ',
  DELIVERED: 'تم التسليم',
  COMPLETED: 'مكتمل',
  CANCELLED: 'ملغى',
};

/** لوحة مقدّم الخدمة — لا يرى إلا طلباته الخاصة */
export default async function MyOrdersPage() {
  const actor = await getActor();
  if (!actor) return null;

  const provider = await prisma.marketplaceProvider.findUnique({ where: { userId: actor.userId } });
  if (!provider) {
    return <EmptyState icon={Store} title="لا يوجد ملف مقدّم خدمة مرتبط بحسابك" />;
  }

  const orders = await prisma.order.findMany({
    where: { providerId: provider.id },
    include: { service: true },
    orderBy: { createdAt: 'desc' },
  });

  const newRequests = orders.filter((o) => o.status === 'REQUESTED').length;
  const active = orders.filter((o) => ['APPROVED', 'IN_PROGRESS'].includes(o.status)).length;
  const completed = orders.filter((o) => o.status === 'COMPLETED').length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-charcoal-900">طلباتي</h1>
        <p className="mt-1 text-sm text-neutral-500">لوحة {provider.displayName}</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="ds-card p-5">
          <p className="text-xs text-neutral-500">طلبات جديدة</p>
          <p className="mt-2 font-display text-2xl font-bold text-charcoal-900">{newRequests}</p>
        </div>
        <div className="ds-card p-5">
          <p className="text-xs text-neutral-500">قيد التنفيذ</p>
          <p className="mt-2 font-display text-2xl font-bold text-charcoal-900">{active}</p>
        </div>
        <div className="ds-card p-5">
          <p className="text-xs text-neutral-500">مكتملة</p>
          <p className="mt-2 font-display text-2xl font-bold text-charcoal-900">{completed}</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <EmptyState icon={Store} title="لا توجد طلبات بعد" />
      ) : (
        <div className="ds-card divide-y divide-neutral-100">
          {orders.map((o) => (
            <div key={o.id} className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm font-medium text-charcoal-900">{o.service?.title ?? 'طلب خدمة'}</p>
                <p className="mt-1 line-clamp-1 text-xs text-neutral-500">{o.brief}</p>
              </div>
              <div className="flex items-center gap-4">
                {o.quotedAmount && <span className="text-xs text-neutral-500">{formatSAR(Number(o.quotedAmount))}</span>}
                <Badge tone="gold">{STATUS_LABELS[o.status]}</Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

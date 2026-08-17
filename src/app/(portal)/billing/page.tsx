import Link from 'next/link';
import { getActor } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { assertPermission, can } from '@/lib/rbac/can';
import { PERMISSIONS } from '@/lib/rbac/permissions';
import { EmptyState } from '@/components/ui/empty-state';
import { InvoiceStatusBadge } from '@/components/ui/status-indicator';
import { Button } from '@/components/ui/button';
import { formatSAR, formatArabicDate } from '@/lib/utils';
import { Receipt, Plus } from 'lucide-react';

export default async function BillingPage() {
  const actor = await getActor();
  if (!actor) return null;

  const isClient = actor.role === 'CLIENT';
  if (!isClient) assertPermission(actor, PERMISSIONS.FINANCIAL_VIEW);

  const invoices = await prisma.invoice.findMany({
    where: isClient ? { clientId: actor.clientId ?? '' } : { organizationId: actor.organizationId },
    include: { client: true, case: { select: { title: true } } },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-charcoal-900">الفوترة</h1>
          <p className="mt-1 text-sm text-neutral-500">{invoices.length} فاتورة</p>
        </div>
        {!isClient && can(actor, PERMISSIONS.INVOICE_CREATE) && (
          <Link href="/billing/new">
            <Button size="sm">
              <Plus className="h-4 w-4" strokeWidth={1.75} />
              فاتورة جديدة
            </Button>
          </Link>
        )}
      </div>

      {invoices.length === 0 ? (
        <EmptyState icon={Receipt} title="لا توجد فواتير حتى الآن" />
      ) : (
        <div className="ds-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-right text-xs text-neutral-500">
              <tr>
                <th className="px-5 py-3 font-medium">رقم الفاتورة</th>
                {!isClient && <th className="px-5 py-3 font-medium">العميل</th>}
                <th className="px-5 py-3 font-medium">القضية</th>
                <th className="px-5 py-3 font-medium">المبلغ</th>
                <th className="px-5 py-3 font-medium">تاريخ الاستحقاق</th>
                <th className="px-5 py-3 font-medium">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {invoices.map((inv) => (
                <tr key={inv.id} className="transition-premium hover:bg-neutral-50">
                  <td className="px-5 py-3 font-mono text-xs text-neutral-500">{inv.invoiceNumber}</td>
                  {!isClient && <td className="px-5 py-3 text-xs text-neutral-600">{inv.client.fullName}</td>}
                  <td className="px-5 py-3 text-xs text-neutral-500">{inv.case?.title ?? '—'}</td>
                  <td className="px-5 py-3 font-medium text-charcoal-900">{formatSAR(Number(inv.totalAmount))}</td>
                  <td className="px-5 py-3 text-xs text-neutral-500">{inv.dueDate ? formatArabicDate(inv.dueDate) : '—'}</td>
                  <td className="px-5 py-3"><InvoiceStatusBadge status={inv.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

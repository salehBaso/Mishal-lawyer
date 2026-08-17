import { getActor } from '@/lib/auth';
import { assertPermission } from '@/lib/rbac/can';
import { PERMISSIONS } from '@/lib/rbac/permissions';
import { prisma } from '@/lib/db/prisma';
import { NewInvoiceForm } from '@/components/case/new-invoice-form';

export default async function NewInvoicePage() {
  const actor = await getActor();
  if (!actor) return null;
  assertPermission(actor, PERMISSIONS.INVOICE_CREATE);

  const [clients, cases] = await Promise.all([
    prisma.client.findMany({ where: { organizationId: actor.organizationId }, orderBy: { fullName: 'asc' } }),
    prisma.case.findMany({
      where: { organizationId: actor.organizationId },
      include: { parties: { where: { role: 'CLIENT' }, select: { clientId: true } } },
      orderBy: { updatedAt: 'desc' },
    }),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-charcoal-900">فاتورة جديدة</h1>
        <p className="mt-1 text-sm text-neutral-500">أنشئ فاتورة وربطها بعميل وقضية (اختياري).</p>
      </div>
      <NewInvoiceForm
        clients={clients.map((c) => ({ id: c.id, label: c.companyName ?? c.fullName }))}
        cases={cases
          .filter((c) => c.parties[0]?.clientId)
          .map((c) => ({ id: c.id, label: `${c.caseNumber} — ${c.title}`, clientId: c.parties[0]!.clientId! }))}
      />
    </div>
  );
}

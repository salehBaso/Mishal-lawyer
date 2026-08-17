import { getActor } from '@/lib/auth';
import { assertPermission } from '@/lib/rbac/can';
import { PERMISSIONS } from '@/lib/rbac/permissions';
import { prisma } from '@/lib/db/prisma';
import { NewCaseForm } from '@/components/case/new-case-form';

export default async function NewCasePage() {
  const actor = await getActor();
  if (!actor) return null;
  assertPermission(actor, PERMISSIONS.CASE_CREATE);

  const [practiceAreas, clients, lawyers] = await Promise.all([
    prisma.practiceArea.findMany({ where: { organizationId: actor.organizationId }, orderBy: { sortOrder: 'asc' } }),
    prisma.client.findMany({ where: { organizationId: actor.organizationId }, orderBy: { fullName: 'asc' } }),
    prisma.lawyer.findMany({ where: { user: { organizationId: actor.organizationId } }, include: { user: true } }),
  ]);

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-charcoal-900">قضية جديدة</h1>
        <p className="mt-1 text-sm text-neutral-500">أدخل البيانات الأساسية لفتح ملف قضية جديد.</p>
      </div>

      <NewCaseForm
        practiceAreas={practiceAreas.map((p) => ({ id: p.id, label: p.nameAr }))}
        clients={clients.map((c) => ({ id: c.id, label: c.companyName ?? c.fullName }))}
        lawyers={lawyers.map((l) => ({ id: l.id, label: l.user.fullNameAr ?? l.user.fullName }))}
      />
    </div>
  );
}

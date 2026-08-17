import { getActor } from '@/lib/auth';
import { assertPermission } from '@/lib/rbac/can';
import { PERMISSIONS } from '@/lib/rbac/permissions';
import { NewClientForm } from '@/components/case/new-client-form';

export default async function NewClientPage() {
  const actor = await getActor();
  if (!actor) return null;
  assertPermission(actor, PERMISSIONS.CLIENT_MANAGE);

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-charcoal-900">عميل جديد</h1>
        <p className="mt-1 text-sm text-neutral-500">أضف عميلًا جديدًا (فردًا أو شركة) إلى المكتب.</p>
      </div>
      <NewClientForm />
    </div>
  );
}

import { getActor } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { assertPermission } from '@/lib/rbac/can';
import { PERMISSIONS } from '@/lib/rbac/permissions';
import { EmptyState } from '@/components/ui/empty-state';
import { formatArabicDateTime } from '@/lib/utils';
import { ShieldCheck } from 'lucide-react';

/**
 * سجل التدقيق — للاطّلاع فقط. لا يوجد أي إجراء تعديل أو حذف على هذه
 * الصفحة عمدًا، لضمان أن السجل يبقى غير قابل للتلاعب من واجهة التطبيق.
 */
export default async function AuditLogPage() {
  const actor = await getActor();
  if (!actor) return null;
  assertPermission(actor, PERMISSIONS.ADMIN_VIEW_AUDIT_LOG);

  const logs = await prisma.auditLog.findMany({
    where: { organizationId: actor.organizationId },
    include: { actor: { select: { fullNameAr: true, fullName: true } }, case: { select: { title: true } } },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <ShieldCheck className="h-5 w-5 text-neutral-400" strokeWidth={1.5} />
        <div>
          <h1 className="font-display text-2xl font-bold text-charcoal-900">سجل التدقيق</h1>
          <p className="mt-1 text-sm text-neutral-500">سجل غير قابل للتعديل لكل الإجراءات الحساسة في المنصة.</p>
        </div>
      </div>

      {logs.length === 0 ? (
        <EmptyState icon={ShieldCheck} title="لا توجد سجلات تدقيق بعد" />
      ) : (
        <div className="ds-card divide-y divide-neutral-100">
          {logs.map((log) => (
            <div key={log.id} className="flex items-center justify-between p-4">
              <div className="text-sm text-charcoal-800">
                <span className="font-medium">{log.actor?.fullNameAr ?? log.actor?.fullName ?? 'النظام'}</span>
                {' — '}
                <span className="text-neutral-600">{log.description}</span>
                {log.case && <span className="text-xs text-gold-600"> · {log.case.title}</span>}
              </div>
              <span className="shrink-0 text-xs text-neutral-400">{formatArabicDateTime(log.createdAt)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { getActor } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { assertPermission } from '@/lib/rbac/can';
import { PERMISSIONS } from '@/lib/rbac/permissions';
import { EmptyState } from '@/components/ui/empty-state';
import { Badge } from '@/components/ui/badge';
import { DocumentUploadButton } from '@/components/case/document-upload-button';
import { formatArabicDate } from '@/lib/utils';
import { FileText } from 'lucide-react';

const STATUS_LABELS: Record<string, string> = {
  REQUIRED: 'مطلوب',
  SUBMITTED: 'مُقدَّم',
  UNDER_REVIEW: 'قيد المراجعة',
  APPROVED: 'مُعتمد',
  REJECTED: 'مرفوض',
};

export default async function DocumentsPage() {
  const actor = await getActor();
  if (!actor) return null;
  assertPermission(actor, PERMISSIONS.DOCUMENT_VIEW);

  const where =
    actor.role === 'CLIENT' && actor.clientId
      ? { organizationId: actor.organizationId, case: { parties: { some: { clientId: actor.clientId } } } }
      : { organizationId: actor.organizationId };

  const documents = await prisma.document.findMany({
    where,
    include: { case: { select: { title: true, caseNumber: true } }, versions: { orderBy: { versionNumber: 'desc' as const }, take: 1 } },
    orderBy: { updatedAt: 'desc' },
    take: 100,
  });

  const requiredCount = documents.filter((d) => d.status === 'REQUIRED').length;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-charcoal-900">المستندات</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {documents.length} مستند{requiredCount > 0 ? ` — ${requiredCount} بانتظار الرفع` : ''}
          </p>
        </div>
      </div>

      {documents.length === 0 ? (
        <EmptyState icon={FileText} title="لا توجد مستندات لعرضها" description="ستظهر هنا المستندات المرتبطة بقضاياك." />
      ) : (
        <div className="ds-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-right text-xs text-neutral-500">
              <tr>
                <th className="px-5 py-3 font-medium">العنوان</th>
                <th className="px-5 py-3 font-medium">القضية</th>
                <th className="px-5 py-3 font-medium">الحالة</th>
                <th className="px-5 py-3 font-medium">آخر تحديث</th>
                <th className="px-5 py-3 font-medium">إصدار</th>
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {documents.map((d) => (
                <tr key={d.id} className="transition-premium hover:bg-neutral-50">
                  <td className="px-5 py-3 font-medium text-charcoal-900">{d.title}</td>
                  <td className="px-5 py-3 text-xs text-neutral-500">{d.case?.title ?? '—'}</td>
                  <td className="px-5 py-3">
                    <Badge tone={d.status === 'REQUIRED' ? 'warning' : d.status === 'APPROVED' ? 'success' : 'neutral'}>
                      {STATUS_LABELS[d.status]}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-xs text-neutral-500">{formatArabicDate(d.updatedAt)}</td>
                  <td className="px-5 py-3 text-xs text-neutral-500">v{d.versions[0]?.versionNumber ?? 1}</td>
                  <td className="px-5 py-3">
                    {d.status === 'REQUIRED' && (
                      <DocumentUploadButton title={d.title} caseId={d.caseId ?? undefined} documentId={d.id} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

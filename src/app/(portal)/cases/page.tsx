import Link from 'next/link';
import { getActor } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { can } from '@/lib/rbac/can';
import { PERMISSIONS } from '@/lib/rbac/permissions';
import { CaseStatusBadge, RiskBadge } from '@/components/ui/status-indicator';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { Briefcase, Plus } from 'lucide-react';

export default async function CasesListPage() {
  const actor = await getActor();
  if (!actor) return null;

  const viewAll = can(actor, PERMISSIONS.CASE_VIEW_ALL_ORG);

  const cases = viewAll
    ? await prisma.case.findMany({
        where: { organizationId: actor.organizationId },
        orderBy: { updatedAt: 'desc' },
        include: { practiceArea: true },
      })
    : await prisma.case.findMany({
        where: {
          organizationId: actor.organizationId,
          assignments: { some: { userId: actor.userId } },
        },
        orderBy: { updatedAt: 'desc' },
        include: { practiceArea: true },
      });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-charcoal-900">القضايا</h1>
          <p className="mt-1 text-sm text-neutral-500">{cases.length} قضية</p>
        </div>
        {can(actor, PERMISSIONS.CASE_CREATE) && (
          <Link href="/cases/new">
            <Button size="sm">
              <Plus className="h-4 w-4" strokeWidth={1.75} />
              قضية جديدة
            </Button>
          </Link>
        )}
      </div>

      {cases.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="لا توجد قضايا لعرضها"
          description="ستظهر هنا القضايا المُسندة إليك."
          action={
            can(actor, PERMISSIONS.CASE_CREATE) ? (
              <Link href="/cases/new">
                <Button size="sm" variant="outline">إنشاء أول قضية</Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="ds-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-right text-xs text-neutral-500">
              <tr>
                <th className="px-5 py-3 font-medium">رقم القضية</th>
                <th className="px-5 py-3 font-medium">العنوان</th>
                <th className="px-5 py-3 font-medium">التخصص</th>
                <th className="px-5 py-3 font-medium">الحالة</th>
                <th className="px-5 py-3 font-medium">قوة القضية</th>
                <th className="px-5 py-3 font-medium">المخاطر</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {cases.map((c) => (
                <tr key={c.id} className="transition-premium hover:bg-neutral-50">
                  <td className="px-5 py-3 font-mono text-xs text-neutral-500">{c.caseNumber}</td>
                  <td className="px-5 py-3">
                    <Link href={`/cases/${c.id}`} className="font-medium text-charcoal-900 hover:text-gold-600">
                      {c.title}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-xs text-neutral-600">{c.practiceArea?.nameAr ?? '—'}</td>
                  <td className="px-5 py-3"><CaseStatusBadge status={c.status} /></td>
                  <td className="px-5 py-3 text-xs text-neutral-600">{c.strengthScore ?? '—'} / 100</td>
                  <td className="px-5 py-3"><RiskBadge level={c.riskLevel} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

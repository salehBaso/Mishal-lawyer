import { getActor } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { EmptyState } from '@/components/ui/empty-state';
import { TaskStatusBadge } from '@/components/ui/status-indicator';
import { formatArabicDateTime } from '@/lib/utils';
import { ListChecks } from 'lucide-react';

export default async function TasksPage() {
  const actor = await getActor();
  if (!actor) return null;

  const tasks = await prisma.caseTask.findMany({
    where: { assigneeId: actor.userId },
    include: { case: { select: { title: true, caseNumber: true } } },
    orderBy: [{ status: 'asc' }, { dueAt: 'asc' }],
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-charcoal-900">مهامي</h1>
        <p className="mt-1 text-sm text-neutral-500">{tasks.length} مهمة مُسندة إليك</p>
      </div>

      {tasks.length === 0 ? (
        <EmptyState icon={ListChecks} title="لا توجد مهام مُسندة إليك حاليًا" />
      ) : (
        <div className="ds-card divide-y divide-neutral-100">
          {tasks.map((t) => (
            <div key={t.id} className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm font-medium text-charcoal-900">{t.title}</p>
                <p className="mt-1 text-xs text-neutral-500">{t.case?.title}</p>
              </div>
              <div className="flex items-center gap-4">
                {t.dueAt && <span className="text-xs text-neutral-400">{formatArabicDateTime(t.dueAt)}</span>}
                <TaskStatusBadge status={t.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

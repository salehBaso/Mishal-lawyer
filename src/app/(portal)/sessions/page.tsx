import { getActor } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { EmptyState } from '@/components/ui/empty-state';
import { formatArabicDateTime } from '@/lib/utils';
import { CalendarClock } from 'lucide-react';

export default async function SessionsPage() {
  const actor = await getActor();
  if (!actor) return null;

  const hearings = await prisma.hearing.findMany({
    where: { case: { organizationId: actor.organizationId }, attendees: { some: { userId: actor.userId } } },
    include: { case: { select: { title: true, caseNumber: true } } },
    orderBy: { scheduledAt: 'asc' },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-charcoal-900">الجلسات والمواعيد</h1>
        <p className="mt-1 text-sm text-neutral-500">{hearings.length} جلسة</p>
      </div>

      {hearings.length === 0 ? (
        <EmptyState icon={CalendarClock} title="لا توجد جلسات مجدولة" />
      ) : (
        <div className="ds-card divide-y divide-neutral-100">
          {hearings.map((h) => (
            <div key={h.id} className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm font-medium text-charcoal-900">{h.case.title}</p>
                <p className="mt-1 text-xs text-neutral-500">{h.courtName ?? 'محكمة غير محددة'} — {h.location ?? ''}</p>
              </div>
              <span className="text-xs font-medium text-gold-600">{formatArabicDateTime(h.scheduledAt)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

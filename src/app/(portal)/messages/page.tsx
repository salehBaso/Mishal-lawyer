import { getActor } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { EmptyState } from '@/components/ui/empty-state';
import { formatArabicDateTime } from '@/lib/utils';
import { MessageSquare } from 'lucide-react';

export default async function MessagesPage() {
  const actor = await getActor();
  if (!actor) return null;

  const conversations = await prisma.conversation.findMany({
    where: { case: { organizationId: actor.organizationId } },
    include: {
      case: { select: { title: true } },
      messages: { orderBy: { createdAt: 'desc' }, take: 1, include: { sender: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-charcoal-900">الرسائل</h1>
        <p className="mt-1 text-sm text-neutral-500">محادثات مرتبطة بقضاياك</p>
      </div>

      {conversations.length === 0 ? (
        <EmptyState icon={MessageSquare} title="لا توجد محادثات بعد" description="تظهر هنا المحادثات المرتبطة بقضاياك مع العملاء والفريق." />
      ) : (
        <div className="ds-card divide-y divide-neutral-100">
          {conversations.map((c) => {
            const last = c.messages[0];
            return (
              <div key={c.id} className="flex items-center justify-between p-5">
                <div>
                  <p className="text-sm font-medium text-charcoal-900">{c.title ?? c.case?.title ?? 'محادثة'}</p>
                  <p className="mt-1 line-clamp-1 text-xs text-neutral-500">
                    {last ? `${last.sender?.fullNameAr ?? 'مستخدم'}: ${last.body ?? ''}` : 'لا توجد رسائل بعد'}
                  </p>
                </div>
                {last && <span className="shrink-0 text-xs text-neutral-400">{formatArabicDateTime(last.createdAt)}</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

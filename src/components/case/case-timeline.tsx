import { formatArabicDate } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

interface TimelineEvent {
  id: string;
  type: string;
  title: string;
  description: string | null;
  occurredAt: Date;
  isAIGenerated: boolean;
}

const TYPE_LABELS: Record<string, string> = {
  claim: 'مطالبة',
  contract: 'عقد',
  payment: 'دفعة مالية',
  correspondence: 'مراسلة',
  court_filing: 'إيداع قضائي',
  hearing: 'جلسة',
  response: 'رد',
};

export function CaseTimeline({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) {
    return <p className="text-sm text-neutral-500">لا توجد أحداث مسجّلة على الخط الزمني بعد.</p>;
  }

  return (
    <ol className="relative space-y-8 border-r-2 border-neutral-200 pr-6">
      {events.map((event) => (
        <li key={event.id} className="relative">
          <span className="absolute -right-[31px] top-1 h-3 w-3 rounded-full border-2 border-gold-500 bg-white" />
          <div className="mb-1 flex items-center gap-2">
            <span className="text-xs font-semibold text-gold-600">{TYPE_LABELS[event.type] ?? event.type}</span>
            <span className="text-xs text-neutral-400">{formatArabicDate(event.occurredAt)}</span>
            {event.isAIGenerated && (
              <span className="inline-flex items-center gap-1 rounded-full bg-info/10 px-2 py-0.5 text-[10px] text-info">
                <Sparkles className="h-2.5 w-2.5" /> مُستخرج آليًا
              </span>
            )}
          </div>
          <p className="text-sm font-medium text-charcoal-900">{event.title}</p>
          {event.description && <p className="mt-1 text-xs leading-6 text-neutral-500">{event.description}</p>}
        </li>
      ))}
    </ol>
  );
}

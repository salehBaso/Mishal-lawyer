import { notFound } from 'next/navigation';
import { getActor } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { assertSameOrganization } from '@/lib/rbac/can';
import { CaseStatusBadge, RiskBadge, TaskStatusBadge } from '@/components/ui/status-indicator';
import { CaseStrengthGauge } from '@/components/case/case-strength-gauge';
import { CaseTimeline } from '@/components/case/case-timeline';
import { AIActionsPanel } from '@/components/case/ai-actions-panel';
import { NewDocumentUploader } from '@/components/case/new-document-uploader';
import { NewTaskForm } from '@/components/case/new-task-form';
import { NewHearingForm } from '@/components/case/new-hearing-form';
import { EmptyState } from '@/components/ui/empty-state';
import { Tabs } from '@/components/ui/tabs';
import { formatSAR, formatArabicDate, formatArabicDateTime } from '@/lib/utils';
import { FileText, Users, CalendarClock, ListChecks, MessageSquare, Scale } from 'lucide-react';

export default async function CaseWarRoomPage({ params }: { params: { caseId: string } }) {
  const actor = await getActor();
  if (!actor) return null;

  const caseRecord = await prisma.case.findUnique({
    where: { id: params.caseId },
    include: {
      practiceArea: true,
      parties: { include: { client: true } },
      assignments: { include: { user: true } },
      documents: { include: { versions: { orderBy: { versionNumber: 'desc' }, take: 1 } } },
      hearings: { orderBy: { scheduledAt: 'asc' } },
      tasks: { include: { assignee: true }, orderBy: { dueAt: 'asc' } },
      timelineEvents: { orderBy: { occurredAt: 'asc' } },
      invoices: { include: { payments: true } },
      messages: { include: { messages: { orderBy: { createdAt: 'desc' }, take: 20 } } },
      aiAnalyses: { orderBy: { createdAt: 'desc' } },
    },
  });

  if (!caseRecord) notFound();
  assertSameOrganization(actor, caseRecord.organizationId);

  const clientParty = caseRecord.parties.find((p) => p.role === 'CLIENT');
  const opposingParty = caseRecord.parties.find((p) => p.role === 'OPPOSING_PARTY');
  const assignableUsers = caseRecord.assignments.map((a) => ({
    id: a.user.id,
    label: a.user.fullNameAr ?? a.user.fullName,
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="ds-card-elevated flex flex-col gap-6 p-7 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <span className="ds-kicker">قضية رقم {caseRecord.caseNumber}</span>
          <h1 className="mt-2 font-display text-2xl font-bold text-charcoal-900">{caseRecord.title}</h1>
          <p className="mt-2 text-sm text-neutral-500">
            {clientParty?.name ?? clientParty?.client?.fullName ?? 'عميلنا'}
            {opposingParty ? ` × ${opposingParty.name}` : ''}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <CaseStatusBadge status={caseRecord.status} />
            <RiskBadge level={caseRecord.riskLevel} />
            {caseRecord.practiceArea && (
              <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-600">
                {caseRecord.practiceArea.nameAr}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-8">
          <CaseStrengthGauge score={caseRecord.strengthScore ?? 50} />
          <div className="text-sm">
            <div className="text-neutral-500">قيمة المطالبة</div>
            <div className="mt-1 font-display text-xl font-bold text-charcoal-900">
              {caseRecord.claimAmount ? formatSAR(Number(caseRecord.claimAmount)) : '—'}
            </div>
            <div className="mt-3 text-neutral-500">فُتحت في</div>
            <div className="mt-1 text-charcoal-700">{formatArabicDate(caseRecord.openedAt)}</div>
          </div>
        </div>
      </div>

      <Tabs
        defaultKey="overview"
        items={[
          {
            key: 'overview',
            label: 'نظرة عامة',
            content: (
              <div className="grid gap-6 md:grid-cols-2">
                <div className="ds-card p-6">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-charcoal-900">
                    <Users className="h-4 w-4 text-neutral-400" strokeWidth={1.5} /> الأطراف
                  </h3>
                  {caseRecord.parties.length === 0 ? (
                    <p className="text-sm text-neutral-500">لا توجد أطراف مسجّلة بعد.</p>
                  ) : (
                    <ul className="space-y-2 text-sm text-charcoal-700">
                      {caseRecord.parties.map((p) => (
                        <li key={p.id} className="flex items-center justify-between">
                          <span>{p.name}</span>
                          <span className="text-xs text-neutral-400">{p.role}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="ds-card p-6">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-charcoal-900">
                    <Scale className="h-4 w-4 text-neutral-400" strokeWidth={1.5} /> الملخص
                  </h3>
                  <p className="text-sm leading-7 text-neutral-600">
                    قضية {caseRecord.practiceArea?.nameAr ?? 'قانونية'} بحالة {caseRecord.status}، بمخاطر{' '}
                    {caseRecord.riskLevel}. راجع تبويب &quot;تحليل AI&quot; للحصول على موجز مساعد للقضية (يتطلب مراجعة بشرية).
                  </p>
                </div>
              </div>
            ),
          },
          {
            key: 'parties',
            label: 'الأطراف',
            content: (
              <div className="ds-card divide-y divide-neutral-100">
                {caseRecord.parties.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-5">
                    <div>
                      <p className="text-sm font-medium text-charcoal-900">{p.name}</p>
                      {p.notes && <p className="mt-1 text-xs text-neutral-500">{p.notes}</p>}
                    </div>
                    <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-600">{p.role}</span>
                  </div>
                ))}
              </div>
            ),
          },
          {
            key: 'documents',
            label: 'المستندات',
            content: (
              <div className="space-y-4">
                <NewDocumentUploader caseId={caseRecord.id} />
                <div className="ds-card overflow-hidden">
                {caseRecord.documents.length === 0 ? (
                  <EmptyState icon={FileText} title="لا توجد مستندات مرفوعة بعد" />
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-neutral-50 text-right text-xs text-neutral-500">
                      <tr>
                        <th className="px-5 py-3 font-medium">العنوان</th>
                        <th className="px-5 py-3 font-medium">الحالة</th>
                        <th className="px-5 py-3 font-medium">آخر تحديث</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {caseRecord.documents.map((d) => (
                        <tr key={d.id}>
                          <td className="px-5 py-3 font-medium text-charcoal-900">{d.title}</td>
                          <td className="px-5 py-3 text-xs text-neutral-500">{d.status}</td>
                          <td className="px-5 py-3 text-xs text-neutral-500">{formatArabicDate(d.updatedAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                </div>
              </div>
            ),
          },
          {
            key: 'timeline',
            label: 'الخط الزمني',
            content: <div className="ds-card p-7"><CaseTimeline events={caseRecord.timelineEvents} /></div>,
          },
          {
            key: 'sessions',
            label: 'الجلسات',
            content: (
              <div className="space-y-4">
                <NewHearingForm caseId={caseRecord.id} attendees={assignableUsers} />
                {caseRecord.hearings.length === 0 ? (
                  <EmptyState icon={CalendarClock} title="لا توجد جلسات مجدولة" />
                ) : (
                  <div className="space-y-3">
                    {caseRecord.hearings.map((h) => (
                      <div key={h.id} className="ds-card flex items-center justify-between p-5">
                        <div>
                          <p className="text-sm font-medium text-charcoal-900">{h.courtName ?? 'محكمة غير محددة'}</p>
                          <p className="mt-1 text-xs text-neutral-500">{h.location}</p>
                        </div>
                        <span className="text-xs text-gold-600">{formatArabicDateTime(h.scheduledAt)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ),
          },
          {
            key: 'tasks',
            label: 'المهام',
            content: (
              <div className="space-y-4">
                <NewTaskForm caseId={caseRecord.id} assignees={assignableUsers} />
                {caseRecord.tasks.length === 0 ? (
                  <EmptyState icon={ListChecks} title="لا توجد مهام مرتبطة بهذه القضية" />
                ) : (
                  <div className="ds-card divide-y divide-neutral-100">
                    {caseRecord.tasks.map((t) => (
                      <div key={t.id} className="flex items-center justify-between p-5">
                        <div>
                          <p className="text-sm font-medium text-charcoal-900">{t.title}</p>
                          <p className="mt-1 text-xs text-neutral-500">
                            {t.assignee?.fullNameAr ?? t.assignee?.fullName ?? 'غير مُسندة'}
                          </p>
                        </div>
                        <TaskStatusBadge status={t.status} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ),
          },
          {
            key: 'financials',
            label: 'المالية',
            content:
              caseRecord.invoices.length === 0 ? (
                <EmptyState icon={FileText} title="لا توجد فواتير مرتبطة بهذه القضية" />
              ) : (
                <div className="ds-card overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-neutral-50 text-right text-xs text-neutral-500">
                      <tr>
                        <th className="px-5 py-3 font-medium">رقم الفاتورة</th>
                        <th className="px-5 py-3 font-medium">المبلغ</th>
                        <th className="px-5 py-3 font-medium">الحالة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {caseRecord.invoices.map((inv) => (
                        <tr key={inv.id}>
                          <td className="px-5 py-3 font-mono text-xs text-neutral-500">{inv.invoiceNumber}</td>
                          <td className="px-5 py-3 font-medium text-charcoal-900">{formatSAR(Number(inv.totalAmount))}</td>
                          <td className="px-5 py-3 text-xs text-neutral-500">{inv.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ),
          },
          {
            key: 'communications',
            label: 'المراسلات',
            content:
              caseRecord.messages.length === 0 ? (
                <EmptyState icon={MessageSquare} title="لا توجد محادثات مرتبطة بهذه القضية بعد" />
              ) : (
                <div className="space-y-3">
                  {caseRecord.messages.flatMap((c) => c.messages).map((m) => (
                    <div key={m.id} className="ds-card p-4 text-sm text-charcoal-700">
                      {m.body}
                    </div>
                  ))}
                </div>
              ),
          },
          {
            key: 'ai',
            label: 'تحليل AI',
            content: <AIActionsPanel caseId={caseRecord.id} />,
          },
        ]}
      />
    </div>
  );
}

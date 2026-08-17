import { getActor } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { StatCard } from '@/components/ui/stat-card';
import { EmptyState } from '@/components/ui/empty-state';
import { CaseStatusBadge, RiskBadge } from '@/components/ui/status-indicator';
import { rankTodaysPriorities } from '@/lib/priority-engine';
import { formatArabicDateTime } from '@/lib/utils';
import Link from 'next/link';
import {
  Briefcase,
  CalendarClock,
  ListChecks,
  FileWarning,
  Wallet,
  MessageSquare,
  AlertTriangle,
} from 'lucide-react';

export default async function LawyerDashboard() {
  const actor = await getActor();
  if (!actor) return null;

  const assignedCaseIds = (
    await prisma.caseAssignment.findMany({
      where: { userId: actor.userId },
      select: { caseId: true },
    })
  ).map((a) => a.caseId);

  const [activeCases, upcomingHearings, urgentTasks, pendingDocuments, unpaidInvoices, unreadMessages] =
    await Promise.all([
      prisma.case.findMany({
        where: { id: { in: assignedCaseIds }, status: { in: ['ACTIVE', 'IN_COURT', 'SETTLEMENT'] } },
        orderBy: { updatedAt: 'desc' },
        take: 6,
      }),
      prisma.hearing.findMany({
        where: { caseId: { in: assignedCaseIds }, scheduledAt: { gte: new Date() } },
        orderBy: { scheduledAt: 'asc' },
        take: 5,
        include: { case: true },
      }),
      prisma.caseTask.findMany({
        where: { assigneeId: actor.userId, status: { in: ['TODO', 'IN_PROGRESS', 'BLOCKED'] } },
        include: { case: { select: { title: true, riskLevel: true } } },
        take: 20,
      }),
      prisma.document.count({
        where: { caseId: { in: assignedCaseIds }, status: 'REQUIRED' },
      }),
      prisma.invoice.count({
        where: { caseId: { in: assignedCaseIds }, status: { in: ['SENT', 'OVERDUE', 'PARTIALLY_PAID'] } },
      }),
      prisma.notification.count({
        where: { userId: actor.userId, status: { in: ['SENT', 'PENDING'] } },
      }),
    ]);

  const priorities = rankTodaysPriorities(
    urgentTasks.map((t) => ({
      id: t.id,
      title: t.title,
      priority: t.priority,
      dueAt: t.dueAt,
      caseRiskLevel: t.case?.riskLevel,
      caseTitle: t.case?.title,
    })),
  ).slice(0, 6);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-2xl font-bold text-charcoal-900">مرحبًا بعودتك</h1>
        <p className="mt-1 text-sm text-neutral-500">هذا ملخص يومك القانوني اليوم.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="القضايا النشطة" value={String(activeCases.length)} icon={Briefcase} />
        <StatCard label="الجلسات القادمة" value={String(upcomingHearings.length)} icon={CalendarClock} />
        <StatCard label="المهام العاجلة" value={String(urgentTasks.length)} icon={ListChecks} tone="gold" />
        <StatCard label="مستندات مطلوبة" value={String(pendingDocuments)} icon={FileWarning} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Today's Priorities */}
        <section className="ds-card p-6 lg:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-charcoal-900">أولويات اليوم</h2>
            <span className="text-xs text-neutral-400">مرتّبة حسب الإلحاح والأهمية ومخاطر القضية</span>
          </div>
          {priorities.length === 0 ? (
            <EmptyState icon={ListChecks} title="لا توجد مهام عاجلة اليوم" description="استمتع بيوم أكثر هدوءًا." />
          ) : (
            <ul className="space-y-3">
              {priorities.map((t) => (
                <li key={t.id} className="flex items-start justify-between gap-4 rounded-md border border-neutral-200 p-4">
                  <div>
                    <p className="text-sm font-medium text-charcoal-900">{t.title}</p>
                    <p className="mt-1 text-xs text-neutral-500">{t.reason}</p>
                    {t.caseTitle && <p className="mt-1 text-[11px] text-gold-600">{t.caseTitle}</p>}
                  </div>
                  {t.dueAt && (
                    <span className="shrink-0 text-[11px] text-neutral-400">{formatArabicDateTime(t.dueAt)}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Upcoming Sessions */}
        <section className="ds-card p-6">
          <h2 className="mb-5 font-display text-base font-bold text-charcoal-900">الجلسات القادمة</h2>
          {upcomingHearings.length === 0 ? (
            <EmptyState icon={CalendarClock} title="لا توجد جلسات مجدولة" />
          ) : (
            <ul className="space-y-4">
              {upcomingHearings.map((h) => (
                <li key={h.id} className="border-b border-neutral-100 pb-4 last:border-0 last:pb-0">
                  <p className="text-sm font-medium text-charcoal-900">{h.case.title}</p>
                  <p className="mt-1 text-xs text-neutral-500">{h.courtName ?? 'محكمة غير محددة'}</p>
                  <p className="mt-1 text-xs text-gold-600">{formatArabicDateTime(h.scheduledAt)}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="ds-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <Wallet className="h-4 w-4 text-neutral-400" strokeWidth={1.5} />
            <h3 className="text-sm font-semibold text-charcoal-900">مدفوعات مستحقة</h3>
          </div>
          <p className="font-display text-2xl font-bold text-charcoal-900">{unpaidInvoices}</p>
          <p className="mt-1 text-xs text-neutral-500">فاتورة بحاجة لمتابعة</p>
        </section>

        <section className="ds-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-neutral-400" strokeWidth={1.5} />
            <h3 className="text-sm font-semibold text-charcoal-900">رسائل غير مقروءة</h3>
          </div>
          <p className="font-display text-2xl font-bold text-charcoal-900">{unreadMessages}</p>
          <Link href="/messages" className="mt-1 inline-block text-xs text-gold-600 hover:underline">
            عرض الرسائل
          </Link>
        </section>

        <section className="ds-card border-warning/20 bg-warning/5 p-6">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" strokeWidth={1.5} />
            <h3 className="text-sm font-semibold text-charcoal-900">قضايا عالية المخاطر</h3>
          </div>
          <ul className="space-y-2">
            {activeCases.filter((c) => c.riskLevel === 'HIGH' || c.riskLevel === 'CRITICAL').slice(0, 3).map((c) => (
              <li key={c.id} className="flex items-center justify-between text-xs">
                <Link href={`/cases/${c.id}`} className="text-charcoal-800 hover:text-gold-600">
                  {c.title}
                </Link>
                <RiskBadge level={c.riskLevel} />
              </li>
            ))}
            {activeCases.filter((c) => c.riskLevel === 'HIGH' || c.riskLevel === 'CRITICAL').length === 0 && (
              <p className="text-xs text-neutral-500">لا توجد قضايا عالية المخاطر حاليًا.</p>
            )}
          </ul>
        </section>
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-base font-bold text-charcoal-900">القضايا النشطة</h2>
          <Link href="/cases" className="text-xs font-medium text-gold-600 hover:underline">
            عرض الكل
          </Link>
        </div>
        {activeCases.length === 0 ? (
          <EmptyState icon={Briefcase} title="لا توجد قضايا نشطة مُسندة إليك حاليًا" />
        ) : (
          <div className="ds-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 text-right text-xs text-neutral-500">
                <tr>
                  <th className="px-5 py-3 font-medium">رقم القضية</th>
                  <th className="px-5 py-3 font-medium">العنوان</th>
                  <th className="px-5 py-3 font-medium">الحالة</th>
                  <th className="px-5 py-3 font-medium">قوة القضية</th>
                  <th className="px-5 py-3 font-medium">المخاطر</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {activeCases.map((c) => (
                  <tr key={c.id} className="transition-premium hover:bg-neutral-50">
                    <td className="px-5 py-3 font-mono text-xs text-neutral-500">{c.caseNumber}</td>
                    <td className="px-5 py-3">
                      <Link href={`/cases/${c.id}`} className="font-medium text-charcoal-900 hover:text-gold-600">
                        {c.title}
                      </Link>
                    </td>
                    <td className="px-5 py-3"><CaseStatusBadge status={c.status} /></td>
                    <td className="px-5 py-3 text-xs text-neutral-600">{c.strengthScore ?? '—'} / 100</td>
                    <td className="px-5 py-3"><RiskBadge level={c.riskLevel} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

import { getActor } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { EmptyState } from '@/components/ui/empty-state';
import { CaseStatusBadge, InvoiceStatusBadge } from '@/components/ui/status-indicator';
import { formatSAR, formatArabicDateTime } from '@/lib/utils';
import { DocumentUploadButton } from '@/components/case/document-upload-button';
import Link from 'next/link';
import { Briefcase, CalendarClock, FileWarning, Receipt } from 'lucide-react';

export default async function ClientDashboard() {
  const actor = await getActor();
  if (!actor || !actor.clientId) {
    return (
      <EmptyState
        icon={Briefcase}
        title="لا يوجد ملف عميل مرتبط بحسابك"
        description="يرجى التواصل مع مكتبنا لربط حسابك بملفك كعميل."
      />
    );
  }

  const [caseParties, invoices] = await Promise.all([
    prisma.caseParty.findMany({
      where: { clientId: actor.clientId, role: 'CLIENT' },
      include: {
        case: {
          include: {
            hearings: { where: { scheduledAt: { gte: new Date() } }, orderBy: { scheduledAt: 'asc' }, take: 3 },
            documents: { where: { status: 'REQUIRED' } },
            tasks: { where: { status: { in: ['TODO', 'IN_PROGRESS'] } } },
          },
        },
      },
    }),
    prisma.invoice.findMany({
      where: { clientId: actor.clientId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ]);

  const myCases = caseParties.map((cp) => cp.case);
  const requiredDocs = myCases.flatMap((c) => c.documents.map((d) => ({ ...d, caseTitle: c.title, caseId: c.id })));
  const upcomingHearings = myCases.flatMap((c) => c.hearings.map((h) => ({ ...h, caseTitle: c.title })));

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-2xl font-bold text-charcoal-900">مرحبًا بك في بوابتك الخاصة</h1>
        <p className="mt-1 text-sm text-neutral-500">تابع قضاياك ومستنداتك وفواتيرك في مكان واحد وآمن.</p>
      </div>

      {/* Required documents — أهم تنبيه للعميل */}
      {requiredDocs.length > 0 && (
        <section className="ds-card border-gold-500/30 bg-gold-500/5 p-6">
          <div className="mb-4 flex items-center gap-2">
            <FileWarning className="h-4 w-4 text-gold-600" strokeWidth={1.5} />
            <h2 className="font-display text-base font-bold text-charcoal-900">مستندات مطلوبة منك</h2>
          </div>
          <ul className="space-y-3">
            {requiredDocs.map((d) => (
              <li key={d.id} className="flex items-center justify-between rounded-md bg-white p-4 shadow-subtle">
                <div>
                  <p className="text-sm font-medium text-charcoal-900">{d.title}</p>
                  <p className="mt-1 text-xs text-neutral-500">للقضية: {d.caseTitle}</p>
                </div>
                <DocumentUploadButton title={d.title} caseId={d.caseId} documentId={d.id} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="mb-4 font-display text-base font-bold text-charcoal-900">قضاياي</h2>
          {myCases.length === 0 ? (
            <EmptyState icon={Briefcase} title="لا توجد قضايا مرتبطة بك حاليًا" />
          ) : (
            <div className="space-y-3">
              {myCases.map((c) => (
                <Link
                  key={c.id}
                  href={`/cases/${c.id}`}
                  className="ds-card flex items-center justify-between p-5 transition-premium hover:shadow-card"
                >
                  <div>
                    <p className="text-sm font-medium text-charcoal-900">{c.title}</p>
                    <p className="mt-1 font-mono text-xs text-neutral-400">{c.caseNumber}</p>
                  </div>
                  <CaseStatusBadge status={c.status} />
                </Link>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-4 font-display text-base font-bold text-charcoal-900">الجلسات القادمة</h2>
          {upcomingHearings.length === 0 ? (
            <EmptyState icon={CalendarClock} title="لا توجد جلسات مجدولة حاليًا" />
          ) : (
            <div className="space-y-3">
              {upcomingHearings.map((h) => (
                <div key={h.id} className="ds-card p-5">
                  <p className="text-sm font-medium text-charcoal-900">{h.caseTitle}</p>
                  <p className="mt-1 text-xs text-gold-600">{formatArabicDateTime(h.scheduledAt)}</p>
                  <p className="mt-1 text-xs text-neutral-500">{h.courtName ?? 'محكمة غير محددة'}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-base font-bold text-charcoal-900">الفواتير الأخيرة</h2>
          <Link href="/billing" className="text-xs font-medium text-gold-600 hover:underline">
            عرض الكل
          </Link>
        </div>
        {invoices.length === 0 ? (
          <EmptyState icon={Receipt} title="لا توجد فواتير حتى الآن" />
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
                {invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td className="px-5 py-3 font-mono text-xs text-neutral-500">{inv.invoiceNumber}</td>
                    <td className="px-5 py-3 font-medium text-charcoal-900">{formatSAR(Number(inv.totalAmount))}</td>
                    <td className="px-5 py-3"><InvoiceStatusBadge status={inv.status} /></td>
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

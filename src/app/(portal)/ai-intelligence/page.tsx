import Link from 'next/link';
import { getActor } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { assertPermission } from '@/lib/rbac/can';
import { PERMISSIONS } from '@/lib/rbac/permissions';
import { EmptyState } from '@/components/ui/empty-state';
import { Badge } from '@/components/ui/badge';
import { formatArabicDateTime } from '@/lib/utils';
import { Sparkles, ShieldAlert } from 'lucide-react';

const TYPE_LABELS: Record<string, string> = {
  CASE_BRIEF: 'موجز القضية',
  TIMELINE_EXTRACTION: 'استخراج الخط الزمني',
  CONTRADICTION_DETECTION: 'اكتشاف التناقضات',
  MISSING_EVIDENCE: 'أدلة ناقصة',
  RISK_ANALYSIS: 'تحليل المخاطر',
  RESEARCH_QUESTIONS: 'أسئلة بحث',
  DOCUMENT_EXTRACTION: 'استخراج من مستند',
  LEGAL_RESEARCH: 'بحث قانوني',
};

export default async function AIIntelligenceHub() {
  const actor = await getActor();
  if (!actor) return null;
  assertPermission(actor, PERMISSIONS.AI_RUN_ANALYSIS);

  const analyses = await prisma.aIAnalysis.findMany({
    where: { case: { organizationId: actor.organizationId } },
    include: { case: { select: { id: true, title: true } } },
    orderBy: { createdAt: 'desc' },
    take: 30,
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-charcoal-900">الذكاء الاصطناعي القانوني</h1>
        <p className="mt-1 max-w-2xl text-sm leading-7 text-neutral-500">
          سجل كل التحليلات الآلية المُنشأة عبر قضاياك. كل نتيجة هنا تحتاج مراجعة واعتماد محامٍ مرخّص.
        </p>
      </div>

      <div className="flex items-start gap-3 rounded-md border border-info/20 bg-info/5 p-4">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-info" strokeWidth={1.5} />
        <p className="text-xs leading-6 text-charcoal-700">
          الذكاء الاصطناعي في هذه المنصة أداة مساعدة للمحامي فقط، ولا يحل محله في أي قرار قانوني.
        </p>
      </div>

      {analyses.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="لم يتم تشغيل أي تحليل بعد"
          description="افتح أي قضية وانتقل إلى تبويب «تحليل AI» لبدء أول تحليل."
        />
      ) : (
        <div className="ds-card divide-y divide-neutral-100">
          {analyses.map((a) => (
            <div key={a.id} className="flex items-center justify-between p-5">
              <div>
                <div className="flex items-center gap-2">
                  <Badge tone="info">{TYPE_LABELS[a.type] ?? a.type}</Badge>
                  {a.requiresHumanReview && !a.reviewedAt && <Badge tone="warning">بانتظار المراجعة</Badge>}
                </div>
                {a.case && (
                  <Link href={`/cases/${a.case.id}`} className="mt-2 block text-sm font-medium text-charcoal-900 hover:text-gold-600">
                    {a.case.title}
                  </Link>
                )}
              </div>
              <span className="text-xs text-neutral-400">{formatArabicDateTime(a.createdAt)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

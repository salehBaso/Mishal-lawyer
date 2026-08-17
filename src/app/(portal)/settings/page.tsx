import Link from 'next/link';
import { getActor } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { can } from '@/lib/rbac/can';
import { Badge } from '@/components/ui/badge';
import { ROLE_LABELS, PERMISSIONS } from '@/lib/rbac/permissions';

const INTEGRATION_LABELS: Record<string, string> = {
  NAJIZ: 'ناجز (وزارة العدل)',
  PAYMENT_MOYASAR: 'ميسر — الدفع',
  PAYMENT_HYPERPAY: 'HyperPay — الدفع',
  PAYMENT_TAP: 'Tap — الدفع',
  PAYMENT_STRIPE: 'Stripe — الدفع',
  AI_ANTHROPIC: 'Anthropic Claude — الذكاء الاصطناعي',
  AI_OPENAI: 'OpenAI — الذكاء الاصطناعي',
  EMAIL_RESEND: 'Resend — البريد الإلكتروني',
  SMS: 'الرسائل النصية',
  WHATSAPP: 'واتساب للأعمال',
};

const STATUS_TONE: Record<string, 'neutral' | 'success' | 'warning' | 'danger'> = {
  NOT_CONFIGURED: 'neutral',
  SANDBOX: 'warning',
  ACTIVE: 'success',
  ERROR: 'danger',
  DISABLED: 'neutral',
};

const STATUS_LABELS: Record<string, string> = {
  NOT_CONFIGURED: 'غير مُهيّأ',
  SANDBOX: 'بيئة تجريبية',
  ACTIVE: 'مفعّل',
  ERROR: 'خطأ',
  DISABLED: 'معطّل',
};

export default async function SettingsPage() {
  const actor = await getActor();
  if (!actor) return null;

  const [org, practiceAreas, integrations] = await Promise.all([
    prisma.organization.findUnique({ where: { id: actor.organizationId } }),
    prisma.practiceArea.findMany({ where: { organizationId: actor.organizationId }, orderBy: { sortOrder: 'asc' } }),
    prisma.integration.findMany({ where: { organizationId: actor.organizationId } }),
  ]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-2xl font-bold text-charcoal-900">الإعدادات</h1>
        <p className="mt-1 text-sm text-neutral-500">إعدادات المكتب والتكاملات الخارجية.</p>
      </div>

      <section className="ds-card p-6">
        <h2 className="mb-4 font-display text-base font-bold text-charcoal-900">معلومات المكتب</h2>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div><dt className="text-neutral-500">الاسم</dt><dd className="mt-1 text-charcoal-900">{org?.nameAr}</dd></div>
          <div><dt className="text-neutral-500">دورك الحالي</dt><dd className="mt-1 text-charcoal-900">{ROLE_LABELS[actor.role].ar}</dd></div>
        </dl>
      </section>

      <section className="ds-card p-6">
        <h2 className="mb-4 font-display text-base font-bold text-charcoal-900">مجالات الممارسة</h2>
        <div className="flex flex-wrap gap-2">
          {practiceAreas.map((p) => (
            <Badge key={p.id} tone="neutral">{p.nameAr}</Badge>
          ))}
        </div>
      </section>

      <section className="ds-card p-6">
        <h2 className="mb-1 font-display text-base font-bold text-charcoal-900">التكاملات</h2>
        <p className="mb-4 text-xs text-neutral-500">
          حالة الاتصال بمزودي الخدمة الخارجيين. يتم ضبط بيانات الاعتماد عبر متغيرات البيئة فقط، ولا تُعرض هنا.
        </p>
        <div className="divide-y divide-neutral-100">
          {integrations.map((i) => (
            <div key={i.id} className="flex items-center justify-between py-3">
              <span className="text-sm text-charcoal-800">{INTEGRATION_LABELS[i.kind] ?? i.kind}</span>
              <Badge tone={STATUS_TONE[i.status]}>{STATUS_LABELS[i.status]}</Badge>
            </div>
          ))}
        </div>
      </section>

      {can(actor, PERMISSIONS.ADMIN_VIEW_AUDIT_LOG) && (
        <section className="ds-card p-6">
          <h2 className="mb-2 font-display text-base font-bold text-charcoal-900">سجل التدقيق</h2>
          <p className="mb-4 text-xs text-neutral-500">سجل غير قابل للتعديل لكل الإجراءات الحساسة على المنصة.</p>
          <Link href="/settings/audit-log" className="text-sm font-medium text-gold-600 hover:underline">
            عرض سجل التدقيق الكامل ←
          </Link>
        </section>
      )}
    </div>
  );
}

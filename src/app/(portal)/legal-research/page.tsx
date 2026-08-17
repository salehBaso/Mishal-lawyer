import { getActor } from '@/lib/auth';
import { assertPermission } from '@/lib/rbac/can';
import { PERMISSIONS } from '@/lib/rbac/permissions';
import { LegalResearchForm } from '@/components/case/legal-research-form';
import { ShieldAlert } from 'lucide-react';

export default async function LegalResearchPage() {
  const actor = await getActor();
  if (!actor) return null;
  assertPermission(actor, PERMISSIONS.AI_LEGAL_RESEARCH);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-charcoal-900">البحث القانوني</h1>
        <p className="mt-1 max-w-2xl text-sm leading-7 text-neutral-500">
          اطرح سؤالك القانوني وستُبنى النتيجة من مصادر موثوقة فقط. لا يقوم النظام باختراع نصوص
          نظامية أو أحكام قضائية؛ إن لم يتوفر مصدر كافٍ، سيصرّح بذلك بوضوح.
        </p>
      </div>

      <div className="flex items-start gap-3 rounded-md border border-info/20 bg-info/5 p-4">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-info" strokeWidth={1.5} />
        <p className="text-xs leading-6 text-charcoal-700">
          نتائج هذه الأداة مساعدة فقط ولا تُغني عن البحث القانوني المتعمّق والمراجعة من محامٍ مرخّص.
        </p>
      </div>

      <LegalResearchForm />
    </div>
  );
}

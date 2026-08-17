'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { createCaseAction, type ActionResult } from '@/app/(portal)/cases/actions';
import { FormField, inputClass } from '@/components/ui/form-field';
import { Button } from '@/components/ui/button';

interface Option {
  id: string;
  label: string;
}

const initialState: ActionResult = { success: false };

export function NewCaseForm({
  practiceAreas,
  clients,
  lawyers,
}: {
  practiceAreas: Option[];
  clients: Option[];
  lawyers: Option[];
}) {
  const [state, formAction] = useFormState(createCaseAction, initialState);

  return (
    <form action={formAction} className="ds-card space-y-5 p-6">
      <FormField label="عنوان القضية" htmlFor="title" required error={state.errors?.title}>
        <input id="title" name="title" required className={inputClass} placeholder="مثال: نزاع عقد توريد" />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="التخصص" htmlFor="practiceAreaId" required error={state.errors?.practiceAreaId}>
          <select id="practiceAreaId" name="practiceAreaId" required className={inputClass} defaultValue="">
            <option value="" disabled>اختر التخصص</option>
            {practiceAreas.map((p) => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>
        </FormField>

        <FormField label="مستوى المخاطر" htmlFor="riskLevel">
          <select id="riskLevel" name="riskLevel" className={inputClass} defaultValue="MEDIUM">
            <option value="LOW">منخفضة</option>
            <option value="MEDIUM">متوسطة</option>
            <option value="HIGH">مرتفعة</option>
            <option value="CRITICAL">حرجة</option>
          </select>
        </FormField>
      </div>

      <FormField label="العميل (الطرف الذي نمثّله)" htmlFor="clientId" required error={state.errors?.clientId}>
        <select id="clientId" name="clientId" required className={inputClass} defaultValue="">
          <option value="" disabled>اختر العميل</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
      </FormField>

      <FormField label="الطرف المقابل (اختياري)" htmlFor="opposingPartyName">
        <input id="opposingPartyName" name="opposingPartyName" className={inputClass} placeholder="اسم الطرف الآخر في النزاع" />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="المحكمة (اختياري)" htmlFor="courtName">
          <input id="courtName" name="courtName" className={inputClass} placeholder="مثال: المحكمة التجارية بالرياض" />
        </FormField>
        <FormField label="قيمة المطالبة بالريال (اختياري)" htmlFor="claimAmount" error={state.errors?.claimAmount}>
          <input id="claimAmount" name="claimAmount" type="number" min={0} step={100} className={inputClass} />
        </FormField>
      </div>

      <FormField label="المحامي المسؤول" htmlFor="leadLawyerId" required error={state.errors?.leadLawyerId}>
        <select id="leadLawyerId" name="leadLawyerId" required className={inputClass} defaultValue="">
          <option value="" disabled>اختر المحامي</option>
          {lawyers.map((l) => (
            <option key={l.id} value={l.id}>{l.label}</option>
          ))}
        </select>
      </FormField>

      {state.message && <p className="text-sm text-danger">{state.message}</p>}

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? 'جارٍ الحفظ…' : 'إنشاء القضية'}
    </Button>
  );
}

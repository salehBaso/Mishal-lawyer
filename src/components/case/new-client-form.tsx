'use client';

import { useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { createClientAction } from '@/app/(portal)/clients/actions';
import type { ActionResult } from '@/app/(portal)/cases/actions';
import { FormField, inputClass } from '@/components/ui/form-field';
import { Button } from '@/components/ui/button';

const initialState: ActionResult = { success: false };

export function NewClientForm() {
  const [state, formAction] = useFormState(createClientAction, initialState);
  const [type, setType] = useState<'INDIVIDUAL' | 'CORPORATE'>('INDIVIDUAL');

  return (
    <form action={formAction} className="ds-card space-y-5 p-6">
      <FormField label="نوع العميل" htmlFor="type">
        <select
          id="type"
          name="type"
          className={inputClass}
          value={type}
          onChange={(e) => setType(e.target.value as 'INDIVIDUAL' | 'CORPORATE')}
        >
          <option value="INDIVIDUAL">فرد</option>
          <option value="CORPORATE">شركة / مؤسسة</option>
        </select>
      </FormField>

      <FormField
        label={type === 'CORPORATE' ? 'اسم ممثل الشركة' : 'الاسم الكامل'}
        htmlFor="fullName"
        required
        error={state.errors?.fullName}
      >
        <input id="fullName" name="fullName" required className={inputClass} />
      </FormField>

      {type === 'CORPORATE' && (
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="اسم الشركة" htmlFor="companyName" required error={state.errors?.companyName}>
            <input id="companyName" name="companyName" className={inputClass} />
          </FormField>
          <FormField label="رقم السجل التجاري" htmlFor="commercialRegNo">
            <input id="commercialRegNo" name="commercialRegNo" className={inputClass} />
          </FormField>
        </div>
      )}

      {type === 'INDIVIDUAL' && (
        <FormField label="رقم الهوية الوطنية / الإقامة" htmlFor="nationalId">
          <input id="nationalId" name="nationalId" className={inputClass} />
        </FormField>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="البريد الإلكتروني" htmlFor="email" error={state.errors?.email}>
          <input id="email" name="email" type="email" dir="ltr" className={inputClass} />
        </FormField>
        <FormField label="رقم الجوال" htmlFor="phone" error={state.errors?.phone} hint="مثال: 0512345678">
          <input id="phone" name="phone" dir="ltr" className={inputClass} />
        </FormField>
      </div>

      <FormField label="ملاحظات (اختياري)" htmlFor="notes">
        <textarea id="notes" name="notes" rows={3} className={inputClass} />
      </FormField>

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? 'جارٍ الحفظ…' : 'إضافة العميل'}
    </Button>
  );
}

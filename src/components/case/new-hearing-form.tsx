'use client';

import { useEffect, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { toast } from 'sonner';
import { createHearingAction } from '@/app/(portal)/cases/[caseId]/task-hearing-actions';
import type { ActionResult } from '@/app/(portal)/cases/actions';
import { FormField, inputClass } from '@/components/ui/form-field';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const initialState: ActionResult = { success: false };

interface Attendee {
  id: string;
  label: string;
}

export function NewHearingForm({ caseId, attendees }: { caseId: string; attendees: Attendee[] }) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useFormState(createHearingAction, initialState);

  useEffect(() => {
    if (state.success) {
      toast.success('تمت جدولة الجلسة بنجاح');
      setOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  if (!open) {
    return (
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" strokeWidth={1.75} />
        جلسة جديدة
      </Button>
    );
  }

  return (
    <form action={formAction} className="ds-card space-y-4 p-5">
      <input type="hidden" name="caseId" value={caseId} />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="التاريخ والوقت" htmlFor="scheduledAt" required error={state.errors?.scheduledAt}>
          <input id="scheduledAt" name="scheduledAt" type="datetime-local" required className={inputClass} />
        </FormField>
        <FormField label="المدة (بالدقائق)" htmlFor="durationMin">
          <input id="durationMin" name="durationMin" type="number" min={15} step={15} defaultValue={60} className={inputClass} />
        </FormField>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="المحكمة" htmlFor="courtName">
          <input id="courtName" name="courtName" className={inputClass} />
        </FormField>
        <FormField label="الموقع / القاعة" htmlFor="location">
          <input id="location" name="location" className={inputClass} />
        </FormField>
      </div>
      <FormField label="الحاضر عن المكتب" htmlFor="attendeeUserId" required error={state.errors?.attendeeUserId}>
        <select id="attendeeUserId" name="attendeeUserId" required className={inputClass} defaultValue="">
          <option value="" disabled>اختر المحامي الحاضر</option>
          {attendees.map((a) => (
            <option key={a.id} value={a.id}>{a.label}</option>
          ))}
        </select>
      </FormField>
      <div className="flex gap-3">
        <SubmitButton />
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>إلغاء</Button>
      </div>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" size="sm" disabled={pending}>{pending ? 'جارٍ الحفظ…' : 'حفظ الجلسة'}</Button>;
}

'use client';

import { useEffect, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { toast } from 'sonner';
import { requestMarketplaceServiceAction } from '@/app/(portal)/marketplace/actions';
import type { ActionResult } from '@/app/(portal)/cases/actions';
import { FormField, inputClass } from '@/components/ui/form-field';
import { Button } from '@/components/ui/button';

const initialState: ActionResult = { success: false };

export function RequestServiceForm({ providerId, serviceId }: { providerId: string; serviceId?: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useFormState(requestMarketplaceServiceAction, initialState);

  useEffect(() => {
    if (state.success) {
      toast.success(state.message ?? 'تم إرسال الطلب بنجاح');
      setOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  if (!open) {
    return <Button variant="gold" onClick={() => setOpen(true)}>طلب خدمة</Button>;
  }

  return (
    <form action={formAction} className="ds-card w-full max-w-md space-y-4 p-5">
      <input type="hidden" name="providerId" value={providerId} />
      {serviceId && <input type="hidden" name="serviceId" value={serviceId} />}
      <FormField label="وصف موجز للطلب" htmlFor="brief" required error={state.errors?.brief}>
        <textarea id="brief" name="brief" rows={4} required className={inputClass} placeholder="اشرح ما تحتاجه من هذا المزوّد..." />
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
  return <Button type="submit" size="sm" disabled={pending}>{pending ? 'جارٍ الإرسال…' : 'إرسال الطلب'}</Button>;
}

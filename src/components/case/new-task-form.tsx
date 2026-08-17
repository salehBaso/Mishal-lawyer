'use client';

import { useEffect, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { toast } from 'sonner';
import { createTaskAction } from '@/app/(portal)/cases/[caseId]/task-hearing-actions';
import type { ActionResult } from '@/app/(portal)/cases/actions';
import { FormField, inputClass } from '@/components/ui/form-field';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const initialState: ActionResult = { success: false };

interface Assignee {
  id: string;
  label: string;
}

export function NewTaskForm({ caseId, assignees }: { caseId: string; assignees: Assignee[] }) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useFormState(createTaskAction, initialState);

  useEffect(() => {
    if (state.success) {
      toast.success('تمت إضافة المهمة بنجاح');
      setOpen(false);
    }
    // نعتمد على مرجع state بالكامل (وليس state.success فقط) لأن useFormState
    // يُرجع كائنًا جديدًا في كل إرسال ناجح، حتى لو ظلّت success=true من المرة السابقة.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  if (!open) {
    return (
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" strokeWidth={1.75} />
        مهمة جديدة
      </Button>
    );
  }

  return (
    <form action={formAction} className="ds-card space-y-4 p-5">
      <input type="hidden" name="caseId" value={caseId} />
      <FormField label="عنوان المهمة" htmlFor="title" required error={state.errors?.title}>
        <input id="title" name="title" required className={inputClass} />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="المسؤول" htmlFor="assigneeId" required error={state.errors?.assigneeId}>
          <select id="assigneeId" name="assigneeId" required className={inputClass} defaultValue="">
            <option value="" disabled>اختر المسؤول</option>
            {assignees.map((a) => (
              <option key={a.id} value={a.id}>{a.label}</option>
            ))}
          </select>
        </FormField>
        <FormField label="الأولوية" htmlFor="priority">
          <select id="priority" name="priority" className={inputClass} defaultValue="NORMAL">
            <option value="LOW">منخفضة</option>
            <option value="NORMAL">عادية</option>
            <option value="HIGH">مرتفعة</option>
            <option value="URGENT">عاجلة</option>
          </select>
        </FormField>
      </div>
      <FormField label="الموعد النهائي (اختياري)" htmlFor="dueAt">
        <input id="dueAt" name="dueAt" type="datetime-local" className={inputClass} />
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
  return <Button type="submit" size="sm" disabled={pending}>{pending ? 'جارٍ الحفظ…' : 'حفظ المهمة'}</Button>;
}

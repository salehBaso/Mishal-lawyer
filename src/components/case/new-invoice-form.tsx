'use client';

import { useMemo, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { createInvoiceAction } from '@/app/(portal)/billing/actions';
import type { ActionResult } from '@/app/(portal)/cases/actions';
import { FormField, inputClass } from '@/components/ui/form-field';
import { Button } from '@/components/ui/button';
import { formatSAR } from '@/lib/utils';
import { Plus, Trash2 } from 'lucide-react';

const initialState: ActionResult = { success: false };

interface Option {
  id: string;
  label: string;
}
interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export function NewInvoiceForm({ clients, cases }: { clients: Option[]; cases: (Option & { clientId: string })[] }) {
  const [state, formAction] = useFormState(createInvoiceAction, initialState);
  const [items, setItems] = useState<LineItem[]>([{ description: 'أتعاب قانونية', quantity: 1, unitPrice: 0 }]);
  const [clientId, setClientId] = useState('');

  const subtotal = useMemo(() => items.reduce((s, i) => s + i.quantity * i.unitPrice, 0), [items]);
  const vat = Math.round(subtotal * 0.15 * 100) / 100;

  function updateItem(index: number, patch: Partial<LineItem>) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  }

  const filteredCases = cases.filter((c) => !clientId || c.clientId === clientId);

  return (
    <form action={formAction} className="ds-card space-y-6 p-6">
      <input type="hidden" name="lineItemsJson" value={JSON.stringify(items)} />

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="العميل" htmlFor="clientId" required error={state.errors?.clientId}>
          <select
            id="clientId"
            name="clientId"
            required
            className={inputClass}
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
          >
            <option value="" disabled>اختر العميل</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </FormField>
        <FormField label="القضية المرتبطة (اختياري)" htmlFor="caseId">
          <select id="caseId" name="caseId" className={inputClass} defaultValue="">
            <option value="">بدون قضية محددة</option>
            {filteredCases.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </FormField>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[13px] font-medium text-charcoal-800">بنود الفاتورة</span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setItems((prev) => [...prev, { description: '', quantity: 1, unitPrice: 0 }])}
          >
            <Plus className="h-3.5 w-3.5" /> إضافة بند
          </Button>
        </div>
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="grid grid-cols-12 items-center gap-2">
              <input
                className={inputClass + ' col-span-6'}
                placeholder="وصف البند"
                value={item.description}
                onChange={(e) => updateItem(i, { description: e.target.value })}
              />
              <input
                type="number"
                min={1}
                className={inputClass + ' col-span-2'}
                value={item.quantity}
                onChange={(e) => updateItem(i, { quantity: Number(e.target.value) })}
              />
              <input
                type="number"
                min={0}
                className={inputClass + ' col-span-3'}
                placeholder="السعر"
                value={item.unitPrice}
                onChange={(e) => updateItem(i, { unitPrice: Number(e.target.value) })}
              />
              <button
                type="button"
                className="col-span-1 flex h-10 w-10 items-center justify-center text-neutral-400 hover:text-danger"
                onClick={() => setItems((prev) => prev.filter((_, idx) => idx !== i))}
                disabled={items.length === 1}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        {state.errors?.lineItems && <p className="mt-2 text-xs text-danger">{state.errors.lineItems}</p>}
      </div>

      <div className="flex items-center justify-end gap-8 border-t border-neutral-100 pt-4 text-sm">
        <span className="text-neutral-500">الإجمالي قبل الضريبة: <b className="text-charcoal-900">{formatSAR(subtotal)}</b></span>
        <span className="text-neutral-500">ضريبة القيمة المضافة (15%): <b className="text-charcoal-900">{formatSAR(vat)}</b></span>
        <span className="text-neutral-500">الإجمالي: <b className="text-gold-600">{formatSAR(subtotal + vat)}</b></span>
      </div>

      <FormField label="تاريخ الاستحقاق (اختياري)" htmlFor="dueDate">
        <input id="dueDate" name="dueDate" type="date" className={inputClass} />
      </FormField>

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? 'جارٍ الحفظ…' : 'إنشاء الفاتورة'}
    </Button>
  );
}

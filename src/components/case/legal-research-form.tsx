'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { runLegalResearch } from '@/lib/actions/legal-research';
import type { LegalResearchResult } from '@/lib/adapters/ai/types';

export function LegalResearchForm() {
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState<LegalResearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        const res = await runLegalResearch(question);
        setResult(res);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
      }
    });
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="ds-card p-6">
        <label className="mb-2 block text-sm font-medium text-charcoal-800">السؤال القانوني</label>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={3}
          placeholder="مثال: هل يمكن الدفع بعدم صحة المطالبة بسبب انتفاء الصفة؟"
          className="ds-focus-ring w-full rounded-md border border-neutral-300 px-4 py-3 text-sm"
        />
        <Button type="submit" className="mt-4" disabled={isPending}>
          {isPending ? 'جارٍ البحث…' : 'بحث'}
        </Button>
      </form>

      {error && <p className="text-sm text-danger">{error}</p>}

      {result && (
        <div className="ds-card space-y-5 p-6">
          <Field label="السؤال" value={result.question} />
          <Field label="النظام ذو الصلة" value={result.relevantLaw ?? 'غير محدد'} />
          <ListField label="المواد النظامية" items={result.articles} />
          <ListField label="اللوائح" items={result.regulations} />
          <ListField label="المبادئ القضائية" items={result.judicialPrinciples} />

          <div>
            <p className="mb-2 text-xs font-semibold text-neutral-500">المصادر</p>
            {result.hasSufficientSources && result.sources.length > 0 ? (
              <ul className="space-y-1.5">
                {result.sources.map((s, i) => (
                  <li key={i} className="text-sm text-gold-700">
                    {s.title} — {s.reference}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="rounded-md bg-warning/10 px-4 py-3 text-sm font-medium text-warning">
                لم يتم العثور على مصدر موثوق كافٍ.
              </p>
            )}
          </div>

          <Field label="التحليل" value={result.analysis} />
          {result.applicationToCase && <Field label="التطبيق على القضية" value={result.applicationToCase} />}
        </div>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-1 text-xs font-semibold text-neutral-500">{label}</p>
      <p className="text-sm leading-7 text-charcoal-800">{value}</p>
    </div>
  );
}

function ListField({ label, items }: { label: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="mb-1 text-xs font-semibold text-neutral-500">{label}</p>
      <ul className="list-inside list-disc space-y-1 text-sm text-charcoal-800">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

'use client';

import { useState, useTransition } from 'react';
import { Sparkles, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  generateCaseBriefAction,
  analyzeRiskAction,
  findMissingEvidenceAction,
  suggestResearchQuestionsAction,
  findContradictionsAction,
} from '@/app/(portal)/cases/[caseId]/actions';

const AI_DISCLAIMER =
  'هذا تحليل آلي مساعد فقط، ولا يُغني عن المراجعة القانونية من محامٍ مرخّص. لا يجوز اعتماده كرأي قانوني نهائي دون مراجعة بشرية.';

const ACTIONS = [
  { key: 'brief', label: 'إنشاء موجز القضية', run: generateCaseBriefAction },
  { key: 'risk', label: 'تحليل المخاطر', run: analyzeRiskAction },
  { key: 'missing', label: 'إيجاد المستندات الناقصة', run: findMissingEvidenceAction },
  { key: 'questions', label: 'اقتراح أسئلة بحث قانوني', run: suggestResearchQuestionsAction },
  { key: 'contradictions', label: 'اكتشاف التناقضات', run: findContradictionsAction },
] as const;

export function AIActionsPanel({ caseId }: { caseId: string }) {
  const [isPending, startTransition] = useTransition();
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);

  function run(key: string, action: (caseId: string) => Promise<unknown>) {
    setActiveKey(key);
    setError(null);
    startTransition(async () => {
      try {
        const res = await action(caseId);
        setResult(res);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'حدث خطأ غير متوقع');
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 rounded-md border border-info/20 bg-info/5 p-4">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-info" strokeWidth={1.5} />
        <p className="text-xs leading-6 text-charcoal-700">{AI_DISCLAIMER}</p>
      </div>

      <div className="flex flex-wrap gap-3">
        {ACTIONS.map((a) => (
          <Button
            key={a.key}
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() => run(a.key, a.run)}
          >
            <Sparkles className="h-3.5 w-3.5" strokeWidth={1.75} />
            {isPending && activeKey === a.key ? 'جارٍ التحليل…' : a.label}
          </Button>
        ))}
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      {result != null && (
        <div className="ds-card p-5">
          <p className="mb-3 text-xs font-semibold text-neutral-500">نتيجة التحليل (تتطلب مراجعة محامٍ):</p>
          <pre className="max-h-96 overflow-auto whitespace-pre-wrap break-words text-xs leading-6 text-charcoal-800">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

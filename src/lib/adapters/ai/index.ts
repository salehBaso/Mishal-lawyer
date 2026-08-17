import type { AIProviderAdapter } from './types';
import { MockAIAdapter } from './mock';
import { AnthropicAIAdapter } from './anthropic';

export * from './types';

export function getAIAdapter(): AIProviderAdapter {
  const provider = process.env.AI_PROVIDER ?? 'mock';
  switch (provider) {
    case 'mock':
      return new MockAIAdapter();
    case 'anthropic':
      return new AnthropicAIAdapter();
    case 'openai':
      throw new Error('TODO: أضف src/lib/adapters/ai/openai.ts يطبّق AIProviderAdapter.');
    default:
      throw new Error(`مزود AI غير معروف: ${provider}`);
  }
}

/** نص التنويه القانوني الثابت الذي يجب عرضه فوق أي ناتج AI في الواجهة */
export const AI_DISCLAIMER_AR =
  'هذا تحليل آلي مساعد فقط، ولا يُغني عن المراجعة القانونية من محامٍ مرخّص. لا يجوز اعتماده كرأي قانوني نهائي أو تقديمه للجهات الرسمية دون مراجعة بشرية.';

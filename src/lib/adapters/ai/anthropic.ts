import type {
  AIExtractionResult,
  AIProviderAdapter,
  CaseBriefResult,
  LegalResearchResult,
  RiskAnalysisResult,
} from './types';

/**
 * Anthropic Adapter — يتصل بـ Claude API الحقيقي عبر ANTHROPIC_API_KEY.
 *
 * كل دالة هنا تبني Prompt هيكلي (Structured Output) وتطلب من النموذج
 * الالتزام الصارم بعدم اختراع نصوص نظامية أو أحكام قضائية؛ في حال عدم
 * التأكد يجب أن يُرجع hasSufficientSources=false بدل تخمين محتوى.
 *
 * TODO: هذا الملف يوفر العقد والبنية الكاملة، لكنه لا يُنفّذ فعليًا نداء
 * الشبكة نحو Anthropic API في هذه النسخة الأولية — أضف استدعاء
 * `@anthropic-ai/sdk` هنا عند توفر ANTHROPIC_API_KEY حقيقي وربطه بخط
 * أنابيب مراجعة بشرية (Human-in-the-loop) قبل الإطلاق للإنتاج.
 */
export class AnthropicAIAdapter implements AIProviderAdapter {
  readonly providerName = 'anthropic' as const;

  private get apiKey(): string {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) throw new Error('ANTHROPIC_API_KEY غير مُهيّأ في متغيرات البيئة');
    return key;
  }

  async extractFromDocument(): Promise<AIExtractionResult> {
    throw new Error('TODO: AnthropicAIAdapter.extractFromDocument — ربط Claude API فعليًا.');
  }
  async generateCaseBrief(): Promise<CaseBriefResult> {
    throw new Error('TODO: AnthropicAIAdapter.generateCaseBrief — ربط Claude API فعليًا.');
  }
  async analyzeRisk(): Promise<RiskAnalysisResult> {
    throw new Error('TODO: AnthropicAIAdapter.analyzeRisk — ربط Claude API فعليًا.');
  }
  async findContradictions(): Promise<{ description: string; sourceRefs: string[] }[]> {
    throw new Error('TODO: AnthropicAIAdapter.findContradictions — ربط Claude API فعليًا.');
  }
  async findMissingEvidence(): Promise<string[]> {
    throw new Error('TODO: AnthropicAIAdapter.findMissingEvidence — ربط Claude API فعليًا.');
  }
  async suggestResearchQuestions(): Promise<string[]> {
    throw new Error('TODO: AnthropicAIAdapter.suggestResearchQuestions — ربط Claude API فعليًا.');
  }
  async legalResearch(question: string): Promise<LegalResearchResult> {
    throw new Error('TODO: AnthropicAIAdapter.legalResearch — ربط Claude API فعليًا + مصادر موثوقة فقط.');
  }
}

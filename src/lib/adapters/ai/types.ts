/**
 * AI Provider Adapter — طبقة موحّدة للاتصال بأي مزود LLM (Anthropic/OpenAI)
 * أو مزود وهمي (mock) للتطوير بدون مفاتيح API.
 *
 * مبدأ غير قابل للتفاوض في هذا المنتج:
 * AI لا يُقدَّم أبدًا كبديل عن المحامي. كل ناتج AI:
 *   - يُخزَّن كـ AIAnalysis بحالة requiresHumanReview = true افتراضيًا.
 *   - يُعرض دائمًا مصحوبًا بتنويه "تحليل مساعد يتطلب مراجعة محامٍ مرخّص".
 *   - في البحث القانوني: يُمنع اختراع نصوص/أحكام؛ أي نتيجة بلا مصدر موثوق
 *     تُعاد كـ "لم يتم العثور على مصدر موثوق كافٍ" بدل تخمين محتوى.
 */

export type AIAnalysisKind =
  | 'CASE_BRIEF'
  | 'TIMELINE_EXTRACTION'
  | 'CONTRADICTION_DETECTION'
  | 'MISSING_EVIDENCE'
  | 'RISK_ANALYSIS'
  | 'RESEARCH_QUESTIONS'
  | 'DOCUMENT_EXTRACTION'
  | 'LEGAL_RESEARCH';

export interface AIExtractionResult {
  parties: string[];
  dates: { label: string; date: string }[];
  amounts: { label: string; amount: number; currency: string }[];
  claims: string[];
  defenses: string[];
  obligations: string[];
}

export interface LegalResearchSource {
  title: string;
  reference: string; // مثال: "نظام المعاملات المدنية، المادة 107"
  url?: string;
}

export interface LegalResearchResult {
  question: string;
  relevantLaw: string | null;
  articles: string[];
  regulations: string[];
  judicialPrinciples: string[];
  sources: LegalResearchSource[];
  analysis: string;
  applicationToCase: string | null;
  /** إن كانت false، يجب على الواجهة إظهار "لم يتم العثور على مصدر موثوق كافٍ" فقط */
  hasSufficientSources: boolean;
}

export interface CaseBriefResult {
  summary: string;
  keyFacts: string[];
  strengths: string[];
  weaknesses: string[];
  recommendedActions: string[];
}

export interface RiskAnalysisResult {
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  score: number; // 0-100
  factors: { factor: string; impact: 'positive' | 'negative'; weight: number }[];
  rationale: string;
}

export interface AIProviderAdapter {
  readonly providerName: 'anthropic' | 'openai' | 'mock';

  extractFromDocument(documentText: string): Promise<AIExtractionResult>;
  generateCaseBrief(caseContext: string): Promise<CaseBriefResult>;
  analyzeRisk(caseContext: string): Promise<RiskAnalysisResult>;
  findContradictions(documentsText: string[]): Promise<{ description: string; sourceRefs: string[] }[]>;
  findMissingEvidence(caseContext: string, existingDocuments: string[]): Promise<string[]>;
  suggestResearchQuestions(caseContext: string): Promise<string[]>;
  legalResearch(question: string, jurisdictionContext?: string): Promise<LegalResearchResult>;
}

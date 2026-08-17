import type {
  AIExtractionResult,
  AIProviderAdapter,
  CaseBriefResult,
  LegalResearchResult,
  RiskAnalysisResult,
} from './types';

/**
 * Mock AI Adapter — يعمل بدون أي مفتاح API، مخصص للتطوير والعروض التقديمية
 * وبيانات Seed. يُنتج ردودًا هيكلية واقعية الشكل لكنها ثابتة/تجريبية،
 * ويُشير صراحة في كل ناتج أن هذا عرض تجريبي وليس تحليلاً قانونيًا حقيقيًا.
 */
export class MockAIAdapter implements AIProviderAdapter {
  readonly providerName = 'mock' as const;

  async extractFromDocument(documentText: string): Promise<AIExtractionResult> {
    return {
      parties: ['شركة النخبة للتجارة', 'مؤسسة الريادة العقارية'],
      dates: [{ label: 'تاريخ توقيع العقد', date: '2025-11-02' }],
      amounts: [{ label: 'قيمة المطالبة', amount: 480000, currency: 'SAR' }],
      claims: ['الإخلال بشروط التسليم المتفق عليها في العقد'],
      defenses: ['عدم استلام إشعار رسمي مسبق بالإخلال'],
      obligations: ['تسليم الوحدات العقارية خلال 90 يومًا من تاريخ التوقيع'],
    };
  }

  async generateCaseBrief(caseContext: string): Promise<CaseBriefResult> {
    return {
      summary:
        '[عرض تجريبي] ملخص تلقائي أولي للقضية بناءً على المستندات المتاحة — يتطلب مراجعة واعتماد محامٍ مرخّص قبل الاستخدام في أي إجراء رسمي.',
      keyFacts: ['وجود عقد موقّع بين الطرفين', 'مطالبة مالية متعلقة بتأخر التسليم'],
      strengths: ['وجود عقد مكتوب وواضح البنود'],
      weaknesses: ['نقص في مراسلات الإنذار الرسمي'],
      recommendedActions: ['استكمال المستندات الناقصة', 'صياغة مذكرة الدفاع الأولية'],
    };
  }

  async analyzeRisk(caseContext: string): Promise<RiskAnalysisResult> {
    return {
      riskLevel: 'MEDIUM',
      score: 62,
      factors: [
        { factor: 'وجود عقد موقّع وواضح', impact: 'positive', weight: 20 },
        { factor: 'نقص مستندات الإنذار الرسمي', impact: 'negative', weight: 15 },
      ],
      rationale:
        '[عرض تجريبي] تقدير أولي غير نهائي يعتمد على اكتمال المستندات المرفوعة فقط، ولا يغني عن تقييم محامٍ القضية.',
    };
  }

  async findContradictions() {
    return [
      {
        description: '[عرض تجريبي] تعارض محتمل بين تاريخ التسليم في العقد وتاريخ التسليم في المراسلات.',
        sourceRefs: ['Document#contract', 'Document#correspondence'],
      },
    ];
  }

  async findMissingEvidence(): Promise<string[]> {
    return ['كشف حساب بنكي يثبت الدفعات', 'إشعار الإنذار الرسمي الموجَّه للطرف الآخر'];
  }

  async suggestResearchQuestions(): Promise<string[]> {
    return [
      'ما هي شروط سقوط الحق في المطالبة بالتعويض عن التأخير وفق نظام المعاملات المدنية؟',
      'هل يُشترط إنذار رسمي مسبق لصحة المطالبة بفسخ العقد؟',
    ];
  }

  async legalResearch(question: string): Promise<LegalResearchResult> {
    return {
      question,
      relevantLaw: null,
      articles: [],
      regulations: [],
      judicialPrinciples: [],
      sources: [],
      analysis: '[عرض تجريبي] هذا مزود AI تجريبي (Mock) لا يتصل بأي مصدر قانوني حقيقي.',
      applicationToCase: null,
      hasSufficientSources: false,
    };
  }
}

/**
 * NajizAdapter — بنية جاهزة للربط مع Najiz Developers APIs (منصة ناجز
 * التابعة لوزارة العدل السعودية).
 *
 * قواعد صارمة تم الالتزام بها بناءً على متطلبات المشروع:
 *  - لا Scraping، لا Browser Automation، لا استخدام أي API غير موثّق رسميًا.
 *  - كل بيانات الاعتماد تُقرأ من متغيرات البيئة فقط (NAJIZ_*).
 *  - البيئة الافتراضية Sandbox (NAJIZ_ENV=sandbox) — لا يتم التحويل إلى
 *    production إلا بعد اعتماد رسمي من ناجز واختبار كامل.
 *  - أي خدمة غير متاحة حاليًا عبر API رسمي مُوثّق تبقى TODO صريحًا هنا،
 *    ولا تتم محاكاتها أو الالتفاف عليها بأي شكل.
 *
 * الحالة الحالية: لا يوجد لدى فريق التطوير حتى الآن اعتماد رسمي/توثيق
 * API فعلي من ناجز في هذه البيئة، لذلك كل دالة أدناه هي "عقد" (Interface)
 * جاهز للتوصيل الفعلي فور توفر الاعتماد وبيانات الدخول من ناجز.
 */

export interface NajizCaseSyncResult {
  najizCaseId: string;
  status: string;
  lastSyncedAt: string;
}

export interface NajizSessionInfo {
  najizCaseId: string;
  hearingDate: string;
  courtName: string;
  location?: string;
}

export interface NajizAdapterConfig {
  env: 'sandbox' | 'production';
  baseUrl: string;
  clientId: string;
  clientSecret: string;
  subscriptionKey: string;
}

function loadConfig(): NajizAdapterConfig {
  return {
    env: (process.env.NAJIZ_ENV as 'sandbox' | 'production') ?? 'sandbox',
    baseUrl: process.env.NAJIZ_BASE_URL ?? '',
    clientId: process.env.NAJIZ_CLIENT_ID ?? '',
    clientSecret: process.env.NAJIZ_CLIENT_SECRET ?? '',
    subscriptionKey: process.env.NAJIZ_SUBSCRIPTION_KEY ?? '',
  };
}

export class NajizAdapter {
  private config = loadConfig();

  private assertConfigured() {
    if (!this.config.clientId || !this.config.clientSecret) {
      throw new Error(
        'NajizAdapter: بيانات الاعتماد غير مكتملة (NAJIZ_CLIENT_ID / NAJIZ_CLIENT_SECRET). ' +
          'هذا التكامل يتطلب اعتمادًا رسميًا من منصة ناجز قبل التفعيل.',
      );
    }
  }

  /** TODO: تنفيذ OAuth2 Client Credentials Flow الرسمي لناجز عند توفر التوثيق */
  async authenticate(): Promise<{ accessToken: string; expiresAt: string }> {
    this.assertConfigured();
    throw new Error('TODO: NajizAdapter.authenticate — بانتظار توثيق Najiz Developers الرسمي.');
  }

  /** TODO: مزامنة حالة قضية من ناجز إلى Case.status محليًا */
  async syncCaseStatus(najizCaseId: string): Promise<NajizCaseSyncResult> {
    this.assertConfigured();
    throw new Error('TODO: NajizAdapter.syncCaseStatus — غير مطبَّق بعد.');
  }

  /** TODO: جلب الجلسات القادمة المرتبطة بقضية من ناجز */
  async getUpcomingSessions(najizCaseId: string): Promise<NajizSessionInfo[]> {
    this.assertConfigured();
    throw new Error('TODO: NajizAdapter.getUpcomingSessions — غير مطبَّق بعد.');
  }

  /** TODO: التحقق من صفة "محامٍ معتمد" لدى ناجز (Approved Lawyer Services) */
  async verifyApprovedLawyer(licenseNumber: string): Promise<{ isApproved: boolean }> {
    this.assertConfigured();
    throw new Error('TODO: NajizAdapter.verifyApprovedLawyer — غير مطبَّق بعد.');
  }

  /** TODO: جلب/رفع مستندات معتمدة عبر واجهات ناجز الرسمية إن وُجدت */
  async listApprovedDocuments(najizCaseId: string): Promise<Array<{ id: string; title: string }>> {
    this.assertConfigured();
    throw new Error('TODO: NajizAdapter.listApprovedDocuments — غير مطبَّق بعد.');
  }

  isConfigured(): boolean {
    return Boolean(this.config.clientId && this.config.clientSecret);
  }
}

export const najizAdapter = new NajizAdapter();

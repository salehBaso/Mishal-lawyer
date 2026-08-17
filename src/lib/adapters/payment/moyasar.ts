import type {
  CreatePaymentIntentInput,
  PaymentIntentResult,
  PaymentProviderAdapter,
  WebhookVerificationResult,
} from './types';

/**
 * Moyasar Adapter — مزود دفع سعودي معتمد (مدى/فيزا/ماستركارد/Apple Pay).
 * التوثيق الرسمي: https://docs.moyasar.com
 *
 * ملاحظة تنفيذية: هذا Adapter جاهز البنية والعقد (Interface)، وتستدعي
 * الدوال المتغيرات البيئية MOYASAR_SECRET_KEY / MOYASAR_WEBHOOK_SECRET.
 * TODO: استكمال استدعاء REST API الفعلي لـ Moyasar عند توفر حساب تاجر
 * حقيقي (Merchant Account) وربطه بالـ Sandbox أولاً.
 */
export class MoyasarAdapter implements PaymentProviderAdapter {
  readonly providerName = 'moyasar' as const;

  private get secretKey(): string {
    const key = process.env.MOYASAR_SECRET_KEY;
    if (!key) throw new Error('MOYASAR_SECRET_KEY غير مُهيّأ في متغيرات البيئة');
    return key;
  }

  async createPaymentIntent(input: CreatePaymentIntentInput): Promise<PaymentIntentResult> {
    // TODO: استبدال هذا بنداء فعلي إلى POST https://api.moyasar.com/v1/invoices
    // باستخدام Basic Auth عبر secretKey، وفق التوثيق الرسمي.
    throw new Error(
      'MoyasarAdapter.createPaymentIntent: لم يتم ربط بيانات اعتماد Moyasar الفعلية بعد. ' +
        'راجع .env.example → MOYASAR_SECRET_KEY.',
    );
  }

  async verifyWebhookSignature(
    rawBody: string,
    signatureHeader: string | null,
  ): Promise<WebhookVerificationResult> {
    // TODO: تنفيذ التحقق الفعلي من توقيع Webhook الخاص بـ Moyasar
    // (HMAC باستخدام MOYASAR_WEBHOOK_SECRET) قبل اعتماد أي دفعة كمكتملة.
    return { isValid: false };
  }

  async refund(providerRef: string, amount?: number) {
    // TODO: POST https://api.moyasar.com/v1/payments/{id}/refund
    return { success: false };
  }
}

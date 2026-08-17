/**
 * Payment Provider Adapter — واجهة موحّدة تسمح بتبديل مزود الدفع
 * (Moyasar / HyperPay / Tap / Stripe) دون تغيير أي كود في التطبيق.
 *
 * قواعد أمان صارمة:
 *  1) لا يوجد أي مفتاح دفع (Secret Key) في كود Frontend إطلاقًا.
 *  2) إنشاء عملية الدفع (createPaymentIntent) يتم حصريًا من Server Action
 *     أو Route Handler — أبدًا من مكوّن Client.
 *  3) التحقق من الدفع يتم فقط عبر Webhook مُوقَّع (verifyWebhookSignature)،
 *     ولا يُعتمد أبدًا على استدعاء من المتصفح يقول "تم الدفع".
 */

export interface CreatePaymentIntentInput {
  amount: number; // بالهللة/أصغر وحدة عملة
  currency: string; // "SAR"
  description: string;
  referenceId: string; // invoiceId أو orderId
  customerEmail?: string;
  successUrl: string;
  failureUrl: string;
}

export interface PaymentIntentResult {
  providerRef: string;
  checkoutUrl: string;
  status: 'INITIATED';
}

export interface WebhookVerificationResult {
  isValid: boolean;
  providerRef?: string;
  status?: 'AUTHORIZED' | 'CAPTURED' | 'FAILED' | 'REFUNDED';
  amount?: number;
  rawEvent?: unknown;
}

export interface PaymentProviderAdapter {
  readonly providerName: 'moyasar' | 'hyperpay' | 'tap' | 'stripe';
  createPaymentIntent(input: CreatePaymentIntentInput): Promise<PaymentIntentResult>;
  /** يجب أن يتحقق من التوقيع الفعلي للمزود — لا تُرجع isValid=true افتراضيًا أبدًا */
  verifyWebhookSignature(rawBody: string, signatureHeader: string | null): Promise<WebhookVerificationResult>;
  refund(providerRef: string, amount?: number): Promise<{ success: boolean; refundRef?: string }>;
}

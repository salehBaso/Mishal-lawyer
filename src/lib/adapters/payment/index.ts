import type { PaymentProviderAdapter } from './types';
import { MoyasarAdapter } from './moyasar';

export * from './types';

/**
 * Factory — يقرأ PAYMENT_PROVIDER من البيئة ويُرجع الـ Adapter المناسب.
 * لإضافة مزود جديد (HyperPay/Tap/Stripe): أنشئ ملفًا مطابقًا لعقد
 * PaymentProviderAdapter وأضفه هنا فقط — بقية النظام لا يتغير إطلاقًا.
 */
export function getPaymentAdapter(): PaymentProviderAdapter {
  const provider = process.env.PAYMENT_PROVIDER ?? 'moyasar';

  switch (provider) {
    case 'moyasar':
      return new MoyasarAdapter();
    case 'hyperpay':
    case 'tap':
    case 'stripe':
      throw new Error(
        `TODO: لم يتم بعد تنفيذ Adapter لمزود "${provider}". ` +
          `أضف ملفًا في src/lib/adapters/payment/${provider}.ts يطبّق PaymentProviderAdapter.`,
      );
    default:
      throw new Error(`مزود دفع غير معروف: ${provider}`);
  }
}

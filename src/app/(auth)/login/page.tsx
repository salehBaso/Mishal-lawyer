import { redirect } from 'next/navigation';
import { AuthError } from 'next-auth';
import { signIn } from '@/lib/auth';

async function loginAction(formData: FormData) {
  'use server';
  const email = String(formData.get('email') ?? '');
  const password = String(formData.get('password') ?? '');
  const callbackUrl = String(formData.get('callbackUrl') ?? '/dashboard');

  try {
    await signIn('credentials', { email, password, redirectTo: callbackUrl });
  } catch (err) {
    if (err instanceof AuthError) {
      redirect(`/login?error=invalid_credentials&callbackUrl=${encodeURIComponent(callbackUrl)}`);
    }
    throw err;
  }
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string; callbackUrl?: string };
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-charcoal-950 px-6" dir="rtl">
      <div className="w-full max-w-md">
        <div className="mb-10 flex flex-col items-center gap-3 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-gold-500/40 font-display text-sm font-bold text-gold-400">
            م ج
          </span>
          <h1 className="font-display text-lg font-bold text-ivory-100">
            شركة مشعل الجهني للمحاماة والاستشارات
          </h1>
          <p className="text-xs text-neutral-500">بوابة العملاء والموظفين — دخول آمن</p>
        </div>

        <form action={loginAction} className="ds-card-elevated space-y-4 bg-white p-8">
          <input type="hidden" name="callbackUrl" value={searchParams.callbackUrl ?? '/dashboard'} />

          {searchParams.error === 'invalid_credentials' && (
            <div className="rounded-md bg-danger/10 px-4 py-3 text-[13px] text-danger">
              البريد الإلكتروني أو كلمة المرور غير صحيحة.
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-charcoal-800">البريد الإلكتروني</label>
            <input
              type="email"
              name="email"
              required
              placeholder="name@example.com"
              className="ds-focus-ring w-full rounded-md border border-neutral-300 px-4 py-3 text-sm"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-charcoal-800">كلمة المرور</label>
            <input
              type="password"
              name="password"
              required
              minLength={8}
              placeholder="••••••••"
              className="ds-focus-ring w-full rounded-md border border-neutral-300 px-4 py-3 text-sm"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-charcoal-900 py-3.5 text-sm font-semibold text-ivory-100 transition-premium hover:bg-charcoal-800"
          >
            تسجيل الدخول
          </button>

          <p className="pt-1 text-center text-[11px] text-neutral-400">
            محمي بتشفير كامل للاتصال. لأي استفسار تواصل مع مدير النظام في مكتبكم.
          </p>
        </form>

        <div className="mt-6 rounded-md border border-white/10 bg-white/[0.03] p-4 text-[11px] leading-6 text-neutral-500">
          بيانات دخول تجريبية (بعد تشغيل seed):
          <br />
          lawyer@mishal-legal.sa / Password123!
          <br />
          client@mishal-legal.sa / Password123!
        </div>
      </div>
    </div>
  );
}

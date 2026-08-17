'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // TODO: إرسال الخطأ إلى مزود المراقبة (Sentry) عبر SENTRY_DSN
    console.error('[GlobalError]', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-ivory-100 px-6 text-center">
      <span className="ds-kicker">حدث خطأ غير متوقع</span>
      <h1 className="font-display text-2xl font-bold text-charcoal-900">
        نعتذر، حدث خطأ أثناء تحميل هذه الصفحة
      </h1>
      <p className="max-w-md text-neutral-500">
        فريقنا التقني تم إشعاره تلقائيًا. يمكنك المحاولة مرة أخرى أو العودة لاحقًا.
      </p>
      <button
        onClick={reset}
        className="rounded-md bg-charcoal-900 px-6 py-3 text-sm font-medium text-ivory-100 transition-premium hover:bg-charcoal-800"
      >
        إعادة المحاولة
      </button>
    </div>
  );
}

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-charcoal-950 px-6 text-center text-ivory-100">
      <span className="ds-kicker text-gold-400">خطأ 404</span>
      <h1 className="font-display text-3xl font-bold">الصفحة غير موجودة</h1>
      <p className="max-w-md text-neutral-400">
        الصفحة التي تحاول الوصول إليها غير متوفرة أو تم نقلها.
      </p>
      <Link
        href="/"
        className="rounded-md border border-gold-500/40 px-6 py-3 text-sm font-medium text-gold-400 transition-premium hover:bg-gold-500/10"
      >
        العودة إلى الصفحة الرئيسية
      </Link>
    </div>
  );
}

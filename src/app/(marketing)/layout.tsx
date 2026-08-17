import Link from 'next/link';

const NAV_LINKS = [
  { href: '#about', label: 'عن المكتب' },
  { href: '#practice-areas', label: 'مجالات الممارسة' },
  { href: '#approach', label: 'منهجنا' },
  { href: '#technology', label: 'التقنية' },
  { href: '#professionals', label: 'فريقنا' },
  { href: '#insights', label: 'رؤى قانونية' },
  { href: '#contact', label: 'تواصل معنا' },
];

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ivory-100">
      <header className="sticky top-0 z-40 border-b border-neutral-200/70 bg-ivory-100/85 backdrop-blur-md">
        <div className="container flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-gold-500/40 font-display text-sm font-bold text-gold-600">
              م ج
            </span>
            <span className="hidden font-display text-base font-bold text-charcoal-900 sm:block">
              شركة مشعل الجهني للمحاماة والاستشارات
            </span>
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-[13px] font-medium text-neutral-600 transition-premium hover:text-charcoal-900"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden text-[13px] font-medium text-neutral-600 hover:text-charcoal-900 sm:block"
            >
              دخول العملاء
            </Link>
            <a
              href="#contact"
              className="rounded-md bg-charcoal-900 px-5 py-2.5 text-[13px] font-medium text-ivory-100 transition-premium hover:bg-charcoal-800"
            >
              احجز استشارة
            </a>
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="border-t border-neutral-200 bg-charcoal-950 text-neutral-400">
        <div className="container grid gap-10 py-16 md:grid-cols-4">
          <div className="md:col-span-2">
            <span className="font-display text-lg font-bold text-ivory-100">
              شركة مشعل الجهني للمحاماة والاستشارات
            </span>
            <p className="mt-4 max-w-sm text-sm leading-7 text-neutral-400">
              خبرة قانونية عميقة، ورؤية استراتيجية مدعومة بتقنية قانونية متقدمة —
              نمثّل عملاءنا بدقة، وسرية، والتزام تام بأعلى معايير الممارسة القانونية.
            </p>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold text-ivory-100">روابط سريعة</h4>
            <ul className="space-y-2.5 text-sm">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="hover:text-gold-400">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold text-ivory-100">التواصل</h4>
            <ul className="space-y-2.5 text-sm">
              <li>الرياض، المملكة العربية السعودية</li>
              <li dir="ltr" className="text-right">+966 11 000 0000</li>
              <li dir="ltr" className="text-right">info@mishal-legal.sa</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/5 py-6 text-center text-xs text-neutral-500">
          © {new Date().getFullYear()} شركة مشعل الجهني للمحاماة والاستشارات. جميع الحقوق محفوظة.
        </div>
      </footer>
    </div>
  );
}

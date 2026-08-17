import type { Metadata } from 'next';
import { IBM_Plex_Sans_Arabic, Tajawal } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';

// RTL أصيل من جذر التطبيق — وليس إضافة لاحقة. dir="rtl" و lang="ar" على <html>.
const bodyFont = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-arabic',
  display: 'swap',
});

const displayFont = Tajawal({
  subsets: ['arabic'],
  weight: ['500', '700', '800'],
  variable: '--font-arabic-display',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://mishal-legal.sa'),
  title: {
    default: 'شركة مشعل الجهني للمحاماة والاستشارات',
    template: '%s | شركة مشعل الجهني للمحاماة والاستشارات',
  },
  description:
    'مكتب محاماة واستشارات قانونية سعودي رفيع المستوى — خبرة قانونية عميقة، ورؤية استراتيجية مدعومة بتقنية قانونية متقدمة.',
  keywords: ['محاماة', 'استشارات قانونية', 'محامي سعودي', 'التقاضي', 'تحكيم', 'مشعل الجهني'],
  authors: [{ name: 'شركة مشعل الجهني للمحاماة والاستشارات' }],
  openGraph: {
    type: 'website',
    locale: 'ar_SA',
    siteName: 'شركة مشعل الجهني للمحاماة والاستشارات',
    title: 'شركة مشعل الجهني للمحاماة والاستشارات',
    description: 'خبرة قانونية. رؤية استراتيجية.',
  },
  robots: { index: true, follow: true },
  alternates: { canonical: '/' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${bodyFont.variable} ${displayFont.variable}`}>
      <body className="min-h-screen bg-ivory-100 font-arabic antialiased">
        {children}
        <Toaster position="top-center" richColors dir="rtl" />
      </body>
    </html>
  );
}

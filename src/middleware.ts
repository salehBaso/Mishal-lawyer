import NextAuth from 'next-auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { authConfig } from '@/lib/auth/config';

/**
 * نسخة Edge-safe من auth() — تُبنى من authConfig وحده (بلا مزوّدات) لتفادي
 * سحب Prisma/bcrypt إلى حزمة Edge Middleware. تكفي هنا لقراءة/فك تشفير
 * الجلسة (JWT) فقط؛ لا تُستخدم لتسجيل الدخول.
 */
const { auth } = NextAuth(authConfig);

/**
 * حماية المسارات على مستوى Middleware — خط الدفاع الأول قبل وصول الطلب
 * إلى أي Server Component. التحقق الدقيق من الصلاحيات (RBAC) يتم لاحقًا
 * داخل كل صفحة/Server Action عبر assertPermission().
 */
const PUBLIC_PATHS = ['/', '/login', '/practice-areas', '/about', '/contact', '/insights'];
const PUBLIC_PREFIXES = ['/api/auth', '/_next', '/favicon', '/fonts', '/images'];

export default auth((req: NextRequest & { auth?: unknown }) => {
  const { pathname } = req.nextUrl;

  const isPublic =
    PUBLIC_PATHS.includes(pathname) || PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));

  if (isPublic) return NextResponse.next();

  const isLoggedIn = Boolean((req as any).auth);
  if (!isLoggedIn && pathname.startsWith('/dashboard')) {
    const loginUrl = new URL('/login', req.nextUrl.origin);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // رؤوس أمان إضافية على كل استجابة
  const res = NextResponse.next();
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('X-Content-Type-Options', 'nosniff');
  return res;
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

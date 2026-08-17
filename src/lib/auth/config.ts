import type { NextAuthConfig } from 'next-auth';
import type { RoleName } from '@/lib/rbac/permissions';

/**
 * Auth Architecture — Auth.js (NextAuth) v5
 *
 * - Credentials Provider مع كلمات مرور مُجزّأة (bcrypt) كنقطة بداية بسيطة
 *   وآمنة؛ يمكن إضافة SSO/OAuth لاحقًا (Microsoft Entra ID شائع لمكاتب
 *   المحاماة) دون تغيير بنية RBAC.
 * - Session Strategy: JWT (stateless, يسهّل التوسع الأفقي) + جدول
 *   UserSession منفصل لإدارة الأجهزة النشطة وإبطالها عن بُعد.
 * - MFA: بنية جاهزة (mfaEnabled/mfaSecret في User) — التحقق الفعلي بـ TOTP
 *   يُفعَّل عبر خطوة تحقق إضافية بعد Credentials (TODO: ربط مكتبة otplib).
 * - Cookies آمنة: httpOnly + secure + sameSite=lax افتراضيًا من Auth.js،
 *   ومدة الجلسة تُقرأ من SESSION_MAX_AGE_SECONDS.
 *
 * هذا الملف يبقى خاليًا من Prisma/bcrypt عمدًا (Node-only APIs) لأنه
 * يُستورد من middleware.ts الذي يعمل على Edge Runtime. مزوّد Credentials
 * الكامل (الذي يحتاج قاعدة البيانات وbcrypt) موجود في ./index.ts فقط،
 * ويُستخدَم حصرًا داخل Route Handlers وServer Components/Actions.
 */
export const authConfig: NextAuthConfig = {
  session: {
    strategy: 'jwt',
    maxAge: Number(process.env.SESSION_MAX_AGE_SECONDS ?? 28800),
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id!;
        token.organizationId = (user as any).organizationId;
        token.role = (user as any).role;
        token.clientId = (user as any).clientId ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.userId as string;
      session.user.organizationId = token.organizationId as string;
      session.user.role = token.role as RoleName;
      session.user.clientId = (token.clientId as string | null | undefined) ?? null;
      return session;
    },
  },
};

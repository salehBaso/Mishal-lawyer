import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { authConfig } from './config';
import { prisma } from '@/lib/db/prisma';
import { writeAuditLog } from '@/lib/audit/log';
import type { SessionActor } from '@/lib/rbac/can';

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

/**
 * التكوين الكامل (Node runtime فقط) — يضيف مزوّد Credentials الذي يحتاج
 * Prisma وbcrypt فوق التكوين الآمن لـ Edge في ./config.ts. لا يُستورد هذا
 * الملف من middleware.ts؛ راجع src/middleware.ts لتكوين Edge المنفصل.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'البريد الإلكتروني', type: 'email' },
        password: { label: 'كلمة المرور', type: 'password' },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { email },
          include: { role: true, clientProfile: true },
        });

        if (!user || user.status !== 'ACTIVE') return null;

        const validPassword = await bcrypt.compare(password, user.passwordHash);
        if (!validPassword) {
          await writeAuditLog({
            organizationId: user.organizationId,
            actorId: user.id,
            action: 'auth.login_failed',
            entityType: 'User',
            entityId: user.id,
            description: `محاولة دخول فاشلة للمستخدم ${user.email}`,
          });
          return null;
        }

        // TODO: إن كان mfaEnabled=true، أرجع حالة وسيطة تتطلب رمز TOTP
        // بدل تسجيل الدخول المباشر (يُطبَّق في شاشة /login كخطوة ثانية).

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          organizationId: user.organizationId,
          role: user.role.name,
          clientId: user.clientProfile?.id ?? null,
          fullNameAr: user.fullNameAr,
        };
      },
    }),
  ],
});

/** يحوّل جلسة Auth.js إلى SessionActor المستخدَم في طبقة RBAC */
export async function getActor(): Promise<SessionActor | null> {
  const session = await auth();
  if (!session?.user) return null;
  return {
    userId: session.user.id,
    organizationId: session.user.organizationId,
    role: session.user.role,
    clientId: session.user.clientId,
  };
}

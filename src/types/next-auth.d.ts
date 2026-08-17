import type { RoleName } from '@/lib/rbac/permissions';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      organizationId: string;
      role: RoleName;
      clientId?: string | null;
      fullNameAr?: string | null;
      email: string;
      avatarUrl?: string | null;
    };
  }

  interface User {
    id: string;
    organizationId: string;
    role: RoleName;
    clientId?: string | null;
    fullNameAr?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId: string;
    organizationId: string;
    role: RoleName;
    clientId?: string | null;
  }
}

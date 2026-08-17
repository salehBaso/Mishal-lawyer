import { redirect } from 'next/navigation';
import { getActor } from '@/lib/auth';
import { can } from '@/lib/rbac/can';
import { prisma } from '@/lib/db/prisma';
import { PORTAL_NAV, filterNavByRole } from '@/lib/navigation';
import { PortalSidebar } from '@/components/layout/portal-sidebar';
import { PortalTopbar } from '@/components/layout/portal-topbar';

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const actor = await getActor();
  if (!actor) redirect('/login');

  const [user, org, unreadCount] = await Promise.all([
    prisma.user.findUnique({ where: { id: actor.userId } }),
    prisma.organization.findUnique({ where: { id: actor.organizationId } }),
    prisma.notification.count({ where: { userId: actor.userId, status: { in: ['SENT', 'PENDING'] } } }),
  ]);

  const navItems = filterNavByRole(PORTAL_NAV, actor.role, (p) => can(actor, p));

  return (
    <div className="min-h-screen bg-ivory-100" dir="rtl">
      <PortalSidebar items={navItems} orgName={org?.nameAr ?? 'شركة مشعل الجهني للمحاماة والاستشارات'} />
      <div className="lg:pr-64">
        <PortalTopbar
          userName={user?.fullNameAr ?? user?.fullName ?? 'مستخدم'}
          role={actor.role}
          unreadNotifications={unreadCount}
        />
        <main className="px-6 py-8 lg:px-10">{children}</main>
      </div>
    </div>
  );
}

import { Bell, Search } from 'lucide-react';
import { ROLE_LABELS, type RoleName } from '@/lib/rbac/permissions';

export function PortalTopbar({
  userName,
  role,
  unreadNotifications = 0,
}: {
  userName: string;
  role: RoleName;
  unreadNotifications?: number;
}) {
  return (
    <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-neutral-200 bg-ivory-100/90 px-6 backdrop-blur-md lg:px-10">
      <div className="hidden items-center gap-2 rounded-md border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-400 md:flex md:w-80">
        <Search className="h-4 w-4" strokeWidth={1.5} />
        بحث عن قضية، عميل، أو مستند…
      </div>

      <div className="flex items-center gap-4">
        <button className="relative flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-500 transition-premium hover:text-charcoal-900">
          <Bell className="h-[18px] w-[18px]" strokeWidth={1.5} />
          {unreadNotifications > 0 && (
            <span className="absolute -left-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-gold-500 text-[10px] font-bold text-charcoal-950">
              {unreadNotifications}
            </span>
          )}
        </button>

        <div className="flex items-center gap-3">
          <div className="text-left">
            <div className="text-[13px] font-semibold text-charcoal-900">{userName}</div>
            <div className="text-[11px] text-neutral-500">{ROLE_LABELS[role].ar}</div>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-charcoal-900 font-display text-xs font-bold text-gold-400">
            {userName.slice(0, 1)}
          </div>
        </div>
      </div>
    </header>
  );
}

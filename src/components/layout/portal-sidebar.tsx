'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { NavItem } from '@/lib/navigation';

export function PortalSidebar({ items, orgName }: { items: NavItem[]; orgName: string }) {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 right-0 z-30 hidden w-64 flex-col border-l border-charcoal-800 bg-charcoal-950 text-ivory-100 lg:flex">
      <div className="flex h-20 items-center gap-3 border-b border-white/5 px-6">
        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gold-500/40 font-display text-xs font-bold text-gold-400">
          م ج
        </span>
        <div className="overflow-hidden">
          <div className="truncate text-[13px] font-semibold">{orgName}</div>
          <div className="text-[11px] text-neutral-500">منصة قانونية رقمية</div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-6">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3.5 py-2.5 text-[13px] font-medium transition-premium',
                active
                  ? 'bg-white/[0.06] text-gold-400'
                  : 'text-neutral-400 hover:bg-white/[0.04] hover:text-ivory-100',
              )}
            >
              <item.icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/5 p-4 text-[11px] text-neutral-600">
        نسخة تجريبية — بيانات وهمية بالكامل
      </div>
    </aside>
  );
}

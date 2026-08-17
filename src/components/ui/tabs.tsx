'use client';

import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TabItem {
  key: string;
  label: string;
  content: ReactNode;
}

/** Tabs بسيط بدون تبعيات خارجية — مناسب لـ Case War Room ولوحات الإدارة */
export function Tabs({ items, defaultKey }: { items: TabItem[]; defaultKey?: string }) {
  const [active, setActive] = useState(defaultKey ?? items[0]?.key);
  const activeItem = items.find((i) => i.key === active);

  return (
    <div>
      <div className="scrollbar-none flex gap-1 overflow-x-auto border-b border-neutral-200">
        {items.map((item) => (
          <button
            key={item.key}
            onClick={() => setActive(item.key)}
            className={cn(
              'shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition-premium',
              active === item.key
                ? 'border-gold-500 text-charcoal-900'
                : 'border-transparent text-neutral-500 hover:text-charcoal-700',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="py-6">{activeItem?.content}</div>
    </div>
  );
}

import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  trend?: { direction: 'up' | 'down' | 'flat'; label: string };
  icon?: LucideIcon;
  tone?: 'default' | 'gold' | 'dark';
  className?: string;
}

/** بطاقة KPI — عنصر أساسي في الـ Design System، استخدام مقصود وغير مفرط */
export function StatCard({ label, value, trend, icon: Icon, tone = 'default', className }: StatCardProps) {
  return (
    <div
      className={cn(
        'ds-card flex flex-col gap-3 p-5',
        tone === 'dark' && 'border-charcoal-800 bg-charcoal-900 text-ivory-100',
        tone === 'gold' && 'border-gold-500/30 bg-gradient-to-br from-charcoal-900 to-charcoal-800 text-ivory-100',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <span className={cn('text-sm', tone === 'default' ? 'text-neutral-500' : 'text-neutral-300')}>{label}</span>
        {Icon && (
          <Icon
            className={cn('h-4 w-4', tone === 'default' ? 'text-neutral-400' : 'text-gold-400')}
            strokeWidth={1.5}
          />
        )}
      </div>
      <span className={cn('font-display text-3xl font-bold', tone !== 'default' ? 'text-ivory-100' : 'text-charcoal-900')}>
        {value}
      </span>
      {trend && (
        <span
          className={cn(
            'text-xs font-medium',
            trend.direction === 'up' && 'text-success',
            trend.direction === 'down' && 'text-danger',
            trend.direction === 'flat' && 'text-neutral-400',
          )}
        >
          {trend.label}
        </span>
      )}
    </div>
  );
}

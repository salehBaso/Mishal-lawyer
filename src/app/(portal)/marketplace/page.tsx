import Link from 'next/link';
import { getActor } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { assertPermission } from '@/lib/rbac/can';
import { PERMISSIONS } from '@/lib/rbac/permissions';
import { EmptyState } from '@/components/ui/empty-state';
import { Badge } from '@/components/ui/badge';
import { Store, Star, ShieldCheck } from 'lucide-react';
import { PROVIDER_CATEGORY_LABELS } from '@/lib/constants/marketplace';

export default async function MarketplacePage() {
  const actor = await getActor();
  if (!actor) return null;
  assertPermission(actor, PERMISSIONS.MARKETPLACE_BROWSE);

  const providers = await prisma.marketplaceProvider.findMany({
    where: { verification: 'VERIFIED' },
    include: { services: { where: { isActive: true }, take: 3 } },
    orderBy: { ratingAvg: 'desc' },
    take: 50,
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-charcoal-900">السوق القانوني</h1>
        <p className="mt-1 text-sm text-neutral-500">
          مقدّمو خدمات معتمدون: ترجمة، محاسبة، تقييم عقاري، خبراء تقنيون وأكثر.
        </p>
      </div>

      {providers.length === 0 ? (
        <EmptyState icon={Store} title="لا يوجد مقدّمو خدمات معتمدون حاليًا" />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {providers.map((p) => (
            <Link key={p.id} href={`/marketplace/${p.id}`} className="ds-card p-6 transition-premium hover:shadow-card">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display text-sm font-bold text-charcoal-900">{p.displayName}</h3>
                  <Badge tone="gold" className="mt-2">{PROVIDER_CATEGORY_LABELS[p.category]}</Badge>
                </div>
                <ShieldCheck className="h-4 w-4 text-success" strokeWidth={1.5} />
              </div>
              {p.bio && <p className="mt-3 line-clamp-2 text-xs leading-6 text-neutral-500">{p.bio}</p>}
              <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-4">
                <span className="flex items-center gap-1 text-xs text-neutral-500">
                  <Star className="h-3.5 w-3.5 fill-gold-400 text-gold-400" />
                  {Number(p.ratingAvg).toFixed(1)} ({p.ratingCount})
                </span>
                <span className="text-xs text-neutral-400">{p.yearsExperience ?? '—'} سنة خبرة</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

import { notFound } from 'next/navigation';
import { getActor } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { assertPermission, can } from '@/lib/rbac/can';
import { PERMISSIONS } from '@/lib/rbac/permissions';
import { Badge } from '@/components/ui/badge';
import { formatSAR } from '@/lib/utils';
import { Star, ShieldCheck } from 'lucide-react';
import { PROVIDER_CATEGORY_LABELS } from '@/lib/constants/marketplace';
import { RequestServiceForm } from '@/components/marketplace/request-service-form';

export default async function ProviderProfilePage({ params }: { params: { providerId: string } }) {
  const actor = await getActor();
  if (!actor) return null;
  assertPermission(actor, PERMISSIONS.MARKETPLACE_BROWSE);

  const provider = await prisma.marketplaceProvider.findUnique({
    where: { id: params.providerId },
    include: { services: { where: { isActive: true } } },
  });
  if (!provider) notFound();

  const canRequest = can(actor, PERMISSIONS.MARKETPLACE_REQUEST_SERVICE);

  return (
    <div className="space-y-8">
      <div className="ds-card-elevated p-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-charcoal-900">{provider.displayName}</h1>
            <p className="mt-1 text-sm text-neutral-500">{provider.specialization}</p>
            <div className="mt-3 flex items-center gap-3">
              <Badge tone="gold">{PROVIDER_CATEGORY_LABELS[provider.category]}</Badge>
              <span className="flex items-center gap-1 text-xs text-neutral-500">
                <Star className="h-3.5 w-3.5 fill-gold-400 text-gold-400" />
                {Number(provider.ratingAvg).toFixed(1)} ({provider.ratingCount} تقييم)
              </span>
              <span className="flex items-center gap-1 text-xs text-success">
                <ShieldCheck className="h-3.5 w-3.5" /> موثّق
              </span>
            </div>
          </div>
        </div>
        {provider.bio && <p className="mt-6 max-w-2xl text-sm leading-7 text-neutral-600">{provider.bio}</p>}
        {canRequest && (
          <div className="mt-6">
            <RequestServiceForm providerId={provider.id} />
          </div>
        )}
      </div>

      <section>
        <h2 className="mb-4 font-display text-base font-bold text-charcoal-900">الخدمات المقدَّمة</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {provider.services.map((s) => (
            <div key={s.id} className="ds-card p-5">
              <h3 className="text-sm font-semibold text-charcoal-900">{s.title}</h3>
              {s.description && <p className="mt-2 text-xs leading-6 text-neutral-500">{s.description}</p>}
              {s.priceFrom && (
                <p className="mt-3 text-xs font-medium text-gold-600">يبدأ من {formatSAR(Number(s.priceFrom))}</p>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

import Link from 'next/link';
import { getActor } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { assertPermission, can } from '@/lib/rbac/can';
import { PERMISSIONS } from '@/lib/rbac/permissions';
import { EmptyState } from '@/components/ui/empty-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Plus } from 'lucide-react';

export default async function ClientsPage() {
  const actor = await getActor();
  if (!actor) return null;
  assertPermission(actor, PERMISSIONS.CLIENT_VIEW_ALL);

  const clients = await prisma.client.findMany({
    where: { organizationId: actor.organizationId },
    include: { cases: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-charcoal-900">العملاء</h1>
          <p className="mt-1 text-sm text-neutral-500">{clients.length} عميل</p>
        </div>
        {can(actor, PERMISSIONS.CLIENT_MANAGE) && (
          <Link href="/clients/new">
            <Button size="sm">
              <Plus className="h-4 w-4" strokeWidth={1.75} />
              عميل جديد
            </Button>
          </Link>
        )}
      </div>

      {clients.length === 0 ? (
        <EmptyState icon={Users} title="لا يوجد عملاء بعد" />
      ) : (
        <div className="ds-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-right text-xs text-neutral-500">
              <tr>
                <th className="px-5 py-3 font-medium">الاسم</th>
                <th className="px-5 py-3 font-medium">النوع</th>
                <th className="px-5 py-3 font-medium">القضايا</th>
                <th className="px-5 py-3 font-medium">التواصل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {clients.map((c) => (
                <tr key={c.id} className="transition-premium hover:bg-neutral-50">
                  <td className="px-5 py-3 font-medium text-charcoal-900">{c.companyName ?? c.fullName}</td>
                  <td className="px-5 py-3">
                    <Badge tone="neutral">{c.type === 'CORPORATE' ? 'شركة' : 'فرد'}</Badge>
                  </td>
                  <td className="px-5 py-3 text-xs text-neutral-500">{c.cases.length}</td>
                  <td className="px-5 py-3 text-xs text-neutral-500" dir="ltr">{c.phone ?? c.email ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db/prisma';
import { getActor } from '@/lib/auth';
import { assertPermission } from '@/lib/rbac/can';
import { PERMISSIONS } from '@/lib/rbac/permissions';
import { createOrderSchema } from '@/lib/validation/invoice';
import { writeAuditLog } from '@/lib/audit/log';
import { sendNotification } from '@/lib/adapters/notifications';
import type { ActionResult } from '@/app/(portal)/cases/actions';

export async function requestMarketplaceServiceAction(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const actor = await getActor();
  assertPermission(actor, PERMISSIONS.MARKETPLACE_REQUEST_SERVICE);

  const raw = {
    providerId: formData.get('providerId'),
    serviceId: formData.get('serviceId') ?? '',
    brief: formData.get('brief'),
  };

  const parsed = createOrderSchema.safeParse(raw);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) errors[String(issue.path[0])] = issue.message;
    return { success: false, errors };
  }
  const data = parsed.data;

  const provider = await prisma.marketplaceProvider.findUnique({ where: { id: data.providerId } });
  if (!provider) return { success: false, message: 'مقدّم الخدمة غير موجود' };

  const order = await prisma.order.create({
    data: {
      organizationId: actor.organizationId,
      providerId: data.providerId,
      serviceId: data.serviceId || null,
      requestedById: actor.userId,
      brief: data.brief,
      status: 'REQUESTED',
    },
  });

  await writeAuditLog({
    organizationId: actor.organizationId,
    actorId: actor.userId,
    action: 'marketplace.order_requested',
    entityType: 'Order',
    entityId: order.id,
    description: `تم طلب خدمة من ${provider.displayName}`,
  });

  await sendNotification({
    organizationId: actor.organizationId,
    userId: provider.userId,
    channel: 'IN_APP',
    title: 'طلب خدمة جديد',
    body: data.brief,
    link: '/marketplace/my-orders',
  });

  revalidatePath(`/marketplace/${data.providerId}`);
  return { success: true, message: 'تم إرسال طلبك بنجاح — سيتواصل معك مقدّم الخدمة قريبًا.' };
}

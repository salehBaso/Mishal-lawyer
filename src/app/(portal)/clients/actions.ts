'use server';

import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import { getActor } from '@/lib/auth';
import { assertPermission } from '@/lib/rbac/can';
import { PERMISSIONS } from '@/lib/rbac/permissions';
import { createClientSchema } from '@/lib/validation/client';
import { writeAuditLog } from '@/lib/audit/log';
import type { ActionResult } from '@/app/(portal)/cases/actions';

export async function createClientAction(_prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  const actor = await getActor();
  assertPermission(actor, PERMISSIONS.CLIENT_MANAGE);

  const raw = {
    type: formData.get('type') ?? 'INDIVIDUAL',
    fullName: formData.get('fullName'),
    companyName: formData.get('companyName') ?? '',
    commercialRegNo: formData.get('commercialRegNo') ?? '',
    nationalId: formData.get('nationalId') ?? '',
    email: formData.get('email') ?? '',
    phone: formData.get('phone') ?? '',
    notes: formData.get('notes') ?? '',
  };

  const parsed = createClientSchema.safeParse(raw);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      errors[String(issue.path[0])] = issue.message;
    }
    return { success: false, errors };
  }

  const data = parsed.data;

  const client = await prisma.client.create({
    data: {
      organizationId: actor.organizationId,
      type: data.type,
      fullName: data.fullName,
      companyName: data.companyName || null,
      commercialRegNo: data.commercialRegNo || null,
      nationalId: data.nationalId || null,
      email: data.email || null,
      phone: data.phone || null,
      notes: data.notes || null,
    },
  });

  await writeAuditLog({
    organizationId: actor.organizationId,
    actorId: actor.userId,
    action: 'client.created',
    entityType: 'Client',
    entityId: client.id,
    description: `تم إضافة عميل جديد: ${client.companyName ?? client.fullName}`,
  });

  redirect('/clients');
}

'use server';

import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import { getActor } from '@/lib/auth';
import { assertPermission } from '@/lib/rbac/can';
import { PERMISSIONS } from '@/lib/rbac/permissions';
import { createCaseSchema } from '@/lib/validation/case';
import { writeAuditLog } from '@/lib/audit/log';
import { sendNotification } from '@/lib/adapters/notifications';

export interface ActionResult {
  success: boolean;
  errors?: Record<string, string>;
  message?: string;
}

export async function createCaseAction(_prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  const actor = await getActor();
  assertPermission(actor, PERMISSIONS.CASE_CREATE);

  const raw = {
    title: formData.get('title'),
    practiceAreaId: formData.get('practiceAreaId'),
    clientId: formData.get('clientId'),
    opposingPartyName: formData.get('opposingPartyName') ?? '',
    courtName: formData.get('courtName') ?? '',
    claimAmount: formData.get('claimAmount') || undefined,
    riskLevel: formData.get('riskLevel') || 'MEDIUM',
    leadLawyerId: formData.get('leadLawyerId'),
  };

  const parsed = createCaseSchema.safeParse(raw);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      errors[String(issue.path[0])] = issue.message;
    }
    return { success: false, errors };
  }

  const data = parsed.data;

  const client = await prisma.client.findFirst({ where: { id: data.clientId, organizationId: actor.organizationId } });
  if (!client) return { success: false, errors: { clientId: 'العميل المحدد غير موجود' } };

  const lawyer = await prisma.lawyer.findFirst({
    where: { id: data.leadLawyerId },
    include: { user: true },
  });
  if (!lawyer || lawyer.user.organizationId !== actor.organizationId) {
    return { success: false, errors: { leadLawyerId: 'المحامي المحدد غير موجود' } };
  }

  const caseCount = await prisma.case.count({ where: { organizationId: actor.organizationId } });
  const caseNumber = `${new Date().getFullYear()}-${String(100 + caseCount + 1)}`;

  const newCase = await prisma.case.create({
    data: {
      organizationId: actor.organizationId,
      caseNumber,
      title: data.title,
      practiceAreaId: data.practiceAreaId,
      claimAmount: data.claimAmount,
      courtName: data.courtName || null,
      riskLevel: data.riskLevel,
      status: 'INTAKE',
      parties: {
        create: [
          { clientId: client.id, role: 'CLIENT', name: client.companyName ?? client.fullName },
          ...(data.opposingPartyName ? [{ role: 'OPPOSING_PARTY' as const, name: data.opposingPartyName }] : []),
        ],
      },
      assignments: {
        create: [{ userId: lawyer.user.id, lawyerId: lawyer.id, role: 'Lead Lawyer' }],
      },
    },
  });

  await writeAuditLog({
    organizationId: actor.organizationId,
    actorId: actor.userId,
    caseId: newCase.id,
    action: 'case.created',
    entityType: 'Case',
    entityId: newCase.id,
    description: `تم إنشاء قضية جديدة رقم ${newCase.caseNumber}`,
  });

  await sendNotification({
    organizationId: actor.organizationId,
    userId: lawyer.user.id,
    channel: 'IN_APP',
    title: 'قضية جديدة مُسندة إليك',
    body: `تم إسنادك كمحامٍ مسؤول عن القضية "${newCase.title}"`,
    link: `/cases/${newCase.id}`,
  });

  redirect(`/cases/${newCase.id}`);
}

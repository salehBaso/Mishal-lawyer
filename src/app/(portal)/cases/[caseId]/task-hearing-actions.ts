'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db/prisma';
import { getActor } from '@/lib/auth';
import { assertPermission, assertSameOrganization } from '@/lib/rbac/can';
import { PERMISSIONS } from '@/lib/rbac/permissions';
import { createTaskSchema, createHearingSchema } from '@/lib/validation/task';
import { writeAuditLog } from '@/lib/audit/log';
import { sendNotification } from '@/lib/adapters/notifications';
import { DEFAULT_HEARING_REMINDER_OFFSETS_MIN } from '@/lib/adapters/notifications';
import type { ActionResult } from '@/app/(portal)/cases/actions';

export async function createTaskAction(_prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  const actor = await getActor();
  assertPermission(actor, PERMISSIONS.CASE_EDIT);

  const raw = {
    caseId: formData.get('caseId'),
    title: formData.get('title'),
    description: formData.get('description') ?? '',
    assigneeId: formData.get('assigneeId'),
    priority: formData.get('priority') || 'NORMAL',
    dueAt: formData.get('dueAt') ?? '',
  };

  const parsed = createTaskSchema.safeParse(raw);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) errors[String(issue.path[0])] = issue.message;
    return { success: false, errors };
  }
  const data = parsed.data;

  const caseRecord = await prisma.case.findUniqueOrThrow({ where: { id: data.caseId } });
  assertSameOrganization(actor, caseRecord.organizationId);

  const task = await prisma.caseTask.create({
    data: {
      caseId: data.caseId,
      title: data.title,
      description: data.description || null,
      assigneeId: data.assigneeId,
      createdById: actor.userId,
      priority: data.priority,
      dueAt: data.dueAt ? new Date(data.dueAt) : null,
    },
  });

  await writeAuditLog({
    organizationId: actor.organizationId,
    actorId: actor.userId,
    caseId: data.caseId,
    action: 'task.created',
    entityType: 'CaseTask',
    entityId: task.id,
    description: `تم إنشاء مهمة جديدة: ${task.title}`,
  });

  await sendNotification({
    organizationId: actor.organizationId,
    userId: data.assigneeId,
    channel: 'IN_APP',
    title: 'مهمة جديدة مُسندة إليك',
    body: task.title,
    link: `/cases/${data.caseId}`,
  });

  revalidatePath(`/cases/${data.caseId}`);
  return { success: true };
}

export async function createHearingAction(_prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  const actor = await getActor();
  assertPermission(actor, PERMISSIONS.CASE_EDIT);

  const raw = {
    caseId: formData.get('caseId'),
    courtName: formData.get('courtName') ?? '',
    location: formData.get('location') ?? '',
    scheduledAt: formData.get('scheduledAt'),
    durationMin: formData.get('durationMin') || 60,
    attendeeUserId: formData.get('attendeeUserId'),
  };

  const parsed = createHearingSchema.safeParse(raw);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) errors[String(issue.path[0])] = issue.message;
    return { success: false, errors };
  }
  const data = parsed.data;

  const caseRecord = await prisma.case.findUniqueOrThrow({ where: { id: data.caseId } });
  assertSameOrganization(actor, caseRecord.organizationId);

  const hearing = await prisma.hearing.create({
    data: {
      caseId: data.caseId,
      courtName: data.courtName || null,
      location: data.location || null,
      scheduledAt: new Date(data.scheduledAt),
      durationMin: data.durationMin,
      reminderOffsetsMin: DEFAULT_HEARING_REMINDER_OFFSETS_MIN,
      attendees: { create: [{ userId: data.attendeeUserId }] },
    },
  });

  await writeAuditLog({
    organizationId: actor.organizationId,
    actorId: actor.userId,
    caseId: data.caseId,
    action: 'hearing.scheduled',
    entityType: 'Hearing',
    entityId: hearing.id,
    description: `تم جدولة جلسة جديدة للقضية`,
  });

  revalidatePath(`/cases/${data.caseId}`);
  return { success: true };
}

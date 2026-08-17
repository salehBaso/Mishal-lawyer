'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db/prisma';
import { getActor } from '@/lib/auth';
import { assertPermission, ForbiddenError } from '@/lib/rbac/can';
import { PERMISSIONS } from '@/lib/rbac/permissions';
import { requestUploadSchema, type RequestUploadInput } from '@/lib/validation/document';
import { buildStorageKey, getUploadUrl } from '@/lib/adapters/storage';
import { writeAuditLog } from '@/lib/audit/log';
import { sendNotification } from '@/lib/adapters/notifications';

/**
 * تدفّق رفع مستند آمن (نمط Signed URL على مرحلتين):
 *  1) requestDocumentUpload: يتحقق من الصلاحية والملف، ينشئ سجل Document/DocumentVersion،
 *     ويُرجع رابط رفع موقّع (PUT) محدود الصلاحية — الرفع الفعلي يتم من المتصفح مباشرة
 *     إلى التخزين، وليس عبر خادم التطبيق (يقلل الحمل ويمنع مرور الملف بذاكرة السيرفر).
 *  2) confirmDocumentUpload: يُستدعى من المتصفح بعد نجاح الـ PUT لتأكيد الحالة وتسجيل
 *     Audit Log وإشعار المحامي المسؤول. لا نثق بأن الرفع نجح إلا بهذا التأكيد الصريح.
 *
 * ملاحظة: يتطلب هذا التدفّق بيانات اعتماد S3-compatible حقيقية في .env (راجع
 * STORAGE_* في .env.example). في بيئة تطوير بدون تخزين مهيّأ، ستفشل getUploadUrl
 * برسالة خطأ واضحة بدل محاكاة نجاح وهمي.
 */

export interface RequestUploadResult {
  documentId: string;
  versionId: string;
  uploadUrl: string;
}

export async function requestDocumentUploadAction(input: RequestUploadInput): Promise<RequestUploadResult> {
  const actor = await getActor();
  assertPermission(actor, PERMISSIONS.DOCUMENT_UPLOAD);

  const parsed = requestUploadSchema.parse(input);

  // إن كان المستند مطلوبًا مسبقًا (Required Document)، تحقق من صلاحية الوصول له
  let caseId = parsed.caseId ?? null;
  if (parsed.documentId) {
    const existing = await prisma.document.findUnique({ where: { id: parsed.documentId } });
    if (!existing || existing.organizationId !== actor.organizationId) {
      throw new ForbiddenError('المستند المطلوب تحديثه غير موجود');
    }
    // العميل لا يستطيع تحديث مستند لا يخص إحدى قضاياه
    if (actor.role === 'CLIENT') {
      const owns = await prisma.caseParty.findFirst({
        where: { caseId: existing.caseId ?? undefined, clientId: actor.clientId ?? undefined },
      });
      if (!owns) throw new ForbiddenError();
    }
    caseId = existing.caseId;
  }

  const storageKey = buildStorageKey(actor.organizationId, caseId, parsed.fileName);

  const document = parsed.documentId
    ? await prisma.document.update({
        where: { id: parsed.documentId },
        data: { status: 'SUBMITTED', updatedAt: new Date() },
      })
    : await prisma.document.create({
        data: {
          organizationId: actor.organizationId,
          caseId,
          title: parsed.title,
          status: 'SUBMITTED',
          uploadedById: actor.userId,
        },
      });

  const lastVersion = await prisma.documentVersion.findFirst({
    where: { documentId: document.id },
    orderBy: { versionNumber: 'desc' },
  });
  const nextVersion = (lastVersion?.versionNumber ?? 0) + 1;

  const version = await prisma.documentVersion.create({
    data: {
      documentId: document.id,
      versionNumber: nextVersion,
      storageKey,
      fileName: parsed.fileName,
      mimeType: parsed.mimeType,
      sizeBytes: parsed.sizeBytes,
      uploadedById: actor.userId,
    },
  });

  const uploadUrl = await getUploadUrl(storageKey, parsed.mimeType);

  return { documentId: document.id, versionId: version.id, uploadUrl };
}

export async function confirmDocumentUploadAction(documentId: string) {
  const actor = await getActor();
  assertPermission(actor, PERMISSIONS.DOCUMENT_UPLOAD);

  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: { case: { include: { assignments: true } } },
  });
  if (!document || document.organizationId !== actor.organizationId) {
    throw new ForbiddenError('المستند غير موجود');
  }

  await writeAuditLog({
    organizationId: actor.organizationId,
    actorId: actor.userId,
    caseId: document.caseId,
    action: 'document.uploaded',
    entityType: 'Document',
    entityId: document.id,
    description: `تم رفع المستند "${document.title}"`,
  });

  // إشعار كل محامٍ مُخوَّل على القضية
  if (document.case) {
    for (const assignment of document.case.assignments) {
      await sendNotification({
        organizationId: actor.organizationId,
        userId: assignment.userId,
        channel: 'IN_APP',
        title: 'مستند جديد بانتظار المراجعة',
        body: `تم رفع المستند "${document.title}" في القضية "${document.case.title}"`,
        link: `/cases/${document.case.id}`,
      });
    }
  }

  revalidatePath('/documents');
  if (document.caseId) revalidatePath(`/cases/${document.caseId}`);
  revalidatePath('/dashboard/client');

  return { success: true };
}

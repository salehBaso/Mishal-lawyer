import 'server-only';
import { prisma } from '@/lib/db/prisma';
import type { Prisma } from '@prisma/client';

interface AuditInput {
  organizationId: string;
  actorId?: string | null;
  caseId?: string | null;
  action: string; // e.g. "document.download"
  entityType: string;
  entityId?: string | null;
  description: string; // نص جاهز للعرض المباشر
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
  userAgent?: string | null;
}

/**
 * كتابة سجل تدقيق — هذه هي الطريقة الوحيدة المسموح بها لإنشاء AuditLog.
 * عمدًا لا يوجد update()/delete() هنا: السجل غير قابل للتعديل من التطبيق.
 * كل Server Action حسّاس (تنزيل مستند، تغيير حالة قضية، تعيين محامٍ...)
 * يجب أن يستدعي هذه الدالة بعد نجاح العملية مباشرة.
 */
export async function writeAuditLog(input: AuditInput) {
  return prisma.auditLog.create({
    data: {
      organizationId: input.organizationId,
      actorId: input.actorId ?? null,
      caseId: input.caseId ?? null,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId ?? null,
      description: input.description,
      metadata: (input.metadata as Prisma.InputJsonValue | undefined) ?? undefined,
      ipAddress: input.ipAddress ?? null,
      userAgent: input.userAgent ?? null,
    },
  });
}

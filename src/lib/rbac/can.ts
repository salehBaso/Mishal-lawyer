import 'server-only';
import { roleHasPermission, type Permission, type RoleName } from './permissions';

/**
 * نتيجة تحقق من الصلاحية — تُستخدم من Server Actions / Route Handlers.
 * هذه هي طبقة التحقق "الملزِمة أمنيًا"؛ لا تثق أبدًا بحالة الواجهة وحدها.
 */
export interface SessionActor {
  userId: string;
  organizationId: string;
  role: RoleName;
  clientId?: string | null; // إن كان المستخدم عميلاً
}

export class ForbiddenError extends Error {
  constructor(message = 'ليست لديك صلاحية للقيام بهذا الإجراء') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export function can(actor: SessionActor | null | undefined, permission: Permission): boolean {
  if (!actor) return false;
  return roleHasPermission(actor.role, permission);
}

/** يرمي ForbiddenError إن لم تتوفر الصلاحية — للاستخدام المباشر في أعلى كل Server Action */
export function assertPermission(actor: SessionActor | null | undefined, permission: Permission): asserts actor is SessionActor {
  if (!can(actor, permission)) {
    throw new ForbiddenError();
  }
}

/**
 * يفرض عزل بيانات المؤسسة (Multi-Tenant) — يجب استدعاؤه في كل استعلام
 * يمس بيانات تخص مؤسسة (Case/Document/Invoice...).
 */
export function assertSameOrganization(actor: SessionActor, resourceOrgId: string) {
  if (actor.organizationId !== resourceOrgId) {
    throw new ForbiddenError('هذا المورد لا ينتمي إلى مؤسستك');
  }
}

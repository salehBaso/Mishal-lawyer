/**
 * مصفوفة الصلاحيات (RBAC) — شركة مشعل الجهني للمحاماة والاستشارات
 *
 * هذا الملف هو "مصدر الحقيقة" لصلاحيات كل دور، ويُستخدم:
 *  1) في seed.ts لتعبئة جداول Role/Permission/RolePermission في قاعدة البيانات.
 *  2) في can() كطبقة تحقق سريعة في الذاكرة (بدون استعلام DB) لواجهات العرض
 *     (إظهار/إخفاء أزرار)، على أن يبقى التحقق الحقيقي والملزِم من الناحية
 *     الأمنية دائمًا Server-Side (Route Handlers / Server Actions).
 *
 * قاعدة صارمة: لا تعتمد أبدًا على إخفاء عنصر واجهة كإجراء أمني وحيد.
 * كل Server Action / Route Handler يجب أن يستدعي assertPermission() بنفسه.
 */

export type RoleName =
  | 'SUPER_ADMIN'
  | 'FIRM_ADMIN'
  | 'MANAGING_PARTNER'
  | 'LAWYER'
  | 'LEGAL_RESEARCHER'
  | 'CASE_COORDINATOR'
  | 'ACCOUNTANT'
  | 'CLIENT'
  | 'SERVICE_PROVIDER'
  | 'EXTERNAL_EXPERT'
  | 'READ_ONLY';

export const ROLE_LABELS: Record<RoleName, { en: string; ar: string }> = {
  SUPER_ADMIN: { en: 'Super Admin', ar: 'مدير النظام العام' },
  FIRM_ADMIN: { en: 'Firm Admin', ar: 'مدير المكتب' },
  MANAGING_PARTNER: { en: 'Managing Partner', ar: 'الشريك المدير' },
  LAWYER: { en: 'Lawyer', ar: 'محامٍ' },
  LEGAL_RESEARCHER: { en: 'Legal Researcher', ar: 'باحث قانوني' },
  CASE_COORDINATOR: { en: 'Case Coordinator', ar: 'منسّق قضايا' },
  ACCOUNTANT: { en: 'Accountant', ar: 'محاسب' },
  CLIENT: { en: 'Client', ar: 'عميل' },
  SERVICE_PROVIDER: { en: 'Service Provider', ar: 'مقدّم خدمة' },
  EXTERNAL_EXPERT: { en: 'External Expert', ar: 'خبير خارجي' },
  READ_ONLY: { en: 'Read Only User', ar: 'مستخدم اطّلاع فقط' },
};

/** صيغة الصلاحية: "resource.action" — استخدم "*" للسماح بكل شيء (Super Admin فقط) */
export type Permission = string;

export const PERMISSIONS = {
  ALL: '*',

  // Cases
  CASE_VIEW_ASSIGNED: 'case.view_assigned',
  CASE_VIEW_ALL_ORG: 'case.view_all_org',
  CASE_VIEW_OWN: 'case.view_own', // للعميل: قضاياه فقط
  CASE_CREATE: 'case.create',
  CASE_EDIT: 'case.edit',
  CASE_CHANGE_STATUS: 'case.change_status',
  CASE_DELETE: 'case.delete',
  CASE_ASSIGN: 'case.assign',

  // Documents
  DOCUMENT_VIEW: 'document.view',
  DOCUMENT_UPLOAD: 'document.upload',
  DOCUMENT_DOWNLOAD: 'document.download',
  DOCUMENT_APPROVE: 'document.approve',
  DOCUMENT_DELETE: 'document.delete',

  // Financials
  FINANCIAL_VIEW: 'financial.view',
  FINANCIAL_MANAGE: 'financial.manage',
  INVOICE_CREATE: 'invoice.create',
  PAYMENT_VIEW: 'payment.view',

  // Clients
  CLIENT_VIEW_ALL: 'client.view_all',
  CLIENT_MANAGE: 'client.manage',

  // Marketplace
  MARKETPLACE_BROWSE: 'marketplace.browse',
  MARKETPLACE_REQUEST_SERVICE: 'marketplace.request_service',
  MARKETPLACE_MANAGE_OWN_PROFILE: 'marketplace.manage_own_profile',
  MARKETPLACE_MANAGE_ORDERS: 'marketplace.manage_orders',

  // AI
  AI_RUN_ANALYSIS: 'ai.run_analysis',
  AI_LEGAL_RESEARCH: 'ai.legal_research',

  // Admin
  ADMIN_MANAGE_USERS: 'admin.manage_users',
  ADMIN_MANAGE_ROLES: 'admin.manage_roles',
  ADMIN_VIEW_ANALYTICS: 'admin.view_analytics',
  ADMIN_MANAGE_INTEGRATIONS: 'admin.manage_integrations',
  ADMIN_VIEW_AUDIT_LOG: 'admin.view_audit_log',

  // Messaging
  MESSAGE_SEND: 'message.send',
  MESSAGE_VIEW: 'message.view',
} as const;

/**
 * مصفوفة الأدوار → الصلاحيات.
 * ملاحظة مهمة (مطابقة لمتطلبات المنتج):
 *  - العميل (CLIENT) لا يملك أي صلاحية "view_all" — فقط CASE_VIEW_OWN،
 *    ويُفرض ذلك أيضًا على مستوى الاستعلام (WHERE clientId = currentClientId).
 *  - المحاسب (ACCOUNTANT) يرى المالية لكن لا يملك DOCUMENT_VIEW افتراضيًا —
 *    فقط عند تخويل صريح على قضية محددة (استثناء يُدار عبر CaseAssignment).
 *  - مدير المكتب/الشريك المدير لديهما رؤية شاملة داخل المؤسسة فقط
 *    (وليس عبر مؤسسات أخرى — multi-tenant isolation تُفرض دائمًا في طبقة DB).
 */
export const ROLE_PERMISSIONS: Record<RoleName, Permission[]> = {
  SUPER_ADMIN: [PERMISSIONS.ALL],

  FIRM_ADMIN: [
    PERMISSIONS.CASE_VIEW_ALL_ORG,
    PERMISSIONS.CASE_CREATE,
    PERMISSIONS.CASE_EDIT,
    PERMISSIONS.CASE_CHANGE_STATUS,
    PERMISSIONS.CASE_DELETE,
    PERMISSIONS.CASE_ASSIGN,
    PERMISSIONS.DOCUMENT_VIEW,
    PERMISSIONS.DOCUMENT_UPLOAD,
    PERMISSIONS.DOCUMENT_DOWNLOAD,
    PERMISSIONS.DOCUMENT_APPROVE,
    PERMISSIONS.DOCUMENT_DELETE,
    PERMISSIONS.FINANCIAL_VIEW,
    PERMISSIONS.FINANCIAL_MANAGE,
    PERMISSIONS.INVOICE_CREATE,
    PERMISSIONS.PAYMENT_VIEW,
    PERMISSIONS.CLIENT_VIEW_ALL,
    PERMISSIONS.CLIENT_MANAGE,
    PERMISSIONS.MARKETPLACE_BROWSE,
    PERMISSIONS.MARKETPLACE_REQUEST_SERVICE,
    PERMISSIONS.MARKETPLACE_MANAGE_ORDERS,
    PERMISSIONS.AI_RUN_ANALYSIS,
    PERMISSIONS.AI_LEGAL_RESEARCH,
    PERMISSIONS.ADMIN_MANAGE_USERS,
    PERMISSIONS.ADMIN_MANAGE_ROLES,
    PERMISSIONS.ADMIN_VIEW_ANALYTICS,
    PERMISSIONS.ADMIN_MANAGE_INTEGRATIONS,
    PERMISSIONS.ADMIN_VIEW_AUDIT_LOG,
    PERMISSIONS.MESSAGE_SEND,
    PERMISSIONS.MESSAGE_VIEW,
  ],

  MANAGING_PARTNER: [
    PERMISSIONS.CASE_VIEW_ALL_ORG,
    PERMISSIONS.CASE_CREATE,
    PERMISSIONS.CASE_EDIT,
    PERMISSIONS.CASE_CHANGE_STATUS,
    PERMISSIONS.CASE_ASSIGN,
    PERMISSIONS.DOCUMENT_VIEW,
    PERMISSIONS.DOCUMENT_UPLOAD,
    PERMISSIONS.DOCUMENT_DOWNLOAD,
    PERMISSIONS.DOCUMENT_APPROVE,
    PERMISSIONS.FINANCIAL_VIEW,
    PERMISSIONS.PAYMENT_VIEW,
    PERMISSIONS.CLIENT_VIEW_ALL,
    PERMISSIONS.MARKETPLACE_BROWSE,
    PERMISSIONS.MARKETPLACE_REQUEST_SERVICE,
    PERMISSIONS.AI_RUN_ANALYSIS,
    PERMISSIONS.AI_LEGAL_RESEARCH,
    PERMISSIONS.ADMIN_VIEW_ANALYTICS,
    PERMISSIONS.ADMIN_VIEW_AUDIT_LOG,
    PERMISSIONS.MESSAGE_SEND,
    PERMISSIONS.MESSAGE_VIEW,
  ],

  LAWYER: [
    PERMISSIONS.CASE_VIEW_ASSIGNED,
    PERMISSIONS.CASE_EDIT,
    PERMISSIONS.CASE_CHANGE_STATUS,
    PERMISSIONS.DOCUMENT_VIEW,
    PERMISSIONS.DOCUMENT_UPLOAD,
    PERMISSIONS.DOCUMENT_DOWNLOAD,
    PERMISSIONS.DOCUMENT_APPROVE,
    PERMISSIONS.MARKETPLACE_BROWSE,
    PERMISSIONS.MARKETPLACE_REQUEST_SERVICE,
    PERMISSIONS.AI_RUN_ANALYSIS,
    PERMISSIONS.AI_LEGAL_RESEARCH,
    PERMISSIONS.MESSAGE_SEND,
    PERMISSIONS.MESSAGE_VIEW,
  ],

  LEGAL_RESEARCHER: [
    PERMISSIONS.CASE_VIEW_ASSIGNED,
    PERMISSIONS.DOCUMENT_VIEW,
    PERMISSIONS.DOCUMENT_UPLOAD,
    PERMISSIONS.AI_LEGAL_RESEARCH,
    PERMISSIONS.MESSAGE_SEND,
    PERMISSIONS.MESSAGE_VIEW,
  ],

  CASE_COORDINATOR: [
    PERMISSIONS.CASE_VIEW_ASSIGNED,
    PERMISSIONS.CASE_EDIT,
    PERMISSIONS.DOCUMENT_VIEW,
    PERMISSIONS.DOCUMENT_UPLOAD,
    PERMISSIONS.MARKETPLACE_BROWSE,
    PERMISSIONS.MARKETPLACE_REQUEST_SERVICE,
    PERMISSIONS.MESSAGE_SEND,
    PERMISSIONS.MESSAGE_VIEW,
  ],

  ACCOUNTANT: [
    PERMISSIONS.FINANCIAL_VIEW,
    PERMISSIONS.FINANCIAL_MANAGE,
    PERMISSIONS.INVOICE_CREATE,
    PERMISSIONS.PAYMENT_VIEW,
    PERMISSIONS.CLIENT_VIEW_ALL,
    PERMISSIONS.MESSAGE_VIEW,
    // ملاحظة: لا يملك DOCUMENT_VIEW افتراضيًا (مستندات قانونية حساسة)
  ],

  CLIENT: [
    PERMISSIONS.CASE_VIEW_OWN,
    PERMISSIONS.DOCUMENT_VIEW, // مقيّد بمستنداته/قضاياه فقط عبر الاستعلام
    PERMISSIONS.DOCUMENT_UPLOAD,
    PERMISSIONS.PAYMENT_VIEW,
    PERMISSIONS.MARKETPLACE_BROWSE, // اطّلاع فقط، الطلب عبر المحامي
    PERMISSIONS.MESSAGE_SEND,
    PERMISSIONS.MESSAGE_VIEW,
  ],

  SERVICE_PROVIDER: [
    PERMISSIONS.MARKETPLACE_MANAGE_OWN_PROFILE,
    PERMISSIONS.MESSAGE_SEND,
    PERMISSIONS.MESSAGE_VIEW,
  ],

  EXTERNAL_EXPERT: [
    PERMISSIONS.CASE_VIEW_ASSIGNED,
    PERMISSIONS.DOCUMENT_VIEW,
    PERMISSIONS.MESSAGE_VIEW,
    PERMISSIONS.MESSAGE_SEND,
  ],

  READ_ONLY: [PERMISSIONS.CASE_VIEW_ASSIGNED, PERMISSIONS.DOCUMENT_VIEW, PERMISSIONS.MESSAGE_VIEW],
};

export function roleHasPermission(role: RoleName, permission: Permission): boolean {
  const perms = ROLE_PERMISSIONS[role];
  if (!perms) return false;
  return perms.includes(PERMISSIONS.ALL) || perms.includes(permission);
}

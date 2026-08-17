import type { RoleName } from '@/lib/rbac/permissions';
import { PERMISSIONS, type Permission } from '@/lib/rbac/permissions';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  FileText,
  CalendarClock,
  ListChecks,
  MessageSquare,
  Receipt,
  CreditCard,
  Store,
  BarChart3,
  Sparkles,
  Settings,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  requiredPermission?: Permission;
}

/**
 * تنقّل موحّد للبوابة — يُصفَّى تلقائيًا حسب صلاحيات الدور (RBAC) بحيث
 * لا يرى المستخدم رابطًا لا يملك صلاحية الوصول إليه أصلاً.
 */
export const PORTAL_NAV: NavItem[] = [
  { href: '/dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
  { href: '/cases', label: 'القضايا', icon: Briefcase, requiredPermission: PERMISSIONS.CASE_VIEW_ASSIGNED },
  { href: '/clients', label: 'العملاء', icon: Users, requiredPermission: PERMISSIONS.CLIENT_VIEW_ALL },
  { href: '/documents', label: 'المستندات', icon: FileText, requiredPermission: PERMISSIONS.DOCUMENT_VIEW },
  { href: '/sessions', label: 'الجلسات', icon: CalendarClock },
  { href: '/tasks', label: 'المهام', icon: ListChecks },
  { href: '/messages', label: 'الرسائل', icon: MessageSquare, requiredPermission: PERMISSIONS.MESSAGE_VIEW },
  { href: '/billing', label: 'الفوترة', icon: Receipt, requiredPermission: PERMISSIONS.FINANCIAL_VIEW },
  { href: '/billing/payments', label: 'المدفوعات', icon: CreditCard, requiredPermission: PERMISSIONS.PAYMENT_VIEW },
  { href: '/marketplace', label: 'السوق القانوني', icon: Store, requiredPermission: PERMISSIONS.MARKETPLACE_BROWSE },
  { href: '/reports', label: 'التقارير', icon: BarChart3, requiredPermission: PERMISSIONS.ADMIN_VIEW_ANALYTICS },
  { href: '/ai-intelligence', label: 'الذكاء الاصطناعي', icon: Sparkles, requiredPermission: PERMISSIONS.AI_RUN_ANALYSIS },
  { href: '/settings', label: 'الإعدادات', icon: Settings },
];

export function filterNavByRole(items: NavItem[], role: RoleName, hasPermission: (p: Permission) => boolean): NavItem[] {
  return items.filter((item) => !item.requiredPermission || hasPermission(item.requiredPermission));
}

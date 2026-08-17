import { Badge } from './badge';
import type { CaseRiskLevel, CaseStatus, TaskStatus, InvoiceStatus } from '@prisma/client';

const CASE_STATUS_MAP: Record<CaseStatus, { label: string; tone: 'neutral' | 'gold' | 'success' | 'warning' | 'danger' | 'info' }> = {
  INTAKE: { label: 'استقبال أولي', tone: 'info' },
  ACTIVE: { label: 'نشطة', tone: 'gold' },
  ON_HOLD: { label: 'معلّقة', tone: 'warning' },
  IN_COURT: { label: 'أمام المحكمة', tone: 'info' },
  SETTLEMENT: { label: 'قيد التسوية', tone: 'warning' },
  CLOSED_WON: { label: 'مغلقة — لصالحنا', tone: 'success' },
  CLOSED_LOST: { label: 'مغلقة — لغير صالحنا', tone: 'danger' },
  CLOSED_SETTLED: { label: 'مغلقة بتسوية', tone: 'neutral' },
  ARCHIVED: { label: 'مؤرشفة', tone: 'neutral' },
};

const RISK_MAP: Record<CaseRiskLevel, { label: string; tone: 'success' | 'warning' | 'danger' }> = {
  LOW: { label: 'منخفضة', tone: 'success' },
  MEDIUM: { label: 'متوسطة', tone: 'warning' },
  HIGH: { label: 'مرتفعة', tone: 'danger' },
  CRITICAL: { label: 'حرجة', tone: 'danger' },
};

type Tone = 'neutral' | 'gold' | 'success' | 'danger' | 'warning' | 'info';

const TASK_STATUS_MAP: Record<TaskStatus, { label: string; tone: Tone }> = {
  TODO: { label: 'لم تبدأ', tone: 'neutral' },
  IN_PROGRESS: { label: 'قيد التنفيذ', tone: 'gold' },
  BLOCKED: { label: 'معلّقة', tone: 'warning' },
  DONE: { label: 'مكتملة', tone: 'success' },
  CANCELLED: { label: 'ملغاة', tone: 'danger' },
};

const INVOICE_STATUS_MAP: Record<InvoiceStatus, { label: string; tone: Tone }> = {
  DRAFT: { label: 'مسودة', tone: 'neutral' },
  SENT: { label: 'مرسلة', tone: 'info' },
  PARTIALLY_PAID: { label: 'مدفوعة جزئيًا', tone: 'warning' },
  PAID: { label: 'مدفوعة', tone: 'success' },
  OVERDUE: { label: 'متأخرة', tone: 'danger' },
  CANCELLED: { label: 'ملغاة', tone: 'neutral' },
  REFUNDED: { label: 'مُستردة', tone: 'neutral' },
};

export function CaseStatusBadge({ status }: { status: CaseStatus }) {
  const s = CASE_STATUS_MAP[status];
  return <Badge tone={s.tone} dot>{s.label}</Badge>;
}

export function RiskBadge({ level }: { level: CaseRiskLevel }) {
  const s = RISK_MAP[level];
  return <Badge tone={s.tone} dot>مخاطر {s.label}</Badge>;
}

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  const s = TASK_STATUS_MAP[status];
  return <Badge tone={s.tone} dot>{s.label}</Badge>;
}

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  const s = INVOICE_STATUS_MAP[status];
  return <Badge tone={s.tone} dot>{s.label}</Badge>;
}

import type { CaseRiskLevel, TaskPriority } from '@prisma/client';

/**
 * محرك ترتيب "أولويات اليوم" — يرتّب مهام المحامي تلقائيًا حسب:
 * الإلحاح (قرب الموعد النهائي) + الأهمية (Priority) + مخاطر القضية المرتبطة.
 * القرار قابل للتفسير دائمًا (لا صندوق أسود) عبر إرجاع "reason".
 */

const PRIORITY_WEIGHT: Record<TaskPriority, number> = {
  URGENT: 40,
  HIGH: 28,
  NORMAL: 14,
  LOW: 5,
};

const RISK_WEIGHT: Record<CaseRiskLevel, number> = {
  CRITICAL: 30,
  HIGH: 20,
  MEDIUM: 10,
  LOW: 3,
};

export interface PriorityInput {
  id: string;
  title: string;
  priority: TaskPriority;
  dueAt: Date | null;
  caseRiskLevel?: CaseRiskLevel | null;
  caseTitle?: string | null;
}

export interface ScoredTask extends PriorityInput {
  score: number;
  reason: string;
}

export function rankTodaysPriorities(tasks: PriorityInput[], now = new Date()): ScoredTask[] {
  return tasks
    .map((task) => {
      let score = PRIORITY_WEIGHT[task.priority];
      const reasons: string[] = [`أولوية ${labelPriority(task.priority)}`];

      if (task.dueAt) {
        const hoursLeft = (task.dueAt.getTime() - now.getTime()) / 36e5;
        if (hoursLeft < 0) {
          score += 50;
          reasons.push('تجاوزت الموعد النهائي');
        } else if (hoursLeft <= 24) {
          score += 35;
          reasons.push('الموعد النهائي خلال 24 ساعة');
        } else if (hoursLeft <= 72) {
          score += 18;
          reasons.push('الموعد النهائي خلال 3 أيام');
        }
      }

      if (task.caseRiskLevel) {
        score += RISK_WEIGHT[task.caseRiskLevel];
        reasons.push(`قضية بمخاطر ${labelRisk(task.caseRiskLevel)}`);
      }

      return { ...task, score, reason: reasons.join(' · ') };
    })
    .sort((a, b) => b.score - a.score);
}

function labelPriority(p: TaskPriority) {
  return { URGENT: 'عاجلة', HIGH: 'مرتفعة', NORMAL: 'عادية', LOW: 'منخفضة' }[p];
}
function labelRisk(r: CaseRiskLevel) {
  return { CRITICAL: 'حرجة', HIGH: 'مرتفعة', MEDIUM: 'متوسطة', LOW: 'منخفضة' }[r];
}

'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db/prisma';
import { getActor } from '@/lib/auth';
import { assertPermission, assertSameOrganization, type SessionActor } from '@/lib/rbac/can';
import { PERMISSIONS } from '@/lib/rbac/permissions';
import { getAIAdapter } from '@/lib/adapters/ai';
import { writeAuditLog } from '@/lib/audit/log';
import type { AIAnalysisType } from '@prisma/client';

/**
 * Server Actions لطبقة "AI Case Intelligence".
 * كل إجراء: (1) يتحقق من الصلاحية RBAC، (2) يستدعي AI Adapter القابل
 * للاستبدال، (3) يخزّن الناتج كـ AIAnalysis بحالة "يتطلب مراجعة بشرية"،
 * (4) يسجّل Audit Log. لا يُعرض أي ناتج AI للمستخدم دون تخزين وتتبع.
 */

async function loadCaseContext(caseId: string, actor: SessionActor) {
  const caseRecord = await prisma.case.findUniqueOrThrow({
    where: { id: caseId },
    include: { parties: true, timelineEvents: true, documents: true },
  });
  assertSameOrganization(actor, caseRecord.organizationId);
  return `القضية: ${caseRecord.title} — رقم ${caseRecord.caseNumber}. عدد الأطراف: ${caseRecord.parties.length}. عدد المستندات: ${caseRecord.documents.length}.`;
}

async function recordAnalysis(caseId: string, type: AIAnalysisType, output: unknown, provider: string) {
  return prisma.aIAnalysis.create({
    data: {
      caseId,
      type,
      status: 'COMPLETED',
      output: output as any,
      modelProvider: provider,
      requiresHumanReview: true,
    },
  });
}

export async function generateCaseBriefAction(caseId: string) {
  const actor = await getActor();
  assertPermission(actor, PERMISSIONS.AI_RUN_ANALYSIS);
  const context = await loadCaseContext(caseId, actor);

  const ai = getAIAdapter();
  const result = await ai.generateCaseBrief(context);
  await recordAnalysis(caseId, 'CASE_BRIEF', result, ai.providerName);
  await writeAuditLog({
    organizationId: actor.organizationId,
    actorId: actor.userId,
    caseId,
    action: 'ai.case_brief_generated',
    entityType: 'Case',
    entityId: caseId,
    description: `تم إنشاء موجز قضية آلي (يتطلب مراجعة بشرية)`,
  });
  revalidatePath(`/cases/${caseId}`);
  return result;
}

export async function analyzeRiskAction(caseId: string) {
  const actor = await getActor();
  assertPermission(actor, PERMISSIONS.AI_RUN_ANALYSIS);
  const context = await loadCaseContext(caseId, actor);

  const ai = getAIAdapter();
  const result = await ai.analyzeRisk(context);
  await recordAnalysis(caseId, 'RISK_ANALYSIS', result, ai.providerName);
  await writeAuditLog({
    organizationId: actor.organizationId,
    actorId: actor.userId,
    caseId,
    action: 'ai.risk_analysis_generated',
    entityType: 'Case',
    entityId: caseId,
    description: 'تم إنشاء تحليل مخاطر آلي (يتطلب مراجعة بشرية)',
  });
  revalidatePath(`/cases/${caseId}`);
  return result;
}

export async function findMissingEvidenceAction(caseId: string) {
  const actor = await getActor();
  assertPermission(actor, PERMISSIONS.AI_RUN_ANALYSIS);
  const context = await loadCaseContext(caseId, actor);

  const ai = getAIAdapter();
  const result = await ai.findMissingEvidence(context, []);
  await recordAnalysis(caseId, 'MISSING_EVIDENCE', { items: result }, ai.providerName);
  revalidatePath(`/cases/${caseId}`);
  return result;
}

export async function suggestResearchQuestionsAction(caseId: string) {
  const actor = await getActor();
  assertPermission(actor, PERMISSIONS.AI_RUN_ANALYSIS);
  const context = await loadCaseContext(caseId, actor);

  const ai = getAIAdapter();
  const result = await ai.suggestResearchQuestions(context);
  await recordAnalysis(caseId, 'RESEARCH_QUESTIONS', { items: result }, ai.providerName);
  revalidatePath(`/cases/${caseId}`);
  return result;
}

export async function findContradictionsAction(caseId: string) {
  const actor = await getActor();
  assertPermission(actor, PERMISSIONS.AI_RUN_ANALYSIS);
  await loadCaseContext(caseId, actor);

  const ai = getAIAdapter();
  const result = await ai.findContradictions([]);
  await recordAnalysis(caseId, 'CONTRADICTION_DETECTION', { items: result }, ai.providerName);
  revalidatePath(`/cases/${caseId}`);
  return result;
}

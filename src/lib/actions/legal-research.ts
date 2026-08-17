'use server';

import { getActor } from '@/lib/auth';
import { assertPermission } from '@/lib/rbac/can';
import { PERMISSIONS } from '@/lib/rbac/permissions';
import { getAIAdapter } from '@/lib/adapters/ai';
import { prisma } from '@/lib/db/prisma';
import type { LegalResearchResult } from '@/lib/adapters/ai/types';

export async function runLegalResearch(question: string): Promise<LegalResearchResult> {
  const actor = await getActor();
  assertPermission(actor, PERMISSIONS.AI_LEGAL_RESEARCH);
  if (!question || question.trim().length < 8) {
    throw new Error('يرجى صياغة سؤال قانوني واضح (٨ أحرف على الأقل).');
  }

  const ai = getAIAdapter();
  const result = await ai.legalResearch(question.trim());

  await prisma.aIAnalysis.create({
    data: {
      type: 'LEGAL_RESEARCH',
      status: 'COMPLETED',
      input: { question },
      output: result as any,
      modelProvider: ai.providerName,
      requiresHumanReview: true,
    },
  });

  return result;
}

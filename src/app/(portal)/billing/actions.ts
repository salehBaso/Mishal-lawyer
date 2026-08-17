'use server';

import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import { getActor } from '@/lib/auth';
import { assertPermission } from '@/lib/rbac/can';
import { PERMISSIONS } from '@/lib/rbac/permissions';
import { createInvoiceSchema } from '@/lib/validation/invoice';
import { writeAuditLog } from '@/lib/audit/log';
import type { ActionResult } from '@/app/(portal)/cases/actions';

export async function createInvoiceAction(_prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  const actor = await getActor();
  assertPermission(actor, PERMISSIONS.INVOICE_CREATE);

  let lineItems: unknown;
  try {
    lineItems = JSON.parse(String(formData.get('lineItemsJson') ?? '[]'));
  } catch {
    return { success: false, message: 'تعذّر قراءة بنود الفاتورة' };
  }

  const raw = {
    clientId: formData.get('clientId'),
    caseId: formData.get('caseId') ?? '',
    lineItems,
    vatRate: formData.get('vatRate') || 0.15,
    dueDate: formData.get('dueDate') ?? '',
  };

  const parsed = createInvoiceSchema.safeParse(raw);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) errors[String(issue.path[0] ?? 'lineItems')] = issue.message;
    return { success: false, errors };
  }
  const data = parsed.data;

  const client = await prisma.client.findFirst({ where: { id: data.clientId, organizationId: actor.organizationId } });
  if (!client) return { success: false, errors: { clientId: 'العميل غير موجود' } };

  const subtotal = data.lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const vatAmount = Math.round(subtotal * data.vatRate * 100) / 100;
  const totalAmount = subtotal + vatAmount;

  const invoiceCount = await prisma.invoice.count({ where: { organizationId: actor.organizationId } });
  const invoiceNumber = `INV-${new Date().getFullYear()}-${String(1000 + invoiceCount + 1)}`;

  const invoice = await prisma.invoice.create({
    data: {
      organizationId: actor.organizationId,
      clientId: client.id,
      caseId: data.caseId || null,
      invoiceNumber,
      status: 'SENT',
      lineItems: data.lineItems,
      subtotal,
      vatAmount,
      totalAmount,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      issuedAt: new Date(),
    },
  });

  await writeAuditLog({
    organizationId: actor.organizationId,
    actorId: actor.userId,
    caseId: invoice.caseId,
    action: 'invoice.created',
    entityType: 'Invoice',
    entityId: invoice.id,
    description: `تم إنشاء فاتورة رقم ${invoice.invoiceNumber} بقيمة ${totalAmount} ${invoice.currency}`,
  });

  redirect('/billing');
}

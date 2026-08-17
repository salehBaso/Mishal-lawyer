import { z } from 'zod';

export const invoiceLineItemSchema = z.object({
  description: z.string().min(2, 'وصف البند مطلوب').max(300),
  quantity: z.coerce.number().min(1).default(1),
  unitPrice: z.coerce.number().min(0),
});

export const createInvoiceSchema = z.object({
  clientId: z.string().min(1, 'يرجى اختيار العميل'),
  caseId: z.string().optional().or(z.literal('')),
  lineItems: z.array(invoiceLineItemSchema).min(1, 'أضف بندًا واحدًا على الأقل'),
  vatRate: z.coerce.number().min(0).max(1).default(0.15),
  dueDate: z.string().optional().or(z.literal('')),
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;

export const createOrderSchema = z.object({
  providerId: z.string().min(1),
  serviceId: z.string().optional().or(z.literal('')),
  brief: z.string().min(10, 'يرجى كتابة وصف موجز لا يقل عن 10 أحرف').max(2000),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

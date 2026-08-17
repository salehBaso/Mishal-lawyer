import { z } from 'zod';

export const createClientSchema = z
  .object({
    type: z.enum(['INDIVIDUAL', 'CORPORATE']),
    fullName: z.string().min(2, 'الاسم قصير جدًا').max(200),
    companyName: z.string().max(200).optional().or(z.literal('')),
    commercialRegNo: z.string().max(50).optional().or(z.literal('')),
    nationalId: z.string().max(20).optional().or(z.literal('')),
    email: z.string().email('بريد إلكتروني غير صحيح').optional().or(z.literal('')),
    phone: z
      .string()
      .regex(/^05\d{8}$/, 'رقم جوال سعودي غير صحيح (05xxxxxxxx)')
      .optional()
      .or(z.literal('')),
    notes: z.string().max(1000).optional().or(z.literal('')),
  })
  .refine((data) => data.type !== 'CORPORATE' || !!data.companyName, {
    message: 'اسم الشركة مطلوب للعملاء من نوع "شركة"',
    path: ['companyName'],
  });

export type CreateClientInput = z.infer<typeof createClientSchema>;

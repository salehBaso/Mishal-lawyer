import { z } from 'zod';

/** التحقق من مدخلات إنشاء/تعديل قضية — يُستخدم في Server Action وفي useForm بالواجهة */
export const createCaseSchema = z.object({
  title: z.string().min(4, 'العنوان قصير جدًا').max(200),
  practiceAreaId: z.string().min(1, 'يرجى اختيار التخصص'),
  clientId: z.string().min(1, 'يرجى اختيار العميل'),
  opposingPartyName: z.string().max(200).optional().or(z.literal('')),
  courtName: z.string().max(200).optional().or(z.literal('')),
  claimAmount: z.coerce.number().min(0).optional(),
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  leadLawyerId: z.string().min(1, 'يرجى اختيار المحامي المسؤول'),
});

export type CreateCaseInput = z.infer<typeof createCaseSchema>;

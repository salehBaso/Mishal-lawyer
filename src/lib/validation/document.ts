import { z } from 'zod';

/** أنواع وأحجام الملفات المسموح برفعها — يُتحقق منها Server-Side قبل إصدار رابط الرفع */
export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
] as const;

export const MAX_UPLOAD_SIZE_BYTES = 25 * 1024 * 1024; // 25MB

export const requestUploadSchema = z.object({
  caseId: z.string().min(1).optional(),
  documentId: z.string().min(1).optional(), // إن كان الرفع تحديثًا لمستند مطلوب موجود
  title: z.string().min(2, 'عنوان المستند مطلوب').max(200),
  fileName: z.string().min(1),
  mimeType: z.enum(ALLOWED_MIME_TYPES, { errorMap: () => ({ message: 'نوع الملف غير مسموح به' }) }),
  sizeBytes: z
    .number()
    .max(MAX_UPLOAD_SIZE_BYTES, `الحجم الأقصى المسموح به ${MAX_UPLOAD_SIZE_BYTES / (1024 * 1024)}MB`),
});

export type RequestUploadInput = z.infer<typeof requestUploadSchema>;

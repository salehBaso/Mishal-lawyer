import { z } from 'zod';

export const createTaskSchema = z.object({
  caseId: z.string().min(1),
  title: z.string().min(3, 'عنوان المهمة قصير جدًا').max(200),
  description: z.string().max(2000).optional().or(z.literal('')),
  assigneeId: z.string().min(1, 'يرجى اختيار المسؤول عن المهمة'),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
  dueAt: z.string().optional().or(z.literal('')), // datetime-local string
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export const createHearingSchema = z.object({
  caseId: z.string().min(1),
  courtName: z.string().max(200).optional().or(z.literal('')),
  location: z.string().max(200).optional().or(z.literal('')),
  scheduledAt: z.string().min(1, 'يرجى تحديد تاريخ ووقت الجلسة'),
  durationMin: z.coerce.number().min(15).max(480).default(60),
  attendeeUserId: z.string().min(1, 'يرجى تحديد الحاضر'),
});

export type CreateHearingInput = z.infer<typeof createHearingSchema>;

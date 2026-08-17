import { prisma } from '@/lib/db/prisma';
import type { NotificationChannel, Prisma } from '@prisma/client';

/**
 * Smart Reminder / Notification Engine
 *
 * قنوات مدعومة: In-App (فوري وحقيقي)، Email (عبر Resend)، SMS، WhatsApp
 * (يتطلبان تكاملًا معتمدًا لاحقًا — TODO أدناه). كل تنبيه يُسجَّل أولاً في
 * جدول Notification بحالة PENDING، ثم تحاول القنوات الخارجية الإرسال
 * وتُحدَّث الحالة إلى SENT أو FAILED — بحيث لا تُفقد أي رسالة صامتة.
 */

export interface SendNotificationInput {
  organizationId: string;
  userId: string;
  channel: NotificationChannel;
  title: string;
  body: string;
  link?: string;
  meta?: Record<string, unknown>;
}

export async function sendNotification(input: SendNotificationInput) {
  const notification = await prisma.notification.create({
    data: {
      organizationId: input.organizationId,
      userId: input.userId,
      channel: input.channel,
      title: input.title,
      body: input.body,
      link: input.link,
      meta: input.meta as Prisma.InputJsonValue | undefined,
      status: 'PENDING',
    },
  });

  try {
    switch (input.channel) {
      case 'IN_APP':
        // In-App: مجرد وجود السجل في DB كافٍ؛ الواجهة تعرضه عبر polling/subscription.
        break;
      case 'EMAIL':
        await sendEmailChannel(input);
        break;
      case 'SMS':
        // TODO: ربط مزود SMS سعودي معتمد (مثل Unifonic / Taqnyat) عبر SMS_API_KEY.
        throw new Error('TODO: SMS channel غير مفعّل بعد.');
      case 'WHATSAPP':
        // TODO: ربط WhatsApp Business API الرسمي عبر WHATSAPP_BUSINESS_TOKEN.
        throw new Error('TODO: WhatsApp channel غير مفعّل بعد.');
    }

    await prisma.notification.update({
      where: { id: notification.id },
      data: { status: 'SENT', sentAt: new Date() },
    });
  } catch (err) {
    await prisma.notification.update({
      where: { id: notification.id },
      data: { status: 'FAILED' },
    });
  }

  return notification;
}

async function sendEmailChannel(input: SendNotificationInput) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('RESEND_API_KEY غير مُهيّأ — لن يتم إرسال البريد فعليًا.');
  // TODO: استدعاء Resend SDK فعليًا هنا لإرسال البريد.
}

/**
 * قواعد التصعيد (Escalation Rules) — مثال: عدم استجابة عميل لطلب مستند
 * لأكثر من 48 ساعة يُصعَّد تلقائيًا إلى منسّق القضية والمحامي المسؤول.
 * TODO: تشغيل هذه القاعدة عبر Background Job مجدول (cron) يفحص
 * Notification/CaseTask المتأخرة ويستدعي sendNotification للمصعَّد إليهم.
 */
export const ESCALATION_RULES = [
  {
    key: 'client_no_response_48h',
    description: 'لم يستجب العميل لطلب مستند خلال 48 ساعة',
    escalateToRoles: ['CASE_COORDINATOR', 'LAWYER'],
  },
  {
    key: 'invoice_overdue',
    description: 'فاتورة متأخرة عن موعد الاستحقاق',
    escalateToRoles: ['ACCOUNTANT', 'FIRM_ADMIN'],
  },
] as const;

/** إعدادات التذكير الافتراضية للجلسات — قابلة للتعديل من الإعدادات */
export const DEFAULT_HEARING_REMINDER_OFFSETS_MIN = [
  7 * 24 * 60, // 7 أيام
  3 * 24 * 60, // 3 أيام
  24 * 60, // 24 ساعة
  2 * 60, // ساعتان
];

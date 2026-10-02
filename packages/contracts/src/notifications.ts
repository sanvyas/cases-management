import { z } from 'zod';

export const NotificationChannelEnum = z.enum(['sms', 'whatsapp', 'email', 'push']);
export const NotificationStatusEnum = z.enum(['pending', 'sent', 'failed', 'delivered']);

export const NotificationJobSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  channel: NotificationChannelEnum,
  templateKey: z.string(),
  variables: z.record(z.string()),
  status: NotificationStatusEnum,
  sentAt: z.string().datetime().nullable(),
  deliveredAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
});

export const MessageTemplateSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  eventType: z.string(),
  channel: NotificationChannelEnum,
  language: z.string(),
  subject: z.string().nullable(),
  body: z.string(),
  dltTemplateId: z.string().nullable(),
  whatsappTemplateName: z.string().nullable(),
});

export type NotificationChannel = z.infer<typeof NotificationChannelEnum>;
export type NotificationStatus = z.infer<typeof NotificationStatusEnum>;
export type NotificationJob = z.infer<typeof NotificationJobSchema>;
export type MessageTemplate = z.infer<typeof MessageTemplateSchema>;

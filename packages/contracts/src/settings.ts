import { z } from 'zod';

export const SettingValueSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid().nullable(),
  nodeId: z.string().uuid().nullable(),
  key: z.string(),
  value: z.unknown(),
  updatedBy: z.string().uuid().nullable(),
  updatedAt: z.string().datetime(),
});

export const UpdateSettingSchema = z.object({
  key: z.string().min(1),
  value: z.unknown(),
});

export const AuditLogEntrySchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  actorId: z.string().uuid(),
  actorName: z.string(),
  action: z.string(),
  entityType: z.string(),
  entityId: z.string(),
  beforeValue: z.unknown().nullable(),
  afterValue: z.unknown().nullable(),
  createdAt: z.string().datetime(),
});

export type SettingValue = z.infer<typeof SettingValueSchema>;
export type UpdateSetting = z.infer<typeof UpdateSettingSchema>;
export type AuditLogEntry = z.infer<typeof AuditLogEntrySchema>;

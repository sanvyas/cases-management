import { z } from 'zod';

export const TenantStatusEnum = z.enum(['active', 'suspended', 'offboarded']);

export const CreateTenantSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  planId: z.string().uuid(),
  timezone: z.string().default('Asia/Kolkata'),
  defaultLanguage: z.string().default('en'),
  enabledLanguages: z.array(z.string()).default(['en', 'hi']),
});

export const TenantResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  status: TenantStatusEnum,
  planId: z.string().uuid(),
  planName: z.string(),
  timezone: z.string(),
  defaultLanguage: z.string(),
  enabledLanguages: z.array(z.string()),
  createdAt: z.string().datetime(),
});

export const PlanResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  modules: z.array(z.string()),
  limits: z.record(z.number()),
});

export type TenantStatus = z.infer<typeof TenantStatusEnum>;
export type CreateTenant = z.infer<typeof CreateTenantSchema>;
export type TenantResponse = z.infer<typeof TenantResponseSchema>;
export type PlanResponse = z.infer<typeof PlanResponseSchema>;

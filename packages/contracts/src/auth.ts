import { z } from 'zod';

export const LoginRequestSchema = z.object({
  phone: z.string().min(10).max(15),
  tenantSlug: z.string().min(1).optional(),
});

export const VerifyOtpRequestSchema = z.object({
  phone: z.string().min(10).max(15),
  otp: z.string().length(6),
  tenantSlug: z.string().min(1).optional(),
});

export const AuthTokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number(),
});

export const RefreshRequestSchema = z.object({
  refreshToken: z.string(),
});

export const MeResponseSchema = z.object({
  userId: z.string().uuid(),
  tenantId: z.string().uuid(),
  tenantName: z.string(),
  name: z.string(),
  phone: z.string(),
  email: z.string().nullable(),
  language: z.string(),
  roles: z.array(z.object({
    roleId: z.string().uuid(),
    roleName: z.string(),
    scopes: z.array(z.object({
      type: z.enum(['tenant', 'node_subtree', 'department', 'vendor', 'assigned_only', 'own']),
      ids: z.array(z.string()).optional(),
    })),
  })),
  permissions: z.array(z.string()),
  entitlements: z.array(z.string()),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type VerifyOtpRequest = z.infer<typeof VerifyOtpRequestSchema>;
export type AuthTokens = z.infer<typeof AuthTokensSchema>;
export type RefreshRequest = z.infer<typeof RefreshRequestSchema>;
export type MeResponse = z.infer<typeof MeResponseSchema>;

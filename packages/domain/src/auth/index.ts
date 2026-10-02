import { z } from 'zod';

export const PermissionCode = z.string().min(1);
export type PermissionCode = z.infer<typeof PermissionCode>;

export interface Actor {
  userId: string;
  tenantId: string;
  roles: string[];
  scopes: Record<string, string[]>;
  entitlements: string[];
}

export interface ResourceContext {
  tenantId: string;
  nodePath?: string;
  departmentId?: string;
  subtypeId?: string;
  assigneeId?: string;
  vendorId?: string;
  state?: string;
}

export type AuthResult =
  | { allowed: true }
  | { allowed: false; reason: string };

export function authorize(
  _actor: Actor,
  _permission: PermissionCode,
  _resource: ResourceContext,
): AuthResult {
  // TODO(phase-01): implement full evaluation order
  return { allowed: false, reason: 'not implemented' };
}

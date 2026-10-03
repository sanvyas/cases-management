export type PermissionCode = string;

export type ScopeType =
  | 'tenant'
  | 'node_subtree'
  | 'department'
  | 'vendor'
  | 'assigned_only'
  | 'own';

export interface Scope {
  type: ScopeType;
  ids?: string[];
}

export interface RoleGrant {
  roleId: string;
  permissions: PermissionCode[];
  scopes: Scope[];
}

export interface Actor {
  userId: string;
  tenantId: string;
  roles: RoleGrant[];
  isActive: boolean;
  platformUser?: boolean;
}

export interface ResourceContext {
  tenantId: string;
  nodePath?: string;
  departmentId?: string;
  assigneeId?: string;
  vendorId?: string;
}

export interface AuthResult {
  allowed: boolean;
  reason: string;
}

function checkScope(scope: Scope, actor: Actor, resource: ResourceContext): boolean {
  switch (scope.type) {
    case 'tenant':
      return true;

    case 'node_subtree':
      if (!resource.nodePath || !scope.ids || scope.ids.length === 0) {
        return false;
      }
      return scope.ids.some((prefix) => resource.nodePath!.startsWith(prefix));

    case 'department':
      if (!resource.departmentId || !scope.ids || scope.ids.length === 0) {
        return false;
      }
      return scope.ids.includes(resource.departmentId);

    case 'vendor':
      if (!resource.vendorId || !scope.ids || scope.ids.length === 0) {
        return false;
      }
      return scope.ids.includes(resource.vendorId);

    case 'assigned_only':
      if (!resource.assigneeId) {
        return false;
      }
      return resource.assigneeId === actor.userId;

    case 'own':
      if (!resource.assigneeId) {
        return false;
      }
      return resource.assigneeId === actor.userId;

    default:
      return false;
  }
}

export function authorize(
  actor: Actor,
  permission: PermissionCode,
  resource: ResourceContext,
): AuthResult {
  // 1. Actor must be active
  if (!actor.isActive) {
    return { allowed: false, reason: 'actor_inactive' };
  }

  // 2. Tenant match (platform users bypass)
  if (!actor.platformUser && actor.tenantId !== resource.tenantId) {
    return { allowed: false, reason: 'tenant_mismatch' };
  }

  // 3-4. Find permission in any grant and check scope
  for (const grant of actor.roles) {
    if (!grant.permissions.includes(permission)) {
      continue;
    }

    // Permission found in this grant; check scopes
    for (const scope of grant.scopes) {
      if (checkScope(scope, actor, resource)) {
        return { allowed: true, reason: 'granted' };
      }
    }
  }

  // 5. No matching grant found
  return { allowed: false, reason: 'permission_denied' };
}

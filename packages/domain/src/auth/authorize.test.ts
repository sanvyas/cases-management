import { describe, it, expect } from 'vitest';

import { authorize, type Actor, type ResourceContext } from './index.js';

function makeActor(overrides?: Partial<Actor>): Actor {
  return {
    userId: 'user-1',
    tenantId: 'tenant-1',
    roles: [
      {
        roleId: 'officer',
        permissions: ['case.read', 'case.update'],
        scopes: [{ type: 'tenant' }],
      },
    ],
    isActive: true,
    ...overrides,
  };
}

function makeResource(overrides?: Partial<ResourceContext>): ResourceContext {
  return {
    tenantId: 'tenant-1',
    ...overrides,
  };
}

describe('authorize', () => {
  // ---- Active check ----
  it('denies inactive actor', () => {
    const actor = makeActor({ isActive: false });
    const result = authorize(actor, 'case.read', makeResource());
    expect(result).toEqual({ allowed: false, reason: 'actor_inactive' });
  });

  // ---- Tenant match ----
  it('denies tenant mismatch', () => {
    const actor = makeActor({ tenantId: 'tenant-1' });
    const resource = makeResource({ tenantId: 'tenant-2' });
    const result = authorize(actor, 'case.read', resource);
    expect(result).toEqual({ allowed: false, reason: 'tenant_mismatch' });
  });

  it('allows platform user to access any tenant', () => {
    const actor = makeActor({ tenantId: 'tenant-1', platformUser: true });
    const resource = makeResource({ tenantId: 'tenant-999' });
    const result = authorize(actor, 'case.read', resource);
    expect(result).toEqual({ allowed: true, reason: 'granted' });
  });

  // ---- Permission not found ----
  it('denies when permission is not in any role', () => {
    const actor = makeActor();
    const result = authorize(actor, 'admin.delete_tenant', makeResource());
    expect(result).toEqual({ allowed: false, reason: 'permission_denied' });
  });

  // ---- Tenant scope ----
  it('allows with tenant scope', () => {
    const actor = makeActor();
    const result = authorize(actor, 'case.read', makeResource());
    expect(result).toEqual({ allowed: true, reason: 'granted' });
  });

  // ---- Node subtree scope ----
  it('allows node_subtree scope when path matches', () => {
    const actor = makeActor({
      roles: [
        {
          roleId: 'zone-officer',
          permissions: ['case.read'],
          scopes: [{ type: 'node_subtree', ids: ['/state/dist/zone-a'] }],
        },
      ],
    });
    const resource = makeResource({
      nodePath: '/state/dist/zone-a/ward-1',
    });
    const result = authorize(actor, 'case.read', resource);
    expect(result).toEqual({ allowed: true, reason: 'granted' });
  });

  it('denies node_subtree scope when path does not match', () => {
    const actor = makeActor({
      roles: [
        {
          roleId: 'zone-officer',
          permissions: ['case.read'],
          scopes: [{ type: 'node_subtree', ids: ['/state/dist/zone-a'] }],
        },
      ],
    });
    const resource = makeResource({
      nodePath: '/state/dist/zone-b/ward-1',
    });
    const result = authorize(actor, 'case.read', resource);
    expect(result).toEqual({ allowed: false, reason: 'permission_denied' });
  });

  it('denies node_subtree scope when resource has no nodePath', () => {
    const actor = makeActor({
      roles: [
        {
          roleId: 'zone-officer',
          permissions: ['case.read'],
          scopes: [{ type: 'node_subtree', ids: ['/state/dist/zone-a'] }],
        },
      ],
    });
    const resource = makeResource();
    const result = authorize(actor, 'case.read', resource);
    expect(result).toEqual({ allowed: false, reason: 'permission_denied' });
  });

  // ---- Department scope ----
  it('allows department scope when departmentId matches', () => {
    const actor = makeActor({
      roles: [
        {
          roleId: 'dept-head',
          permissions: ['case.read'],
          scopes: [{ type: 'department', ids: ['dept-water', 'dept-roads'] }],
        },
      ],
    });
    const resource = makeResource({ departmentId: 'dept-water' });
    const result = authorize(actor, 'case.read', resource);
    expect(result).toEqual({ allowed: true, reason: 'granted' });
  });

  it('denies department scope when departmentId does not match', () => {
    const actor = makeActor({
      roles: [
        {
          roleId: 'dept-head',
          permissions: ['case.read'],
          scopes: [{ type: 'department', ids: ['dept-water'] }],
        },
      ],
    });
    const resource = makeResource({ departmentId: 'dept-electricity' });
    const result = authorize(actor, 'case.read', resource);
    expect(result).toEqual({ allowed: false, reason: 'permission_denied' });
  });

  // ---- Assigned-only scope ----
  it('allows assigned_only scope when assigneeId matches actor', () => {
    const actor = makeActor({
      roles: [
        {
          roleId: 'field-officer',
          permissions: ['case.update'],
          scopes: [{ type: 'assigned_only' }],
        },
      ],
    });
    const resource = makeResource({ assigneeId: 'user-1' });
    const result = authorize(actor, 'case.update', resource);
    expect(result).toEqual({ allowed: true, reason: 'granted' });
  });

  it('denies assigned_only scope when assigneeId does not match actor', () => {
    const actor = makeActor({
      roles: [
        {
          roleId: 'field-officer',
          permissions: ['case.update'],
          scopes: [{ type: 'assigned_only' }],
        },
      ],
    });
    const resource = makeResource({ assigneeId: 'user-other' });
    const result = authorize(actor, 'case.update', resource);
    expect(result).toEqual({ allowed: false, reason: 'permission_denied' });
  });

  it('denies assigned_only scope when resource has no assigneeId', () => {
    const actor = makeActor({
      roles: [
        {
          roleId: 'field-officer',
          permissions: ['case.update'],
          scopes: [{ type: 'assigned_only' }],
        },
      ],
    });
    const resource = makeResource();
    const result = authorize(actor, 'case.update', resource);
    expect(result).toEqual({ allowed: false, reason: 'permission_denied' });
  });

  // ---- Own scope ----
  it('allows own scope when assigneeId matches actor', () => {
    const actor = makeActor({
      roles: [
        {
          roleId: 'citizen',
          permissions: ['case.read'],
          scopes: [{ type: 'own' }],
        },
      ],
    });
    const resource = makeResource({ assigneeId: 'user-1' });
    const result = authorize(actor, 'case.read', resource);
    expect(result).toEqual({ allowed: true, reason: 'granted' });
  });

  // ---- Vendor scope ----
  it('allows vendor scope when vendorId matches', () => {
    const actor = makeActor({
      roles: [
        {
          roleId: 'vendor-staff',
          permissions: ['case.read'],
          scopes: [{ type: 'vendor', ids: ['vendor-1'] }],
        },
      ],
    });
    const resource = makeResource({ vendorId: 'vendor-1' });
    const result = authorize(actor, 'case.read', resource);
    expect(result).toEqual({ allowed: true, reason: 'granted' });
  });

  it('denies vendor scope when vendorId does not match', () => {
    const actor = makeActor({
      roles: [
        {
          roleId: 'vendor-staff',
          permissions: ['case.read'],
          scopes: [{ type: 'vendor', ids: ['vendor-1'] }],
        },
      ],
    });
    const resource = makeResource({ vendorId: 'vendor-other' });
    const result = authorize(actor, 'case.read', resource);
    expect(result).toEqual({ allowed: false, reason: 'permission_denied' });
  });

  // ---- Multiple roles ----
  it('grants if any role has the permission with a matching scope', () => {
    const actor = makeActor({
      roles: [
        {
          roleId: 'restricted',
          permissions: ['case.read'],
          scopes: [{ type: 'department', ids: ['dept-water'] }],
        },
        {
          roleId: 'admin',
          permissions: ['case.read', 'case.update'],
          scopes: [{ type: 'tenant' }],
        },
      ],
    });
    const resource = makeResource({ departmentId: 'dept-electricity' });
    const result = authorize(actor, 'case.read', resource);
    expect(result).toEqual({ allowed: true, reason: 'granted' });
  });

  // ---- Empty roles ----
  it('denies actor with no roles', () => {
    const actor = makeActor({ roles: [] });
    const result = authorize(actor, 'case.read', makeResource());
    expect(result).toEqual({ allowed: false, reason: 'permission_denied' });
  });
});

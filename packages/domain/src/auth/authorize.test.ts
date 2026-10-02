import { describe, it, expect } from 'vitest';

import { authorize, type Actor, type ResourceContext } from './index.js';

describe('authorize', () => {
  const actor: Actor = {
    userId: 'user-1',
    tenantId: 'tenant-1',
    roles: ['officer'],
    scopes: {},
    entitlements: ['core'],
  };

  const resource: ResourceContext = {
    tenantId: 'tenant-1',
  };

  it('returns a result with allowed property', () => {
    const result = authorize(actor, 'case.read', resource);
    expect(result).toHaveProperty('allowed');
  });

  it('currently denies all requests (placeholder)', () => {
    const result = authorize(actor, 'case.read', resource);
    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(result.reason).toBe('not implemented');
    }
  });
});

import { describe, it, expect } from 'vitest';

import { routeCase, type ChargeRecord, type RoutingInput } from './routing.js';

function makeCharge(overrides?: Partial<ChargeRecord>): ChargeRecord {
  return {
    personId: 'person-1',
    designationId: 'desg-je',
    departmentId: 'dept-water',
    nodeId: 'node-ward-1',
    nodePath: '/city/zone-a/ward-1',
    isAvailable: true,
    openCaseCount: 0,
    ...overrides,
  };
}

function makeInput(overrides?: Partial<RoutingInput>): RoutingInput {
  return {
    subtypeAssignmentMode: 'internal_auto',
    nodeId: 'node-ward-1',
    nodePath: '/city/zone-a/ward-1',
    departmentId: 'dept-water',
    charges: [],
    ...overrides,
  };
}

describe('routeCase', () => {
  describe('internal_auto mode', () => {
    it('auto-assigns to the least loaded available officer', () => {
      const charges = [
        makeCharge({ personId: 'p1', openCaseCount: 5 }),
        makeCharge({ personId: 'p2', openCaseCount: 2 }),
        makeCharge({ personId: 'p3', openCaseCount: 8 }),
      ];
      const result = routeCase(makeInput({ charges }));
      expect(result.assigneePersonId).toBe('p2');
      expect(result.routingFailed).toBe(false);
      expect(result.reason).toBe('auto_assigned');
    });

    it('skips unavailable officers', () => {
      const charges = [
        makeCharge({ personId: 'p1', openCaseCount: 1, isAvailable: false }),
        makeCharge({ personId: 'p2', openCaseCount: 5, isAvailable: true }),
      ];
      const result = routeCase(makeInput({ charges }));
      expect(result.assigneePersonId).toBe('p2');
      expect(result.routingFailed).toBe(false);
    });

    it('returns routing failed when no officers available', () => {
      const charges = [
        makeCharge({ personId: 'p1', isAvailable: false }),
        makeCharge({ personId: 'p2', isAvailable: false }),
      ];
      const result = routeCase(makeInput({ charges }));
      expect(result.assigneePersonId).toBeNull();
      expect(result.routingFailed).toBe(true);
      expect(result.reason).toBe('no_available_assignee');
    });

    it('returns routing failed when charges list is empty', () => {
      const result = routeCase(makeInput({ charges: [] }));
      expect(result.assigneePersonId).toBeNull();
      expect(result.routingFailed).toBe(true);
    });

    it('filters by nodeId and departmentId', () => {
      const charges = [
        makeCharge({ personId: 'p1', nodeId: 'other-node', openCaseCount: 0 }),
        makeCharge({ personId: 'p2', nodeId: 'node-ward-1', departmentId: 'dept-roads', openCaseCount: 0 }),
        makeCharge({ personId: 'p3', nodeId: 'node-ward-1', departmentId: 'dept-water', openCaseCount: 3 }),
      ];
      const result = routeCase(makeInput({ charges }));
      expect(result.assigneePersonId).toBe('p3');
    });

    it('filters by designationId when provided', () => {
      const charges = [
        makeCharge({ personId: 'p1', designationId: 'desg-ae', openCaseCount: 0 }),
        makeCharge({ personId: 'p2', designationId: 'desg-je', openCaseCount: 2 }),
      ];
      const result = routeCase(makeInput({
        charges,
        designationId: 'desg-je',
      }));
      expect(result.assigneePersonId).toBe('p2');
    });

    it('breaks ties by order in list (first wins)', () => {
      const charges = [
        makeCharge({ personId: 'p1', openCaseCount: 3 }),
        makeCharge({ personId: 'p2', openCaseCount: 3 }),
        makeCharge({ personId: 'p3', openCaseCount: 3 }),
      ];
      const result = routeCase(makeInput({ charges }));
      expect(result.assigneePersonId).toBe('p1');
    });
  });

  describe('vendor_auto mode', () => {
    it('auto-assigns vendor the same way as internal', () => {
      const charges = [
        makeCharge({ personId: 'v1', openCaseCount: 10 }),
        makeCharge({ personId: 'v2', openCaseCount: 1 }),
      ];
      const result = routeCase(makeInput({
        subtypeAssignmentMode: 'vendor_auto',
        charges,
      }));
      expect(result.assigneePersonId).toBe('v2');
      expect(result.routingFailed).toBe(false);
    });
  });

  describe('manual modes', () => {
    it('internal_manual returns null assignee', () => {
      const result = routeCase(makeInput({ subtypeAssignmentMode: 'internal_manual' }));
      expect(result.assigneePersonId).toBeNull();
      expect(result.routingFailed).toBe(false);
      expect(result.reason).toBe('queued_for_manual_assignment');
    });

    it('vendor_manual returns null assignee', () => {
      const result = routeCase(makeInput({ subtypeAssignmentMode: 'vendor_manual' }));
      expect(result.assigneePersonId).toBeNull();
      expect(result.routingFailed).toBe(false);
    });

    it('pool_manual returns null assignee', () => {
      const result = routeCase(makeInput({ subtypeAssignmentMode: 'pool_manual' }));
      expect(result.assigneePersonId).toBeNull();
      expect(result.routingFailed).toBe(false);
    });
  });

  describe('unknown mode', () => {
    it('returns routing failed for unknown assignment mode', () => {
      const result = routeCase(makeInput({ subtypeAssignmentMode: 'xyz_unknown' }));
      expect(result.assigneePersonId).toBeNull();
      expect(result.routingFailed).toBe(true);
      expect(result.reason).toContain('unknown_assignment_mode');
    });
  });
});

import { describe, it, expect } from 'vitest';

import {
  canTransition,
  getAllowedActions,
  getNextStatus,
  type CaseStatus,
  type CaseAction,
} from './stateMachine.js';

describe('canTransition', () => {
  it('returns target status for valid transition', () => {
    expect(canTransition('REGISTERED', 'assign')).toBe('ASSIGNED');
  });

  it('returns null for invalid transition', () => {
    expect(canTransition('REGISTERED', 'close')).toBeNull();
  });

  it('handles multi-source transitions', () => {
    expect(canTransition('ACCEPTED', 'submit_atr')).toBe('ATR_SUBMITTED');
    expect(canTransition('IN_PROGRESS', 'submit_atr')).toBe('ATR_SUBMITTED');
  });
});

describe('getNextStatus', () => {
  it('REGISTERED -> assign -> ASSIGNED', () => {
    expect(getNextStatus('REGISTERED', 'assign')).toBe('ASSIGNED');
  });

  it('ASSIGNED -> accept -> ACCEPTED', () => {
    expect(getNextStatus('ASSIGNED', 'accept')).toBe('ACCEPTED');
  });

  it('throws on invalid transition', () => {
    expect(() => getNextStatus('CLOSED', 'assign')).toThrow('Invalid transition: CLOSED -> assign');
  });

  it('throws on completely invalid combo', () => {
    expect(() => getNextStatus('MERGED', 'accept')).toThrow('Invalid transition');
  });
});

describe('full lifecycle', () => {
  it('REGISTERED through CLOSED (happy path)', () => {
    let status: CaseStatus = 'REGISTERED';
    const steps: CaseAction[] = [
      'assign',
      'accept',
      'start_work',
      'submit_atr',
      'approve_atr',
      'close',
    ];

    for (const action of steps) {
      status = getNextStatus(status, action);
    }

    expect(status).toBe('CLOSED');
  });

  it('REGISTERED through ATR review and return loop', () => {
    let status: CaseStatus = 'REGISTERED';

    status = getNextStatus(status, 'assign');     // ASSIGNED
    status = getNextStatus(status, 'accept');      // ACCEPTED
    status = getNextStatus(status, 'start_work');  // IN_PROGRESS
    status = getNextStatus(status, 'submit_atr');  // ATR_SUBMITTED
    status = getNextStatus(status, 'review_atr');  // ATR_REVIEW
    status = getNextStatus(status, 'return_atr');  // IN_PROGRESS
    expect(status).toBe('IN_PROGRESS');

    status = getNextStatus(status, 'submit_atr');  // ATR_SUBMITTED
    status = getNextStatus(status, 'approve_atr'); // RESOLVED
    expect(status).toBe('RESOLVED');
  });
});

describe('reopen flow', () => {
  it('reopens from RESOLVED and re-assigns', () => {
    let status: CaseStatus = 'RESOLVED';
    status = getNextStatus(status, 'reopen');
    expect(status).toBe('REOPENED');
    status = getNextStatus(status, 'assign');
    expect(status).toBe('ASSIGNED');
  });

  it('reopens from CLOSED', () => {
    const status = getNextStatus('CLOSED', 'reopen');
    expect(status).toBe('REOPENED');
  });

  it('feedback_negative reopens from RESOLVED', () => {
    const status = getNextStatus('RESOLVED', 'feedback_negative');
    expect(status).toBe('REOPENED');
  });

  it('feedback_positive closes from RESOLVED', () => {
    const status = getNextStatus('RESOLVED', 'feedback_positive');
    expect(status).toBe('CLOSED');
  });
});

describe('EOT flow', () => {
  it('request and approve EOT from ACCEPTED', () => {
    let status: CaseStatus = 'ACCEPTED';
    status = getNextStatus(status, 'request_eot');
    expect(status).toBe('EOT_PENDING');
    status = getNextStatus(status, 'approve_eot');
    expect(status).toBe('IN_PROGRESS');
  });

  it('request and reject EOT from IN_PROGRESS', () => {
    let status: CaseStatus = 'IN_PROGRESS';
    status = getNextStatus(status, 'request_eot');
    expect(status).toBe('EOT_PENDING');
    status = getNextStatus(status, 'reject_eot');
    expect(status).toBe('IN_PROGRESS');
  });
});

describe('transfer flow', () => {
  it('request and approve transfer', () => {
    let status: CaseStatus = 'IN_PROGRESS';
    status = getNextStatus(status, 'request_transfer');
    expect(status).toBe('TRANSFER_PENDING');
    status = getNextStatus(status, 'approve_transfer');
    expect(status).toBe('REGISTERED');
  });

  it('request and reject transfer', () => {
    let status: CaseStatus = 'ASSIGNED';
    status = getNextStatus(status, 'request_transfer');
    expect(status).toBe('TRANSFER_PENDING');
    status = getNextStatus(status, 'reject_transfer');
    expect(status).toBe('IN_PROGRESS');
  });
});

describe('hold flow', () => {
  it('request hold and release', () => {
    let status: CaseStatus = 'IN_PROGRESS';
    status = getNextStatus(status, 'request_hold');
    expect(status).toBe('ON_HOLD');
    status = getNextStatus(status, 'release_hold');
    expect(status).toBe('IN_PROGRESS');
  });
});

describe('reject flow', () => {
  it('rejects from REGISTERED', () => {
    expect(getNextStatus('REGISTERED', 'reject_case')).toBe('REJECTED');
  });

  it('rejects from IN_PROGRESS', () => {
    expect(getNextStatus('IN_PROGRESS', 'reject_case')).toBe('REJECTED');
  });
});

describe('merge flow', () => {
  it('merges from REGISTERED', () => {
    expect(getNextStatus('REGISTERED', 'merge')).toBe('MERGED');
  });

  it('merges from ASSIGNED', () => {
    expect(getNextStatus('ASSIGNED', 'merge')).toBe('MERGED');
  });

  it('cannot merge from IN_PROGRESS', () => {
    expect(canTransition('IN_PROGRESS', 'merge')).toBeNull();
  });
});

describe('classify flow', () => {
  it('classifies from NEEDS_CLASSIFICATION', () => {
    expect(getNextStatus('NEEDS_CLASSIFICATION', 'classify')).toBe('ASSIGNED');
  });

  it('classifies from REGISTERED', () => {
    expect(getNextStatus('REGISTERED', 'classify')).toBe('ASSIGNED');
  });
});

describe('getAllowedActions', () => {
  it('returns correct actions for REGISTERED', () => {
    const actions = getAllowedActions('REGISTERED');
    expect(actions).toContain('assign');
    expect(actions).toContain('classify');
    expect(actions).toContain('reject_case');
    expect(actions).toContain('merge');
    expect(actions).not.toContain('accept');
    expect(actions).not.toContain('close');
  });

  it('returns correct actions for ASSIGNED', () => {
    const actions = getAllowedActions('ASSIGNED');
    expect(actions).toContain('accept');
    expect(actions).toContain('request_transfer');
    expect(actions).toContain('reject_case');
    expect(actions).toContain('merge');
  });

  it('returns correct actions for RESOLVED', () => {
    const actions = getAllowedActions('RESOLVED');
    expect(actions).toContain('close');
    expect(actions).toContain('reopen');
    expect(actions).toContain('feedback_positive');
    expect(actions).toContain('feedback_negative');
  });

  it('returns empty array for terminal state MERGED', () => {
    const actions = getAllowedActions('MERGED');
    expect(actions).toHaveLength(0);
  });

  it('returns empty array for terminal state REJECTED', () => {
    const actions = getAllowedActions('REJECTED');
    expect(actions).toHaveLength(0);
  });

  it('returns correct actions for EOT_PENDING', () => {
    const actions = getAllowedActions('EOT_PENDING');
    expect(actions).toContain('approve_eot');
    expect(actions).toContain('reject_eot');
    expect(actions).toHaveLength(2);
  });

  it('returns correct actions for ON_HOLD', () => {
    const actions = getAllowedActions('ON_HOLD');
    expect(actions).toContain('release_hold');
    expect(actions).toHaveLength(1);
  });
});

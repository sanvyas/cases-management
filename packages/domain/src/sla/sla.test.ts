import { describe, it, expect } from 'vitest';

import {
  calculateDueDate,
  calculateElapsedHours,
  isBreached,
  getSlaStatus,
  type SlaConfig,
} from './index.js';

describe('SLA Calculator', () => {
  describe('24/7 SLA (no working hours)', () => {
    const config: SlaConfig = {
      slaHours: 24,
      timezone: 'UTC',
    };

    it('adds slaHours directly', () => {
      const registered = new Date('2024-01-15T10:00:00Z');
      const due = calculateDueDate(registered, config);
      expect(due).toEqual(new Date('2024-01-16T10:00:00Z'));
    });

    it('calculates elapsed hours correctly', () => {
      const registered = new Date('2024-01-15T10:00:00Z');
      const now = new Date('2024-01-15T22:00:00Z');
      const elapsed = calculateElapsedHours(registered, now, config);
      expect(elapsed).toBe(12);
    });

    it('returns 0 elapsed when now equals registered', () => {
      const registered = new Date('2024-01-15T10:00:00Z');
      const elapsed = calculateElapsedHours(registered, registered, config);
      expect(elapsed).toBe(0);
    });

    it('returns 0 elapsed when now is before registered', () => {
      const registered = new Date('2024-01-15T10:00:00Z');
      const now = new Date('2024-01-15T08:00:00Z');
      const elapsed = calculateElapsedHours(registered, now, config);
      expect(elapsed).toBe(0);
    });
  });

  describe('working hours SLA (9-17)', () => {
    const config: SlaConfig = {
      slaHours: 8,
      workingHours: { start: 9, end: 17 },
      timezone: 'UTC',
    };

    it('due date is same day if registered at start of day', () => {
      const registered = new Date('2024-01-15T09:00:00Z');
      const due = calculateDueDate(registered, config);
      expect(due).toEqual(new Date('2024-01-15T17:00:00Z'));
    });

    it('skips nights', () => {
      const registered = new Date('2024-01-15T14:00:00Z'); // 3h remaining today
      const due = calculateDueDate(registered, config);
      // 3h today (14:00-17:00), need 5 more, starts 09:00 next day -> 14:00 next day
      expect(due).toEqual(new Date('2024-01-16T14:00:00Z'));
    });

    it('handles registration before working hours', () => {
      const registered = new Date('2024-01-15T06:00:00Z');
      const due = calculateDueDate(registered, config);
      // Moves to 09:00, 8h of work -> 17:00 same day
      expect(due).toEqual(new Date('2024-01-15T17:00:00Z'));
    });

    it('handles registration after working hours', () => {
      const registered = new Date('2024-01-15T18:00:00Z');
      const due = calculateDueDate(registered, config);
      // Moves to 09:00 next day, 8h -> 17:00 next day
      expect(due).toEqual(new Date('2024-01-16T17:00:00Z'));
    });

    it('calculates elapsed hours skipping nights', () => {
      const registered = new Date('2024-01-15T14:00:00Z');
      const now = new Date('2024-01-16T11:00:00Z');
      // 3h on day 1 (14:00-17:00), 2h on day 2 (09:00-11:00) = 5h
      const elapsed = calculateElapsedHours(registered, now, config);
      expect(elapsed).toBe(5);
    });

    it('handles multi-day elapsed calculation', () => {
      const registered = new Date('2024-01-15T09:00:00Z');
      const now = new Date('2024-01-17T12:00:00Z');
      // Day 1: 8h (09:00-17:00), Day 2: 8h (09:00-17:00), Day 3: 3h (09:00-12:00) = 19h
      const elapsed = calculateElapsedHours(registered, now, config);
      expect(elapsed).toBe(19);
    });

    it('registered at end of working day spans to next day', () => {
      const registered = new Date('2024-01-15T17:00:00Z');
      const due = calculateDueDate(registered, config);
      // At end of working day, moves to 09:00 next day, 8h -> 17:00
      expect(due).toEqual(new Date('2024-01-16T17:00:00Z'));
    });
  });

  describe('holidays', () => {
    const config: SlaConfig = {
      slaHours: 8,
      workingHours: { start: 9, end: 17 },
      holidays: ['2024-01-16'],
      timezone: 'UTC',
    };

    it('skips holidays when calculating due date', () => {
      const registered = new Date('2024-01-15T14:00:00Z'); // 3h left today
      const due = calculateDueDate(registered, config);
      // 3h on Jan 15 (14:00-17:00), Jan 16 is holiday, need 5 more from Jan 17 09:00 -> 14:00
      expect(due).toEqual(new Date('2024-01-17T14:00:00Z'));
    });

    it('skips holidays when calculating elapsed hours', () => {
      const registered = new Date('2024-01-15T14:00:00Z');
      const now = new Date('2024-01-17T11:00:00Z');
      // Day 15: 3h (14:00-17:00), Day 16: holiday, Day 17: 2h (09:00-11:00) = 5h
      const elapsed = calculateElapsedHours(registered, now, config);
      expect(elapsed).toBe(5);
    });

    it('handles registration on a holiday', () => {
      const registered = new Date('2024-01-16T10:00:00Z'); // holiday
      const due = calculateDueDate(registered, config);
      // Skip to Jan 17 09:00, 8h -> 17:00
      expect(due).toEqual(new Date('2024-01-17T17:00:00Z'));
    });
  });

  describe('isBreached', () => {
    const config: SlaConfig = {
      slaHours: 24,
      timezone: 'UTC',
    };

    it('returns false when within SLA', () => {
      const registered = new Date('2024-01-15T10:00:00Z');
      const now = new Date('2024-01-15T20:00:00Z'); // 10h elapsed, 24h SLA
      expect(isBreached(registered, now, config)).toBe(false);
    });

    it('returns true when SLA exceeded', () => {
      const registered = new Date('2024-01-15T10:00:00Z');
      const now = new Date('2024-01-17T10:00:00Z'); // 48h elapsed, 24h SLA
      expect(isBreached(registered, now, config)).toBe(true);
    });

    it('returns false at exact SLA boundary', () => {
      const registered = new Date('2024-01-15T10:00:00Z');
      const now = new Date('2024-01-16T10:00:00Z'); // exactly 24h
      expect(isBreached(registered, now, config)).toBe(false);
    });
  });

  describe('getSlaStatus', () => {
    const config: SlaConfig = {
      slaHours: 24,
      timezone: 'UTC',
    };

    it('returns green when < 75% elapsed', () => {
      const registered = new Date('2024-01-15T10:00:00Z');
      const now = new Date('2024-01-15T20:00:00Z'); // 10h / 24h = 41.7%
      expect(getSlaStatus(registered, now, config)).toBe('green');
    });

    it('returns amber when 75-100% elapsed', () => {
      const registered = new Date('2024-01-15T10:00:00Z');
      const now = new Date('2024-01-16T06:00:00Z'); // 20h / 24h = 83.3%
      expect(getSlaStatus(registered, now, config)).toBe('amber');
    });

    it('returns red when > 100% elapsed', () => {
      const registered = new Date('2024-01-15T10:00:00Z');
      const now = new Date('2024-01-17T10:00:00Z'); // 48h / 24h = 200%
      expect(getSlaStatus(registered, now, config)).toBe('red');
    });

    it('returns amber at exactly 75%', () => {
      const registered = new Date('2024-01-15T00:00:00Z');
      const now = new Date('2024-01-15T18:00:00Z'); // 18h / 24h = 75%
      expect(getSlaStatus(registered, now, config)).toBe('amber');
    });

    it('returns green just under 75%', () => {
      const registered = new Date('2024-01-15T00:00:00Z');
      const now = new Date('2024-01-15T17:59:00Z'); // ~17.98h / 24h = 74.9%
      expect(getSlaStatus(registered, now, config)).toBe('green');
    });

    it('returns red just over 100%', () => {
      const registered = new Date('2024-01-15T00:00:00Z');
      const now = new Date('2024-01-16T00:01:00Z'); // 24h + 1min
      expect(getSlaStatus(registered, now, config)).toBe('red');
    });

    it('works with working hours config', () => {
      const whConfig: SlaConfig = {
        slaHours: 8,
        workingHours: { start: 9, end: 17 },
        timezone: 'UTC',
      };
      // Registered at 09:00, now at 15:00 = 6h elapsed = 75% of 8h -> amber
      const registered = new Date('2024-01-15T09:00:00Z');
      const now = new Date('2024-01-15T15:00:00Z');
      expect(getSlaStatus(registered, now, whConfig)).toBe('amber');
    });
  });
});

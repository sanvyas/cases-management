export interface WorkingHours {
  start: number; // hours 0-24
  end: number;   // hours 0-24
}

export interface SlaConfig {
  slaHours: number;
  workingHours?: WorkingHours; // if undefined, 24/7
  holidays?: string[];         // ISO date strings e.g. "2024-01-26"
  timezone: string;
}

const MS_PER_HOUR = 3_600_000;
const MS_PER_DAY = 86_400_000;

/**
 * Get the ISO date string (YYYY-MM-DD) for a given timestamp in UTC.
 */
function toDateString(ts: number): string {
  const d = new Date(ts);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get the start of the UTC day for a given timestamp.
 */
function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setUTCHours(0, 0, 0, 0);
  return d.getTime();
}

/**
 * Check if a date (as ISO string) is a holiday.
 */
function isHoliday(dateStr: string, holidays: string[]): boolean {
  return holidays.includes(dateStr);
}

/**
 * Calculate the due date given a registration time and SLA config.
 * For 24/7 SLAs, simply adds slaHours. For working-hours SLAs,
 * accumulates only working hours, skipping nights and holidays.
 */
export function calculateDueDate(registeredAt: Date, config: SlaConfig): Date {
  const { slaHours, workingHours, holidays = [] } = config;

  if (!workingHours) {
    // 24/7 mode: just add hours
    return new Date(registeredAt.getTime() + slaHours * MS_PER_HOUR);
  }

  const { start, end } = workingHours;
  const workingHoursPerDay = end - start;

  let remainingMs = slaHours * MS_PER_HOUR;
  let current = registeredAt.getTime();

  while (remainingMs > 0) {
    const dayStart = startOfDay(current);
    const dateStr = toDateString(current);

    // Skip holidays
    if (isHoliday(dateStr, holidays)) {
      current = dayStart + MS_PER_DAY + start * MS_PER_HOUR;
      continue;
    }

    const workStart = dayStart + start * MS_PER_HOUR;
    const workEnd = dayStart + end * MS_PER_HOUR;

    // If before working hours, move to start
    if (current < workStart) {
      current = workStart;
    }

    // If after working hours, move to next day
    if (current >= workEnd) {
      current = dayStart + MS_PER_DAY + start * MS_PER_HOUR;
      continue;
    }

    // We are within working hours. Calculate remaining work time today.
    const availableToday = workEnd - current;

    if (remainingMs <= availableToday) {
      current += remainingMs;
      remainingMs = 0;
    } else {
      remainingMs -= availableToday;
      // Move to next day's working start
      current = dayStart + MS_PER_DAY + start * MS_PER_HOUR;
    }

    // Guard: if somehow a working day has 0 hours, break to avoid infinite loop
    if (workingHoursPerDay <= 0) {
      break;
    }
  }

  return new Date(current);
}

/**
 * Calculate the elapsed working hours between registeredAt and now.
 * For 24/7, returns the simple difference. For working-hours SLAs,
 * counts only hours within working windows, skipping holidays.
 */
export function calculateElapsedHours(registeredAt: Date, now: Date, config: SlaConfig): number {
  const { workingHours, holidays = [] } = config;

  if (!workingHours) {
    const diff = now.getTime() - registeredAt.getTime();
    return Math.max(0, diff / MS_PER_HOUR);
  }

  const { start, end } = workingHours;
  const workingHoursPerDay = end - start;

  if (workingHoursPerDay <= 0) {
    return 0;
  }

  let elapsed = 0;
  let current = registeredAt.getTime();
  const endTime = now.getTime();

  while (current < endTime) {
    const dayStart = startOfDay(current);
    const dateStr = toDateString(current);

    // Skip holidays
    if (isHoliday(dateStr, holidays)) {
      current = dayStart + MS_PER_DAY;
      continue;
    }

    const workStart = dayStart + start * MS_PER_HOUR;
    const workEnd = dayStart + end * MS_PER_HOUR;

    // If before working hours, advance
    if (current < workStart) {
      current = workStart;
      if (current >= endTime) break;
    }

    // If past working hours, advance to next day
    if (current >= workEnd) {
      current = dayStart + MS_PER_DAY;
      continue;
    }

    // Calculate overlap between [current, endTime] and [current, workEnd]
    const segmentEnd = Math.min(endTime, workEnd);
    elapsed += (segmentEnd - current) / MS_PER_HOUR;
    current = segmentEnd;

    // If we reached end of working hours, move to next day
    if (current >= workEnd) {
      current = dayStart + MS_PER_DAY;
    }
  }

  return elapsed;
}

/**
 * Check if the SLA has been breached.
 */
export function isBreached(registeredAt: Date, now: Date, config: SlaConfig): boolean {
  const elapsed = calculateElapsedHours(registeredAt, now, config);
  return elapsed > config.slaHours;
}

/**
 * Get the SLA status:
 * - green: < 75% elapsed
 * - amber: 75-100% elapsed
 * - red: > 100% elapsed
 */
export function getSlaStatus(
  registeredAt: Date,
  now: Date,
  config: SlaConfig,
): 'green' | 'amber' | 'red' {
  const elapsed = calculateElapsedHours(registeredAt, now, config);
  const ratio = elapsed / config.slaHours;

  if (ratio > 1) return 'red';
  if (ratio >= 0.75) return 'amber';
  return 'green';
}

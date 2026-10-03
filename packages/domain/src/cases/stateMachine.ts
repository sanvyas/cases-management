export type CaseStatus =
  | 'REGISTERED'
  | 'ASSIGNED'
  | 'ACCEPTED'
  | 'IN_PROGRESS'
  | 'ATR_SUBMITTED'
  | 'ATR_REVIEW'
  | 'RESOLVED'
  | 'CLOSED'
  | 'ON_HOLD'
  | 'EOT_PENDING'
  | 'TRANSFER_PENDING'
  | 'REOPENED'
  | 'REJECTED'
  | 'NEEDS_CLASSIFICATION'
  | 'MERGED';

export type CaseAction =
  | 'assign'
  | 'accept'
  | 'start_work'
  | 'submit_atr'
  | 'review_atr'
  | 'approve_atr'
  | 'return_atr'
  | 'resolve'
  | 'close'
  | 'request_eot'
  | 'approve_eot'
  | 'reject_eot'
  | 'request_transfer'
  | 'approve_transfer'
  | 'reject_transfer'
  | 'request_hold'
  | 'approve_hold'
  | 'release_hold'
  | 'reject_case'
  | 'approve_reject'
  | 'reopen'
  | 'merge'
  | 'classify'
  | 'feedback_positive'
  | 'feedback_negative';

interface Transition {
  from: CaseStatus | CaseStatus[];
  action: CaseAction;
  to: CaseStatus;
}

export const transitions: Transition[] = [
  // Core flow
  { from: 'REGISTERED', action: 'assign', to: 'ASSIGNED' },
  { from: 'REGISTERED', action: 'classify', to: 'ASSIGNED' },
  { from: 'NEEDS_CLASSIFICATION', action: 'classify', to: 'ASSIGNED' },
  { from: 'ASSIGNED', action: 'accept', to: 'ACCEPTED' },
  { from: 'ACCEPTED', action: 'start_work', to: 'IN_PROGRESS' },
  { from: ['ACCEPTED', 'IN_PROGRESS'], action: 'submit_atr', to: 'ATR_SUBMITTED' },
  { from: 'ATR_SUBMITTED', action: 'review_atr', to: 'ATR_REVIEW' },
  { from: ['ATR_SUBMITTED', 'ATR_REVIEW'], action: 'approve_atr', to: 'RESOLVED' },
  { from: ['ATR_SUBMITTED', 'ATR_REVIEW'], action: 'return_atr', to: 'IN_PROGRESS' },
  { from: 'RESOLVED', action: 'close', to: 'CLOSED' },
  // EOT
  { from: ['ACCEPTED', 'IN_PROGRESS'], action: 'request_eot', to: 'EOT_PENDING' },
  { from: 'EOT_PENDING', action: 'approve_eot', to: 'IN_PROGRESS' },
  { from: 'EOT_PENDING', action: 'reject_eot', to: 'IN_PROGRESS' },
  // Transfer
  { from: ['ASSIGNED', 'ACCEPTED', 'IN_PROGRESS'], action: 'request_transfer', to: 'TRANSFER_PENDING' },
  { from: 'TRANSFER_PENDING', action: 'approve_transfer', to: 'REGISTERED' },
  { from: 'TRANSFER_PENDING', action: 'reject_transfer', to: 'IN_PROGRESS' },
  // Hold
  { from: ['ACCEPTED', 'IN_PROGRESS'], action: 'request_hold', to: 'ON_HOLD' },
  { from: 'ON_HOLD', action: 'release_hold', to: 'IN_PROGRESS' },
  // Reject
  { from: ['REGISTERED', 'ASSIGNED', 'ACCEPTED', 'IN_PROGRESS'], action: 'reject_case', to: 'REJECTED' },
  // Reopen
  { from: ['RESOLVED', 'CLOSED'], action: 'reopen', to: 'REOPENED' },
  { from: 'REOPENED', action: 'assign', to: 'ASSIGNED' },
  // Feedback
  { from: 'RESOLVED', action: 'feedback_positive', to: 'CLOSED' },
  { from: 'RESOLVED', action: 'feedback_negative', to: 'REOPENED' },
  // Merge
  { from: ['REGISTERED', 'ASSIGNED'], action: 'merge', to: 'MERGED' },
];

/**
 * Build a flat lookup from the transitions table.
 * Key: "STATUS:action" -> target status
 */
function buildLookup(): Map<string, CaseStatus> {
  const map = new Map<string, CaseStatus>();
  for (const t of transitions) {
    const froms = Array.isArray(t.from) ? t.from : [t.from];
    for (const f of froms) {
      map.set(`${f}:${t.action}`, t.to);
    }
  }
  return map;
}

const lookup = buildLookup();

/**
 * Returns the target status if the transition is valid, or null if not.
 */
export function canTransition(from: CaseStatus, action: CaseAction): CaseStatus | null {
  return lookup.get(`${from}:${action}`) ?? null;
}

/**
 * Returns all actions available from the given status.
 */
export function getAllowedActions(status: CaseStatus): CaseAction[] {
  const actions: CaseAction[] = [];
  for (const [key] of lookup) {
    const [fromStatus, action] = key.split(':') as [CaseStatus, CaseAction];
    if (fromStatus === status && !actions.includes(action)) {
      actions.push(action);
    }
  }
  return actions;
}

/**
 * Returns the target status for the given transition, or throws if invalid.
 */
export function getNextStatus(from: CaseStatus, action: CaseAction): CaseStatus {
  const next = canTransition(from, action);
  if (next === null) {
    throw new Error(`Invalid transition: ${from} -> ${action}`);
  }
  return next;
}

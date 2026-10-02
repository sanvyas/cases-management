export interface ChargeRecord {
  personId: string;
  designationId: string;
  departmentId: string;
  nodeId: string;
  nodePath: string;
  isAvailable: boolean;
  openCaseCount: number;
}

export interface RoutingInput {
  subtypeAssignmentMode: string;
  nodeId: string;
  nodePath: string;
  departmentId: string;
  designationId?: string;
  charges: ChargeRecord[];
}

export interface RoutingResult {
  assigneePersonId: string | null;
  routingFailed: boolean;
  reason: string;
}

function autoRoute(charges: ChargeRecord[], input: RoutingInput): RoutingResult {
  // Filter by node, department, and optionally designation
  let candidates = charges.filter(
    (c) =>
      c.nodeId === input.nodeId &&
      c.departmentId === input.departmentId &&
      c.isAvailable,
  );

  if (input.designationId) {
    candidates = candidates.filter((c) => c.designationId === input.designationId);
  }

  if (candidates.length === 0) {
    return {
      assigneePersonId: null,
      routingFailed: true,
      reason: 'no_available_assignee',
    };
  }

  // Pick least loaded (lowest openCaseCount); ties broken by order in list
  let best = candidates[0]!;
  for (let i = 1; i < candidates.length; i++) {
    const c = candidates[i]!;
    if (c.openCaseCount < best.openCaseCount) {
      best = c;
    }
  }

  return {
    assigneePersonId: best.personId,
    routingFailed: false,
    reason: 'auto_assigned',
  };
}

export function routeCase(input: RoutingInput): RoutingResult {
  switch (input.subtypeAssignmentMode) {
    case 'internal_auto':
    case 'vendor_auto':
      return autoRoute(input.charges, input);

    case 'internal_manual':
    case 'vendor_manual':
    case 'pool_manual':
      return {
        assigneePersonId: null,
        routingFailed: false,
        reason: 'queued_for_manual_assignment',
      };

    default:
      return {
        assigneePersonId: null,
        routingFailed: true,
        reason: `unknown_assignment_mode: ${input.subtypeAssignmentMode}`,
      };
  }
}

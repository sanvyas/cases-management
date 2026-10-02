export type StaffRole = 'officer' | 'field_worker';

export type CaseStatus =
  | 'REGISTERED'
  | 'ASSIGNED'
  | 'ACCEPTED'
  | 'IN_PROGRESS'
  | 'ATR_SUBMITTED'
  | 'RESOLVED'
  | 'CLOSED'
  | 'REOPENED'
  | 'OVERDUE';

export type CasePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type CaseChannel = 'PHONE' | 'WHATSAPP' | 'WALK_IN' | 'WEB' | 'MOBILE' | 'SOCIAL_MEDIA';

export interface Case {
  id: string;
  caseNumber: string;
  complaintType: string;
  subType: string;
  department: string;
  status: CaseStatus;
  priority: CasePriority;
  location: string;
  zone: string;
  ward: string;
  citizenName: string;
  citizenPhone: string;
  assignee: string;
  assigneeDesignation: string;
  channel: CaseChannel;
  registeredAt: string;
  slaDueAt: string;
  resolvedAt: string | null;
  description: string;
  icon: string;
  iconBg: string;
  iconFg: string;
}

export interface TimelineEntry {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  actorRole: string;
  details: string;
  icon: string;
}

export interface DashboardKPI {
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: string;
  bg: string;
  fg: string;
}

export interface DepartmentSummary {
  department: string;
  icon: string;
  total: number;
  open: number;
  overdue: number;
  resolved: number;
  avgDays: number;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  role: StaffRole;
  roleLabel: string;
  tenantId: string;
  tenantName: string;
  permissions: string[];
}

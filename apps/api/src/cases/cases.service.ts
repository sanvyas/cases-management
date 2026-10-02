import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

interface CaseRecord {
  id: string;
  tenantId: string;
  caseNo: string;
  kind: string;
  status: string;
  subtypeId: string;
  subtypeName: string;
  departmentName: string;
  typeName: string;
  nodeId: string;
  nodeName: string;
  nodePath: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  description: string;
  citizenName: string;
  citizenPhone: string;
  assigneeName: string | null;
  assigneeDesignation: string | null;
  priority: string;
  isSenior: boolean;
  slaDueAt: string | null;
  breached: boolean;
  reopenCount: number;
  channel: string;
  createdAt: string;
  updatedAt: string;
}

interface TimelineRecord {
  id: string;
  caseId: string;
  action: string;
  actorName: string;
  details: Record<string, unknown> | null;
  isPublic: boolean;
  createdAt: string;
}

const DEMO_CASES: CaseRecord[] = [
  { id: 'c001', tenantId: 't1', caseNo: 'GMD-26-000001', kind: 'complaint', status: 'ASSIGNED', subtypeId: 's1', subtypeName: 'No water supply', departmentName: 'Water Supply', typeName: 'Water Supply', nodeId: 'n1', nodeName: 'Ward 3, Zone 1', nodePath: 'zone-1.ward-3', address: 'Sector 15, Near Park', latitude: 28.4595, longitude: 77.0266, description: 'No water supply since morning', citizenName: 'Ravi Kumar', citizenPhone: '****1234', assigneeName: 'JE Ramesh Sharma', assigneeDesignation: 'Junior Engineer', priority: 'normal', isSenior: false, slaDueAt: new Date(Date.now() + 86400000).toISOString(), breached: false, reopenCount: 0, channel: 'web', createdAt: new Date(Date.now() - 3600000).toISOString(), updatedAt: new Date(Date.now() - 1800000).toISOString() },
  { id: 'c002', tenantId: 't1', caseNo: 'GMD-26-000002', kind: 'complaint', status: 'IN_PROGRESS', subtypeId: 's2', subtypeName: 'Garbage not collected', departmentName: 'Sanitation', typeName: 'Sanitation & Garbage', nodeId: 'n2', nodeName: 'Ward 7, Zone 2', nodePath: 'zone-2.ward-7', address: 'Mohalla Ganj, Main Road', latitude: 28.4612, longitude: 77.0315, description: 'Garbage not collected for 3 days', citizenName: 'Sunita Devi', citizenPhone: '****5678', assigneeName: 'Safai Karmi Mohan', assigneeDesignation: 'Safai Karmi', priority: 'normal', isSenior: false, slaDueAt: new Date(Date.now() + 43200000).toISOString(), breached: false, reopenCount: 0, channel: 'whatsapp', createdAt: new Date(Date.now() - 86400000).toISOString(), updatedAt: new Date(Date.now() - 7200000).toISOString() },
  { id: 'c003', tenantId: 't1', caseNo: 'GMD-26-000003', kind: 'complaint', status: 'RESOLVED', subtypeId: 's3', subtypeName: 'Pothole', departmentName: 'Roads', typeName: 'Roads', nodeId: 'n1', nodeName: 'Ward 3, Zone 1', nodePath: 'zone-1.ward-3', address: 'MG Road, Near Bus Stand', latitude: 28.4580, longitude: 77.0290, description: 'Large pothole causing accidents', citizenName: 'Amit Patel', citizenPhone: '****9012', assigneeName: 'AE Priya Singh', assigneeDesignation: 'Assistant Engineer', priority: 'high', isSenior: false, slaDueAt: new Date(Date.now() - 86400000).toISOString(), breached: false, reopenCount: 0, channel: 'phone', createdAt: new Date(Date.now() - 604800000).toISOString(), updatedAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 'c004', tenantId: 't1', caseNo: 'GMD-26-000004', kind: 'complaint', status: 'REGISTERED', subtypeId: 's4', subtypeName: 'Streetlight not working', departmentName: 'Streetlights', typeName: 'Streetlights', nodeId: 'n3', nodeName: 'Ward 12, Zone 3', nodePath: 'zone-3.ward-12', address: 'Gandhi Nagar, Near Temple', latitude: 28.4550, longitude: 77.0350, description: 'Streetlight pole 47 not working since last week', citizenName: 'Meena Sharma', citizenPhone: '****3456', assigneeName: null, assigneeDesignation: null, priority: 'normal', isSenior: false, slaDueAt: new Date(Date.now() + 172800000).toISOString(), breached: false, reopenCount: 0, channel: 'app', createdAt: new Date(Date.now() - 1800000).toISOString(), updatedAt: new Date(Date.now() - 1800000).toISOString() },
  { id: 'c005', tenantId: 't1', caseNo: 'GMD-26-000005', kind: 'complaint', status: 'CLOSED', subtypeId: 's5', subtypeName: 'Sewer overflow', departmentName: 'Sewerage', typeName: 'Sewerage & Drains', nodeId: 'n2', nodeName: 'Ward 7, Zone 2', nodePath: 'zone-2.ward-7', address: 'Station Road, Block B', latitude: 28.4630, longitude: 77.0280, description: 'Sewer overflowing on main road', citizenName: 'Rajesh Gupta', citizenPhone: '****7890', assigneeName: 'JE Vikram Yadav', assigneeDesignation: 'Junior Engineer', priority: 'high', isSenior: false, slaDueAt: new Date(Date.now() - 604800000).toISOString(), breached: false, reopenCount: 0, channel: 'web', createdAt: new Date(Date.now() - 1209600000).toISOString(), updatedAt: new Date(Date.now() - 432000000).toISOString() },
];

const DEMO_TIMELINE: TimelineRecord[] = [
  { id: 't1', caseId: 'c001', action: 'registered', actorName: 'System', details: { channel: 'web' }, isPublic: true, createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 't2', caseId: 'c001', action: 'assigned', actorName: 'System', details: { assignee: 'JE Ramesh Sharma' }, isPublic: true, createdAt: new Date(Date.now() - 3000000).toISOString() },
  { id: 't3', caseId: 'c003', action: 'registered', actorName: 'System', details: { channel: 'phone' }, isPublic: true, createdAt: new Date(Date.now() - 604800000).toISOString() },
  { id: 't4', caseId: 'c003', action: 'assigned', actorName: 'System', details: { assignee: 'AE Priya Singh' }, isPublic: true, createdAt: new Date(Date.now() - 604000000).toISOString() },
  { id: 't5', caseId: 'c003', action: 'accepted', actorName: 'AE Priya Singh', details: null, isPublic: true, createdAt: new Date(Date.now() - 518400000).toISOString() },
  { id: 't6', caseId: 'c003', action: 'atr_submitted', actorName: 'AE Priya Singh', details: { remarks: 'Pothole filled with hot mix' }, isPublic: true, createdAt: new Date(Date.now() - 259200000).toISOString() },
  { id: 't7', caseId: 'c003', action: 'atr_approved', actorName: 'XEN Sunil Verma', details: null, isPublic: true, createdAt: new Date(Date.now() - 172800000).toISOString() },
  { id: 't8', caseId: 'c003', action: 'resolved', actorName: 'System', details: null, isPublic: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
];

@Injectable()
export class CasesService {
  private cases = [...DEMO_CASES];
  private caseCounter = 6;

  list(query: { status?: string; search?: string; limit?: number }): { data: CaseRecord[]; total: number } {
    let filtered = this.cases;
    if (query.status) {
      filtered = filtered.filter(c => c.status === query.status);
    }
    if (query.search) {
      const s = query.search.toLowerCase();
      filtered = filtered.filter(c =>
        c.caseNo.toLowerCase().includes(s) ||
        c.subtypeName.toLowerCase().includes(s) ||
        c.citizenName.toLowerCase().includes(s) ||
        c.address.toLowerCase().includes(s)
      );
    }
    const limit = query.limit ?? 20;
    return { data: filtered.slice(0, limit), total: filtered.length };
  }

  getById(id: string): CaseRecord {
    const c = this.cases.find(c => c.id === id);
    if (!c) throw new NotFoundException('Case not found');
    return c;
  }

  getTimeline(caseId: string): TimelineRecord[] {
    return DEMO_TIMELINE.filter(t => t.caseId === caseId);
  }

  create(data: {
    subtypeId: string;
    nodeId: string;
    address: string;
    description: string;
    citizenPhone: string;
    citizenName: string;
    channel?: string;
  }): CaseRecord {
    const id = randomUUID();
    const caseNo = `GMD-26-${String(this.caseCounter++).padStart(6, '0')}`;
    const now = new Date().toISOString();
    const newCase: CaseRecord = {
      id,
      tenantId: 't1',
      caseNo,
      kind: 'complaint',
      status: 'REGISTERED',
      subtypeId: data.subtypeId,
      subtypeName: 'General Complaint',
      departmentName: 'General',
      typeName: 'General',
      nodeId: data.nodeId,
      nodeName: 'Ward 3, Zone 1',
      nodePath: 'zone-1.ward-3',
      address: data.address,
      latitude: null,
      longitude: null,
      description: data.description,
      citizenName: data.citizenName,
      citizenPhone: data.citizenPhone.slice(-4).padStart(data.citizenPhone.length, '*'),
      assigneeName: null,
      assigneeDesignation: null,
      priority: 'normal',
      isSenior: false,
      slaDueAt: new Date(Date.now() + 86400000).toISOString(),
      breached: false,
      reopenCount: 0,
      channel: data.channel ?? 'web',
      createdAt: now,
      updatedAt: now,
    };
    this.cases.push(newCase);
    return newCase;
  }

  performAction(caseId: string, action: string, _data?: Record<string, unknown>): CaseRecord {
    const c = this.cases.find(c => c.id === caseId);
    if (!c) throw new NotFoundException('Case not found');

    const statusMap: Record<string, string> = {
      assign: 'ASSIGNED',
      accept: 'ACCEPTED',
      start_work: 'IN_PROGRESS',
      submit_atr: 'ATR_SUBMITTED',
      approve_atr: 'RESOLVED',
      return_atr: 'IN_PROGRESS',
      resolve: 'RESOLVED',
      close: 'CLOSED',
      request_eot: 'EOT_PENDING',
      approve_eot: 'IN_PROGRESS',
      request_hold: 'ON_HOLD',
      release_hold: 'IN_PROGRESS',
      reject_case: 'REJECTED',
      reopen: 'REOPENED',
      feedback_positive: 'CLOSED',
      feedback_negative: 'REOPENED',
    };

    const newStatus = statusMap[action];
    if (newStatus) {
      c.status = newStatus;
      c.updatedAt = new Date().toISOString();
    }
    return c;
  }

  getDashboardStats(): Record<string, number> {
    return {
      total: this.cases.length,
      open: this.cases.filter(c => !['CLOSED', 'REJECTED', 'MERGED'].includes(c.status)).length,
      overdue: this.cases.filter(c => c.breached).length,
      resolvedToday: this.cases.filter(c => c.status === 'RESOLVED').length,
      closed: this.cases.filter(c => c.status === 'CLOSED').length,
    };
  }
}

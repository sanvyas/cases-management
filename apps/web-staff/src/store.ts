import type { Case } from './types';

const STORAGE_KEY = 'samadhan_complaints';

interface StoredComplaint {
  id: string;
  caseNumber: string;
  categoryId: string;
  categoryHi: string;
  categoryEn: string;
  categoryIcon: string;
  categoryBg: string;
  categoryFg: string;
  subtypeId: string;
  subtypeHi: string;
  subtypeEn: string;
  subtypeIcon: string;
  sla: string;
  slaEn: string;
  locationHi: string;
  locationEn: string;
  locationLandmark: string;
  gpsLat: number | null;
  gpsLng: number | null;
  gpsAddress: string;
  photoCount: number;
  hasVideo: boolean;
  hasVoice: boolean;
  voiceTranscript: string;
  description: string;
  status: string;
  registeredAt: string;
  citizenPhone: string;
  citizenName: string;
  channel: string;
  department: string;
  assignee: string;
  assigneeDesignation: string;
  priority: string;
  slaDueAt: string;
  resolvedAt: string | null;
  comments: Array<{ actor: string; text: string; timestamp: string }>;
}

function getStoredComplaints(): StoredComplaint[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as StoredComplaint[];
  } catch {
    return [];
  }
}

export function updateStoredComplaint(id: string, updates: Partial<StoredComplaint>): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const all = JSON.parse(raw) as StoredComplaint[];
    const idx = all.findIndex(c => c.id === id);
    if (idx >= 0) {
      all[idx] = { ...all[idx]!, ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    }
  } catch { /* noop */ }
}

const ICON_MAP: Record<string, { icon: string; bg: string; fg: string }> = {
  water: { icon: 'water_drop', bg: '#E0F0FF', fg: '#2F6690' },
  sanitation: { icon: 'delete', bg: '#E6F5EC', fg: '#2F7D4F' },
  streetlight: { icon: 'lightbulb', bg: '#FFF4D6', fg: '#8A5A00' },
  roads: { icon: 'road', bg: '#E9E3DB', fg: '#4A3E34' },
  encroachment: { icon: 'fence', bg: '#F5DEDA', fg: '#A13D2D' },
  welfare: { icon: 'badge', bg: '#F5E0EA', fg: '#94386A' },
  office: { icon: 'account_balance', bg: '#E7E2DB', fg: '#5A4E44' },
};

const CHANNEL_MAP: Record<string, string> = {
  WEB: 'WEB',
  VOICE: 'PHONE',
  MOBILE: 'MOBILE',
};

export function getCitizenCasesAsStaffCases(): Case[] {
  const stored = getStoredComplaints();
  return stored.map((c): Case => {
    const iconInfo = ICON_MAP[c.categoryId] || { icon: 'edit_note', bg: '#E9E3DB', fg: '#4A3E34' };
    return {
      id: c.id,
      caseNumber: c.caseNumber,
      complaintType: c.categoryEn,
      subType: c.subtypeEn,
      department: c.department,
      status: (c.status as Case['status']) || 'REGISTERED',
      priority: (c.priority as Case['priority']) || 'MEDIUM',
      location: c.gpsAddress || c.locationEn || c.locationHi,
      zone: 'Citizen App',
      ward: '',
      citizenName: c.citizenName || 'Citizen',
      citizenPhone: c.citizenPhone ? `****${c.citizenPhone.slice(-4)}` : '****0000',
      assignee: c.assignee || '',
      assigneeDesignation: c.assigneeDesignation || '',
      channel: (CHANNEL_MAP[c.channel] || 'WEB') as Case['channel'],
      registeredAt: c.registeredAt,
      slaDueAt: c.slaDueAt,
      resolvedAt: c.resolvedAt,
      description: c.description || c.voiceTranscript || c.subtypeEn,
      icon: iconInfo.icon,
      iconBg: iconInfo.bg,
      iconFg: iconInfo.fg,
    };
  });
}

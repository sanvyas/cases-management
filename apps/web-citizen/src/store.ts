import { categories, locations, TENANT } from './data/mockData';
import { getDeployedConfig } from './platformConfig';

const STORAGE_KEY = 'samadhan_complaints';
const CITIZEN_KEY = 'samadhan_citizen';

export interface StoredComplaint {
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

const CATEGORY_DEPARTMENT: Record<string, string> = {
  water: 'Water Works',
  sanitation: 'Sanitation',
  streetlight: 'Electrical',
  roads: 'Public Works',
  encroachment: 'Revenue',
  welfare: 'Welfare',
  office: 'Administration',
};

const VOICE_KEYWORDS: Record<string, string[]> = {
  water: ['water', 'pani', 'पानी', 'हैंडपंप', 'handpump', 'नल', 'tap', 'pipe', 'leak', 'लीक', 'पाइप', 'टंकी', 'tank', 'पेयजल', 'drinking'],
  sanitation: ['garbage', 'kuda', 'कूड़ा', 'सफ़ाई', 'safai', 'नाली', 'drain', 'nali', 'मच्छर', 'mosquito', 'शौचालय', 'toilet', 'गंदा', 'dirty', 'कचरा', 'smell', 'बदबू'],
  streetlight: ['light', 'bulb', 'bijli', 'बत्ती', 'बिजली', 'streetlight', 'lamp', 'चिंगारी', 'spark', 'अँधेरा', 'dark'],
  roads: ['road', 'sadak', 'सड़क', 'pothole', 'गड्ढा', 'gaddha', 'नाली', 'जलभराव', 'waterlog', 'पुलिया', 'culvert', 'टूटी'],
  encroachment: ['encroachment', 'kabza', 'कब्ज़ा', 'अतिक्रमण', 'भूमि', 'land', 'रास्ता', 'path'],
  welfare: ['pension', 'पेंशन', 'certificate', 'प्रमाणपत्र', 'जन्म', 'birth', 'मृत्यु', 'death', 'job card', 'जॉब', 'आवास', 'housing'],
  office: ['office', 'कार्यालय', 'ग्राम सभा', 'gram sabha', 'staff', 'कर्मचारी', 'दुर्व्यवहार', 'misbehav'],
};

export function detectDepartmentFromTranscript(transcript: string): { categoryIndex: number; department: string } | null {
  const lower = transcript.toLowerCase();
  let bestMatch = '';
  let bestCount = 0;

  for (const [catId, keywords] of Object.entries(VOICE_KEYWORDS)) {
    let count = 0;
    for (const kw of keywords) {
      if (lower.includes(kw.toLowerCase())) count++;
    }
    if (count > bestCount) {
      bestCount = count;
      bestMatch = catId;
    }
  }

  if (bestMatch && bestCount > 0) {
    const catIdx = categories.findIndex(c => c.id === bestMatch);
    return {
      categoryIndex: catIdx,
      department: CATEGORY_DEPARTMENT[bestMatch] || 'General',
    };
  }
  return null;
}

function parseSlaHours(sla: string): number {
  if (sla.includes('घंटे') || sla.includes('h')) {
    const num = parseInt(sla, 10);
    return isNaN(num) ? 48 : num;
  }
  if (sla.includes('दिन') || sla.includes('day')) {
    const num = parseInt(sla, 10);
    return isNaN(num) ? 48 : num * 24;
  }
  return 48;
}

function determinePriority(slaHours: number): string {
  if (slaHours <= 12) return 'CRITICAL';
  if (slaHours <= 24) return 'HIGH';
  if (slaHours <= 72) return 'MEDIUM';
  return 'LOW';
}

export function saveComplaint(data: {
  catIndex: number;
  subIndex: number;
  locIndex: number;
  gpsCoords: { lat: number; lng: number } | null;
  gpsAddress: string;
  photoCount: number;
  hasVideo: boolean;
  hasVoice: boolean;
  voiceTranscript: string;
  description: string;
  citizenPhone: string;
  citizenName: string;
}): string {
  const now = new Date().toISOString();
  const id = `citizen-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const deployed = getDeployedConfig();
  const prefix = deployed?.tenant.casePrefix || TENANT.prefix;
  const num = `${prefix}-${new Date().getFullYear().toString().slice(-2)}-${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}`;

  const cat = data.catIndex >= 0 ? categories[data.catIndex] : null;
  const sub = cat && data.subIndex >= 0 ? cat.subs[data.subIndex] : null;
  const loc = data.locIndex >= 0 ? locations[data.locIndex] : null;

  const slaHours = sub ? parseSlaHours(sub.sla) : 48;
  const slaDue = new Date(Date.now() + slaHours * 3600000).toISOString();

  const department = cat ? (CATEGORY_DEPARTMENT[cat.id] || 'General') : 'General';

  const complaint: StoredComplaint = {
    id,
    caseNumber: num,
    categoryId: cat?.id || 'other',
    categoryHi: cat?.hi || 'अन्य',
    categoryEn: cat?.en || 'Other',
    categoryIcon: cat?.icon || 'edit_note',
    categoryBg: cat?.bg || '#E9E3DB',
    categoryFg: cat?.fg || '#4A3E34',
    subtypeId: sub?.id || 'other',
    subtypeHi: sub?.hi || data.description || 'अन्य समस्या',
    subtypeEn: sub?.en || data.description || 'Other issue',
    subtypeIcon: sub?.icon || 'edit_note',
    sla: sub?.sla || '48 घंटे',
    slaEn: sub?.slaEn || '48 h',
    locationHi: loc?.hi || data.gpsAddress || 'GPS Location',
    locationEn: loc?.en || data.gpsAddress || 'GPS Location',
    locationLandmark: loc?.landmark || data.gpsAddress || '',
    gpsLat: data.gpsCoords?.lat ?? null,
    gpsLng: data.gpsCoords?.lng ?? null,
    gpsAddress: data.gpsAddress,
    photoCount: data.photoCount,
    hasVideo: data.hasVideo,
    hasVoice: data.hasVoice,
    voiceTranscript: data.voiceTranscript,
    description: data.description || data.voiceTranscript || (sub?.en || 'Complaint registered'),
    status: 'REGISTERED',
    registeredAt: now,
    citizenPhone: data.citizenPhone,
    citizenName: data.citizenName,
    channel: data.hasVoice ? 'VOICE' : 'WEB',
    department,
    assignee: '',
    assigneeDesignation: '',
    priority: determinePriority(slaHours),
    slaDueAt: slaDue,
    resolvedAt: null,
    comments: [],
  };

  const existing = getComplaints();
  existing.unshift(complaint);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  } catch { /* storage full */ }

  return num;
}

export function getComplaints(): StoredComplaint[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as StoredComplaint[];
  } catch {
    return [];
  }
}

export function getComplaintById(id: string): StoredComplaint | null {
  const all = getComplaints();
  return all.find(c => c.id === id) ?? null;
}

export function updateComplaint(id: string, updates: Partial<StoredComplaint>): void {
  const all = getComplaints();
  const idx = all.findIndex(c => c.id === id);
  if (idx >= 0) {
    all[idx] = { ...all[idx]!, ...updates };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    } catch { /* storage full */ }
  }
}

export interface CitizenUser {
  name: string;
  phone: string;
}

interface CitizenSession {
  user: CitizenUser;
  expiresAt: number;
}

const CITIZEN_SESSION_TIMEOUT_MS = 60 * 60 * 1000;

export function getCitizenUser(): CitizenUser | null {
  try {
    const raw = localStorage.getItem(CITIZEN_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as CitizenSession;
    if (session.expiresAt && Date.now() > session.expiresAt) {
      localStorage.removeItem(CITIZEN_KEY);
      return null;
    }
    return session.user;
  } catch {
    localStorage.removeItem(CITIZEN_KEY);
    return null;
  }
}

export function saveCitizenUser(user: CitizenUser): void {
  const session: CitizenSession = { user, expiresAt: Date.now() + CITIZEN_SESSION_TIMEOUT_MS };
  try {
    localStorage.setItem(CITIZEN_KEY, JSON.stringify(session));
  } catch { /* noop */ }
}

export function refreshCitizenSession(): void {
  const user = getCitizenUser();
  if (user) saveCitizenUser(user);
}

export function clearCitizenUser(): void {
  try {
    localStorage.removeItem(CITIZEN_KEY);
  } catch { /* noop */ }
}

export function getMyComplaints(): StoredComplaint[] {
  const user = getCitizenUser();
  if (!user) return [];
  const all = getComplaints();
  return all.filter(c => c.citizenPhone === user.phone);
}

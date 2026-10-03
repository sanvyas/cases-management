import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import type { User } from './types';
import { getDeployedConfig } from './platformConfig';

interface AuthSession {
  user: User;
  expiresAt: number;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (phone: string, otp: string, role: string) => { ok: boolean; error?: string };
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

const AUTH_KEY = 'samadhan_staff_user';
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000;
const ATTEMPTS_KEY = 'samadhan_staff_login_attempts';

interface LoginAttempts {
  count: number;
  lockedUntil: number | null;
}

function getLoginAttempts(): LoginAttempts {
  try {
    const raw = localStorage.getItem(ATTEMPTS_KEY);
    if (raw) return JSON.parse(raw) as LoginAttempts;
  } catch { /* noop */ }
  return { count: 0, lockedUntil: null };
}

function setLoginAttempts(attempts: LoginAttempts): void {
  try {
    localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts));
  } catch { /* noop */ }
}

function getTenantInfo(): { tenantId: string; tenantName: string } {
  const deployed = getDeployedConfig();
  if (deployed) {
    return { tenantId: deployed.tenant.id, tenantName: deployed.tenant.name };
  }
  return { tenantId: 'tenant-nagar-palika', tenantName: 'Nagar Palika Parishad, Ayodhya' };
}

function getRolePermissions(roleKey: string): string[] {
  const deployed = getDeployedConfig();
  if (deployed) {
    const roleMap: Record<string, string> = {
      officer: 'nodal_officer',
      field_worker: 'field_staff',
      inspector: 'officer',
      data_entry: 'agent',
    };
    const platformRoleKey = roleMap[roleKey] || roleKey;
    const role = deployed.config.features.roles.find(r => r.key === platformRoleKey);
    if (role && role.enabled) {
      return role.permissions.includes('*')
        ? ['dashboard.view', 'cases.view', 'cases.manage', 'cases.assign',
           'cases.approve', 'cases.comment', 'cases.status.change',
           'cases.media.upload', 'cases.escalate',
           'settings.view', 'settings.edit',
           'users.view', 'users.manage',
           'citizen.pii.view', 'reports.export']
        : role.permissions;
    }
  }
  return [];
}

function buildRoleConfigs(): Record<string, Omit<User, 'id' | 'phone'>> {
  const { tenantId, tenantName } = getTenantInfo();
  const officerPerms = getRolePermissions('officer');
  const fieldPerms = getRolePermissions('field_worker');
  const inspectorPerms = getRolePermissions('inspector');
  const dataEntryPerms = getRolePermissions('data_entry');

  return {
    officer: {
      name: 'Aarav Mehta',
      roleLabel: 'Supervising Officer',
      tenantId,
      tenantName,
      permissions: officerPerms.length > 0 ? officerPerms : [
        'dashboard.view', 'cases.view', 'cases.manage', 'cases.assign',
        'cases.approve', 'cases.comment', 'cases.status.change',
        'cases.media.upload', 'cases.escalate',
        'settings.view', 'settings.edit',
        'users.view', 'users.manage',
        'citizen.pii.view', 'reports.export',
      ],
    },
    field_worker: {
      name: 'Ramesh Sharma',
      roleLabel: 'Junior Engineer (Field)',
      tenantId,
      tenantName,
      permissions: fieldPerms.length > 0 ? fieldPerms : [
        'dashboard.view', 'cases.view', 'cases.comment',
        'cases.status.change', 'cases.media.upload',
        'cases.atr.submit',
      ],
    },
    inspector: {
      name: 'Priya Patel',
      roleLabel: 'Sanitary Inspector',
      tenantId,
      tenantName,
      permissions: inspectorPerms.length > 0 ? inspectorPerms : [
        'dashboard.view', 'cases.view', 'cases.comment',
        'cases.status.change', 'cases.media.upload',
        'cases.atr.submit',
      ],
    },
    data_entry: {
      name: 'Neha Singh',
      roleLabel: 'Data Entry Operator',
      tenantId,
      tenantName,
      permissions: dataEntryPerms.length > 0 ? dataEntryPerms : [
        'cases.view', 'cases.comment', 'cases.register',
      ],
    },
  };
}

const AuthContext = createContext<AuthContextType | null>(null);

function loadStoredSession(): User | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as AuthSession;
    if (session.expiresAt && Date.now() > session.expiresAt) {
      localStorage.removeItem(AUTH_KEY);
      return null;
    }
    return session.user;
  } catch {
    localStorage.removeItem(AUTH_KEY);
    return null;
  }
}

function saveSession(user: User): void {
  const session: AuthSession = { user, expiresAt: Date.now() + SESSION_TIMEOUT_MS };
  try {
    localStorage.setItem(AUTH_KEY, JSON.stringify(session));
  } catch { /* noop */ }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => loadStoredSession());
  const isAuthenticated = user !== null;

  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      const stored = loadStoredSession();
      if (!stored) {
        setUser(null);
      }
    }, 60_000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    function refreshSession() {
      if (user) saveSession(user);
    }
    window.addEventListener('click', refreshSession);
    window.addEventListener('keydown', refreshSession);
    return () => {
      window.removeEventListener('click', refreshSession);
      window.removeEventListener('keydown', refreshSession);
    };
  }, [user]);

  const login = useCallback((phone: string, otp: string, role: string): { ok: boolean; error?: string } => {
    const attempts = getLoginAttempts();
    if (attempts.lockedUntil && Date.now() < attempts.lockedUntil) {
      const remainSec = Math.ceil((attempts.lockedUntil - Date.now()) / 1000);
      return { ok: false, error: `Too many attempts. Try again in ${remainSec}s.` };
    }

    if (phone.length < 10) {
      return { ok: false, error: 'Enter a valid 10-digit phone number.' };
    }

    if (otp !== '1234') {
      const newCount = (attempts.lockedUntil && Date.now() >= attempts.lockedUntil ? 0 : attempts.count) + 1;
      const locked = newCount >= MAX_LOGIN_ATTEMPTS ? Date.now() + LOCKOUT_DURATION_MS : null;
      setLoginAttempts({ count: newCount, lockedUntil: locked });
      if (locked) {
        return { ok: false, error: 'Too many failed attempts. Try again in 5 minutes.' };
      }
      return { ok: false, error: `Invalid OTP. ${MAX_LOGIN_ATTEMPTS - newCount} attempts remaining.` };
    }

    setLoginAttempts({ count: 0, lockedUntil: null });
    const roleConfigs = buildRoleConfigs();
    const config = roleConfigs[role] || roleConfigs.officer!;
    const uniqueId = `usr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const newUser: User = { id: uniqueId, phone, ...config };
    setUser(newUser);
    saveSession(newUser);
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(AUTH_KEY);
  }, []);

  const hasPermission = useCallback((permission: string): boolean => {
    if (!user) return false;
    return user.permissions.includes(permission);
  }, [user]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

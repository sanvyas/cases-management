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

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (phone: string, otp: string, role: string) => boolean;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

const AUTH_KEY = 'samadhan_staff_user';

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

function loadStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => loadStoredUser());
  const isAuthenticated = user !== null;

  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_KEY);
    }
  }, [user]);

  const login = useCallback((phone: string, otp: string, role: string): boolean => {
    if (otp === '1234' && phone.length >= 10) {
      const roleConfigs = buildRoleConfigs();
      const config = roleConfigs[role] || roleConfigs.officer!;
      setUser({
        id: `usr-${phone.slice(-4)}`,
        phone,
        ...config,
      });
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
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

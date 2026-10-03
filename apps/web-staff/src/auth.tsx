import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import type { User } from './types';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (phone: string, otp: string, role: string) => boolean;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

const AUTH_KEY = 'samadhan_staff_user';

const ROLE_CONFIGS: Record<string, Omit<User, 'id' | 'phone'>> = {
  officer: {
    name: 'Aarav Mehta',
    roleLabel: 'Supervising Officer',
    tenantId: 'tenant-nagar-palika',
    tenantName: 'Nagar Palika Parishad, Ayodhya',
    permissions: [
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
    tenantId: 'tenant-nagar-palika',
    tenantName: 'Nagar Palika Parishad, Ayodhya',
    permissions: [
      'dashboard.view', 'cases.view', 'cases.comment',
      'cases.status.change', 'cases.media.upload',
      'cases.atr.submit',
    ],
  },
  inspector: {
    name: 'Priya Patel',
    roleLabel: 'Sanitary Inspector',
    tenantId: 'tenant-nagar-palika',
    tenantName: 'Nagar Palika Parishad, Ayodhya',
    permissions: [
      'dashboard.view', 'cases.view', 'cases.comment',
      'cases.status.change', 'cases.media.upload',
      'cases.atr.submit',
    ],
  },
  data_entry: {
    name: 'Neha Singh',
    roleLabel: 'Data Entry Operator',
    tenantId: 'tenant-nagar-palika',
    tenantName: 'Nagar Palika Parishad, Ayodhya',
    permissions: [
      'cases.view', 'cases.comment', 'cases.register',
    ],
  },
};

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
      const config = ROLE_CONFIGS[role] || ROLE_CONFIGS.officer!;
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

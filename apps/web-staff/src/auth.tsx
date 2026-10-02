import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type { User, StaffRole } from './types';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (phone: string, otp: string, role: StaffRole) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const MOCK_USERS: Record<StaffRole, User> = {
  officer: {
    id: 'usr-001',
    name: 'Aarav Mehta',
    phone: '9876543210',
    role: 'officer',
    roleLabel: 'Supervising Officer',
    tenantId: 'tenant-nagar-palika',
    tenantName: 'Nagar Palika Parishad, Ayodhya',
    permissions: ['dashboard.view', 'cases.view', 'cases.manage', 'cases.approve', 'settings.view', 'settings.edit'],
  },
  field_worker: {
    id: 'usr-002',
    name: 'Ramesh Sharma',
    phone: '9876543211',
    role: 'field_worker',
    roleLabel: 'Field Worker',
    tenantId: 'tenant-nagar-palika',
    tenantName: 'Nagar Palika Parishad, Ayodhya',
    permissions: ['cases.view', 'cases.accept', 'cases.work', 'cases.atr'],
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback((phone: string, otp: string, role: StaffRole): boolean => {
    if (otp === '1234' && phone.length >= 10) {
      setIsAuthenticated(true);
      setUser(MOCK_USERS[role]);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
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

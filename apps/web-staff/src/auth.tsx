import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type { User } from './types';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (phone: string, otp: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const MOCK_USER: User = {
  id: 'usr-001',
  name: 'Aarav Mehta',
  phone: '9876543210',
  role: 'Municipal Commissioner',
  tenantId: 'tenant-nagar-palika',
  tenantName: 'Nagar Palika Parishad, Ayodhya',
  permissions: ['dashboard.view', 'cases.view', 'cases.manage', 'settings.view', 'settings.edit'],
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback((phone: string, otp: string): boolean => {
    if (otp === '1234' && phone.length >= 10) {
      setIsAuthenticated(true);
      setUser(MOCK_USER);
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

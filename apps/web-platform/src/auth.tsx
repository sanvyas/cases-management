import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import type { PlatformUser } from './types';

interface AuthContextType {
  isAuthenticated: boolean;
  user: PlatformUser | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const AUTH_KEY = 'samadhan_platform_user';

const VALID_USERS: Record<string, PlatformUser> = {
  'admin@samadhan.in': {
    id: 'plt-001',
    name: 'Sanskar Vyas',
    email: 'admin@samadhan.in',
    role: 'platform_owner',
  },
  'support@samadhan.in': {
    id: 'plt-002',
    name: 'Anita Sharma',
    email: 'support@samadhan.in',
    role: 'platform_support',
  },
};

const AuthContext = createContext<AuthContextType | null>(null);

function loadStoredUser(): PlatformUser | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PlatformUser;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PlatformUser | null>(() => loadStoredUser());
  const isAuthenticated = user !== null;

  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_KEY);
    }
  }, [user]);

  const login = useCallback((email: string, password: string): boolean => {
    if (password === 'samadhan' && VALID_USERS[email]) {
      setUser(VALID_USERS[email]!);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
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

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import type { PlatformUser } from './types';

interface AuthSession {
  user: PlatformUser;
  expiresAt: number;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: PlatformUser | null;
  login: (email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
}

const AUTH_KEY = 'samadhan_platform_user';
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000;
const ATTEMPTS_KEY = 'samadhan_platform_login_attempts';

const VALID_USERS: Record<string, { user: PlatformUser; passwordHash: string }> = {
  'admin@samadhan.in': {
    user: { id: 'plt-001', name: 'Sanskar Vyas', email: 'admin@samadhan.in', role: 'platform_owner' },
    passwordHash: 'samadhan',
  },
  'support@samadhan.in': {
    user: { id: 'plt-002', name: 'Anita Sharma', email: 'support@samadhan.in', role: 'platform_support' },
    passwordHash: 'samadhan',
  },
};

const AuthContext = createContext<AuthContextType | null>(null);

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

function loadStoredSession(): PlatformUser | null {
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

function saveSession(user: PlatformUser): void {
  const session: AuthSession = { user, expiresAt: Date.now() + SESSION_TIMEOUT_MS };
  try {
    localStorage.setItem(AUTH_KEY, JSON.stringify(session));
  } catch { /* noop */ }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PlatformUser | null>(() => loadStoredSession());
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

  const login = useCallback((email: string, password: string): { ok: boolean; error?: string } => {
    const attempts = getLoginAttempts();
    if (attempts.lockedUntil && Date.now() < attempts.lockedUntil) {
      const remainSec = Math.ceil((attempts.lockedUntil - Date.now()) / 1000);
      return { ok: false, error: `Account locked. Try again in ${remainSec}s.` };
    }

    const entry = VALID_USERS[email.toLowerCase().trim()];
    if (!entry || password !== entry.passwordHash) {
      const newCount = (attempts.lockedUntil && Date.now() >= attempts.lockedUntil ? 0 : attempts.count) + 1;
      const locked = newCount >= MAX_LOGIN_ATTEMPTS ? Date.now() + LOCKOUT_DURATION_MS : null;
      setLoginAttempts({ count: newCount, lockedUntil: locked });
      if (locked) {
        return { ok: false, error: `Too many failed attempts. Account locked for 5 minutes.` };
      }
      return { ok: false, error: `Invalid credentials. ${MAX_LOGIN_ATTEMPTS - newCount} attempts remaining.` };
    }

    setLoginAttempts({ count: 0, lockedUntil: null });
    setUser(entry.user);
    saveSession(entry.user);
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(AUTH_KEY);
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

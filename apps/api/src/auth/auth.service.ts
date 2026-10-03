import { Injectable, UnauthorizedException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

interface UserRecord {
  id: string;
  tenantId: string;
  tenantName: string;
  name: string;
  phone: string;
  email: string | null;
  language: string;
  roles: Array<{
    roleId: string;
    roleName: string;
    scopes: Array<{ type: string; ids?: string[] }>;
  }>;
  permissions: string[];
}

const DEMO_USERS: UserRecord[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    tenantId: '00000000-0000-0000-0000-000000000010',
    tenantName: 'Demo Nagar Nigam',
    name: 'Admin User',
    phone: '9999999999',
    email: 'admin@demo.samadhan.in',
    language: 'en',
    roles: [{ roleId: 'r1', roleName: 'tenant_admin', scopes: [{ type: 'tenant' }] }],
    permissions: ['case.read', 'case.create', 'case.assign', 'config.geography.write', 'config.catalogue.write', 'config.workflow.write', 'config.settings.write', 'user.manage', 'role.manage', 'report.view', 'audit.view'],
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    tenantId: '00000000-0000-0000-0000-000000000010',
    tenantName: 'Demo Nagar Nigam',
    name: 'JE Ramesh Sharma',
    phone: '9888888888',
    email: null,
    language: 'hi',
    roles: [{ roleId: 'r2', roleName: 'officer', scopes: [{ type: 'node_subtree', ids: ['zone-1'] }] }],
    permissions: ['case.read', 'case.create', 'case.assign', 'case.atr.submit', 'case.atr.verify', 'report.view'],
  },
];

const otpStore = new Map<string, string>();
const sessionStore = new Map<string, UserRecord>();

@Injectable()
export class AuthService {
  sendOtp(phone: string): { message: string } {
    const otp = '123456';
    otpStore.set(phone, otp);
    return { message: 'OTP sent successfully' };
  }

  verifyOtp(phone: string, otp: string): { accessToken: string; refreshToken: string; expiresIn: number } {
    const storedOtp = otpStore.get(phone);
    if (!storedOtp || storedOtp !== otp) {
      throw new UnauthorizedException('Invalid OTP');
    }
    otpStore.delete(phone);

    const user = DEMO_USERS.find(u => u.phone === phone);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const accessToken = randomUUID();
    const refreshToken = randomUUID();
    sessionStore.set(accessToken, user);
    sessionStore.set(refreshToken, user);

    return { accessToken, refreshToken, expiresIn: 900 };
  }

  validateToken(token: string): UserRecord | null {
    return sessionStore.get(token) ?? null;
  }

  getMe(token: string): UserRecord {
    const user = sessionStore.get(token);
    if (!user) {
      throw new UnauthorizedException('Invalid session');
    }
    return user;
  }

  refresh(refreshToken: string): { accessToken: string; refreshToken: string; expiresIn: number } {
    const user = sessionStore.get(refreshToken);
    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    sessionStore.delete(refreshToken);

    const newAccess = randomUUID();
    const newRefresh = randomUUID();
    sessionStore.set(newAccess, user);
    sessionStore.set(newRefresh, user);

    return { accessToken: newAccess, refreshToken: newRefresh, expiresIn: 900 };
  }

  logout(token: string): void {
    sessionStore.delete(token);
  }
}

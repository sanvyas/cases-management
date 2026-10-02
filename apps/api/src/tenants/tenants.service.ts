import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

interface TenantRecord {
  id: string;
  name: string;
  slug: string;
  status: string;
  planId: string;
  planName: string;
  timezone: string;
  defaultLanguage: string;
  enabledLanguages: string[];
  createdAt: string;
}

const DEMO_TENANTS: TenantRecord[] = [
  {
    id: '00000000-0000-0000-0000-000000000010',
    name: 'Demo Nagar Nigam',
    slug: 'demo-nagar-nigam',
    status: 'active',
    planId: 'plan-standard',
    planName: 'Standard',
    timezone: 'Asia/Kolkata',
    defaultLanguage: 'hi',
    enabledLanguages: ['en', 'hi'],
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000020',
    name: 'Demo Zila Parishad',
    slug: 'demo-zila-parishad',
    status: 'active',
    planId: 'plan-premium',
    planName: 'Premium',
    timezone: 'Asia/Kolkata',
    defaultLanguage: 'hi',
    enabledLanguages: ['en', 'hi'],
    createdAt: '2026-02-01T00:00:00.000Z',
  },
];

@Injectable()
export class TenantsService {
  private tenants = [...DEMO_TENANTS];

  list(): TenantRecord[] {
    return this.tenants;
  }

  getById(id: string): TenantRecord {
    const t = this.tenants.find(t => t.id === id);
    if (!t) throw new NotFoundException('Tenant not found');
    return t;
  }

  getBySlug(slug: string): TenantRecord {
    const t = this.tenants.find(t => t.slug === slug);
    if (!t) throw new NotFoundException('Tenant not found');
    return t;
  }

  create(data: { name: string; slug: string; planId: string; timezone?: string; defaultLanguage?: string }): TenantRecord {
    const tenant: TenantRecord = {
      id: randomUUID(),
      name: data.name,
      slug: data.slug,
      status: 'active',
      planId: data.planId,
      planName: 'Standard',
      timezone: data.timezone ?? 'Asia/Kolkata',
      defaultLanguage: data.defaultLanguage ?? 'hi',
      enabledLanguages: ['en', 'hi'],
      createdAt: new Date().toISOString(),
    };
    this.tenants.push(tenant);
    return tenant;
  }
}

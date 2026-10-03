import type { EnvironmentConfig } from './types';
import type { Tenant } from './types';
import { TENANTS, TENANT_CONFIGS, getDefaultConfig } from './data/mockData';

const PLATFORM_CONFIG_KEY = 'samadhan_platform_config';

export interface DeployedTenantConfig {
  tenant: {
    id: string;
    name: string;
    slug: string;
    type: string;
    casePrefix: string;
    state: string;
    timezone: string;
    defaultLanguage: string;
    enabledLanguages: string[];
    planName: string;
    contactName: string;
    contactEmail: string;
  };
  config: EnvironmentConfig;
  deployedAt: string;
}

export function deployConfig(tenant: Tenant, config: EnvironmentConfig): void {
  const deployed: DeployedTenantConfig = {
    tenant: {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      type: tenant.type,
      casePrefix: tenant.casePrefix,
      state: tenant.state,
      timezone: tenant.timezone,
      defaultLanguage: tenant.defaultLanguage,
      enabledLanguages: tenant.enabledLanguages,
      planName: tenant.planName,
      contactName: tenant.contactName,
      contactEmail: tenant.contactEmail,
    },
    config,
    deployedAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(PLATFORM_CONFIG_KEY, JSON.stringify(deployed));
  } catch { /* storage full */ }
}

export function getDeployedConfig(): DeployedTenantConfig | null {
  try {
    const raw = localStorage.getItem(PLATFORM_CONFIG_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DeployedTenantConfig;
  } catch {
    return null;
  }
}

export function seedDefaultConfig(): void {
  if (getDeployedConfig()) return;
  const tenant = TENANTS.find(t => t.id === 'env-ayodhya-npp')!;
  const config = TENANT_CONFIGS['env-ayodhya-npp'] || getDefaultConfig();
  deployConfig(tenant, config);
}

import type { EnvironmentConfig } from './types';
import type { Tenant } from './types';
import { TENANTS, TENANT_CONFIGS, getDefaultConfig } from './data/mockData';

const PLATFORM_CONFIG_KEY = 'samadhan_platform_config';
const TENANT_CONFIGS_KEY = 'samadhan_tenant_configs';
const AUDIT_LOG_KEY = 'samadhan_audit_log';

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

export interface AuditEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  tenantId: string;
  tenantName: string;
  action: 'config_change' | 'deploy' | 'module_toggle' | 'role_toggle';
  section: string;
  field: string;
  oldValue: string;
  newValue: string;
}

// ── Per-tenant config persistence ───────────────────────────────────

function getAllTenantConfigs(): Record<string, EnvironmentConfig> {
  try {
    const raw = localStorage.getItem(TENANT_CONFIGS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, EnvironmentConfig>;
  } catch {
    return {};
  }
}

function saveTenantConfigs(configs: Record<string, EnvironmentConfig>): void {
  try {
    localStorage.setItem(TENANT_CONFIGS_KEY, JSON.stringify(configs));
  } catch { /* storage full */ }
}

export function getTenantConfig(envId: string): EnvironmentConfig {
  const saved = getAllTenantConfigs();
  if (saved[envId]) return saved[envId]!;
  return TENANT_CONFIGS[envId] || getDefaultConfig();
}

export function saveTenantConfig(envId: string, config: EnvironmentConfig): void {
  const all = getAllTenantConfigs();
  all[envId] = config;
  saveTenantConfigs(all);
}

// ── Cross-app deploy ────────────────────────────────────────────────

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

  saveTenantConfig(tenant.id, config);
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

// ── Audit Log ───────────────────────────────────────────────────────

export function getAuditLog(): AuditEntry[] {
  try {
    const raw = localStorage.getItem(AUDIT_LOG_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as AuditEntry[];
  } catch {
    return [];
  }
}

function saveAuditLog(entries: AuditEntry[]): void {
  try {
    localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(entries));
  } catch { /* storage full */ }
}

export function addAuditEntry(entry: Omit<AuditEntry, 'id' | 'timestamp'>): void {
  const log = getAuditLog();
  log.unshift({
    ...entry,
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
  });
  // keep last 500 entries
  if (log.length > 500) log.length = 500;
  saveAuditLog(log);
}

export function addConfigChangeEntries(
  user: { id: string; name: string },
  tenant: { id: string; name: string },
  section: string,
  changes: Array<{ field: string; oldValue: string; newValue: string }>
): void {
  for (const change of changes) {
    addAuditEntry({
      userId: user.id,
      userName: user.name,
      tenantId: tenant.id,
      tenantName: tenant.name,
      action: 'config_change',
      section,
      field: change.field,
      oldValue: change.oldValue,
      newValue: change.newValue,
    });
  }
}

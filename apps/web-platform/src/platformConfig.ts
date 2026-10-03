import type { EnvironmentConfig, Tenant } from './types';
import { TENANTS as SEED_TENANTS, TENANT_CONFIGS, getDefaultConfig, PLANS } from './data/mockData';

const PLATFORM_CONFIG_KEY = 'samadhan_platform_config';
const TENANT_CONFIGS_KEY = 'samadhan_tenant_configs';
const TENANTS_KEY = 'samadhan_tenants';
const AUDIT_LOG_KEY = 'samadhan_audit_log';

// ── Dynamic tenant store ───────────────────────────────────────────

function loadTenants(): Tenant[] {
  try {
    const raw = localStorage.getItem(TENANTS_KEY);
    if (raw) return JSON.parse(raw) as Tenant[];
  } catch { /* corrupted */ }
  return [];
}

function saveTenants(tenants: Tenant[]): void {
  try {
    localStorage.setItem(TENANTS_KEY, JSON.stringify(tenants));
  } catch { /* storage full */ }
}

export function seedTenants(): void {
  if (loadTenants().length > 0) return;
  saveTenants(SEED_TENANTS);
}

export function getAllTenants(): Tenant[] {
  const tenants = loadTenants();
  if (tenants.length === 0) {
    saveTenants(SEED_TENANTS);
    return [...SEED_TENANTS];
  }
  return tenants;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 40);
}

function generateCasePrefix(name: string): string {
  const words = name.replace(/[^a-zA-Z\s]/g, '').trim().split(/\s+/);
  if (words.length >= 2) {
    return words
      .filter(w => w.length > 1)
      .map(w => w[0]!.toUpperCase())
      .slice(0, 3)
      .join('');
  }
  return name.slice(0, 3).toUpperCase();
}

const BODY_TYPE_LABELS: Record<string, string> = {
  nagar_nigam: 'Nagar Nigam',
  nagar_palika: 'Nagar Palika',
  nagar_panchayat: 'Nagar Panchayat',
  zila_parishad: 'Zila Parishad',
  block: 'Block',
  gram_panchayat: 'Gram Panchayat',
  development_authority: 'Dev. Authority',
  smart_city: 'Smart City SPV',
};

const BODY_TYPE_SUFFIX: Record<string, string> = {
  nagar_nigam: 'nnn',
  nagar_palika: 'npp',
  nagar_panchayat: 'np',
  zila_parishad: 'zp',
  block: 'blk',
  gram_panchayat: 'gp',
  development_authority: 'da',
  smart_city: 'sc',
};

export function addTenant(data: {
  name: string;
  bodyType: string;
  state: string;
  contactName: string;
  contactEmail: string;
  planId: string;
}): Tenant {
  const plan = PLANS.find(p => p.id === data.planId) || PLANS[0]!;
  const slug = generateSlug(data.name) + '-' + (BODY_TYPE_SUFFIX[data.bodyType] || 'env');
  const id = `env-${slug}-${Date.now().toString(36)}`;
  const casePrefix = generateCasePrefix(data.name);

  const tenant: Tenant = {
    id,
    name: data.name,
    slug,
    type: BODY_TYPE_LABELS[data.bodyType] || data.bodyType,
    status: 'trial',
    planId: data.planId,
    planName: plan.name,
    region: 'ap-south-1',
    state: data.state || 'Uttar Pradesh',
    timezone: 'Asia/Kolkata',
    defaultLanguage: 'hi',
    enabledLanguages: ['hi', 'en'],
    createdAt: new Date().toISOString(),
    casePrefix,
    contactName: data.contactName || '',
    contactPhone: '',
    contactEmail: data.contactEmail || '',
    totalCases: 0,
    activeCases: 0,
    staffCount: 0,
    citizenCount: 0,
    monthlyRevenue: 0,
    monthlyCost: plan.monthlyPrice * 0.6,
  };

  const tenants = getAllTenants();
  tenants.push(tenant);
  saveTenants(tenants);

  const config = getDefaultConfig();
  const moduleKeys = plan.modules;
  for (const key of moduleKeys) {
    if (key in config.features.modules) {
      config.features.modules[key] = true;
    }
  }
  saveTenantConfig(id, config);

  return tenant;
}

export function updateTenant(id: string, updates: Partial<Tenant>): void {
  const tenants = getAllTenants();
  const idx = tenants.findIndex(t => t.id === id);
  if (idx === -1) return;
  tenants[idx] = { ...tenants[idx]!, ...updates, id };
  saveTenants(tenants);
}

export function removeTenant(id: string): void {
  const tenants = getAllTenants().filter(t => t.id !== id);
  saveTenants(tenants);
}

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
  seedTenants();
  if (getDeployedConfig()) return;
  const tenants = getAllTenants();
  const tenant = tenants.find(t => t.id === 'env-ayodhya-npp')!;
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

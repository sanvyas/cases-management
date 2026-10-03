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
  config: {
    branding: {
      primaryColor: string;
      headerText: string;
      footerText: string;
      helplineNumber: string;
      supportEmail: string;
      logoUrl: string;
      faviconUrl: string;
      customDomain: string;
    };
    features: {
      modules: Record<string, boolean>;
      roles: Array<{
        key: string;
        name: string;
        enabled: boolean;
        permissions: string[];
      }>;
    };
    security: {
      staff2faRequired: boolean;
      sessionTimeoutMinutes: number;
      ssoEnabled: boolean;
      passwordPolicy: string;
    };
    communications: {
      whatsappEnabled: boolean;
      smsEnabled: boolean;
      emailEnabled: boolean;
      telephonyEnabled: boolean;
    };
    ai: {
      autoRouting: boolean;
    };
  };
  deployedAt: string;
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

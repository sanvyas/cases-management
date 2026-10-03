const PLATFORM_CONFIG_KEY = 'samadhan_platform_config';

export interface DeployedTenantConfig {
  tenant: {
    id: string;
    name: string;
    slug: string;
    type: string;
    casePrefix: string;
    state: string;
    defaultLanguage: string;
    enabledLanguages: string[];
  };
  config: {
    branding: {
      primaryColor: string;
      headerText: string;
      helplineNumber: string;
      supportEmail: string;
    };
    features: {
      modules: Record<string, boolean>;
    };
    communications: {
      whatsappEnabled: boolean;
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

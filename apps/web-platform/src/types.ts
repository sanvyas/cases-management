export type TenantStatus = 'active' | 'suspended' | 'trial' | 'offboarded';

export type PlanTier = 'basic' | 'standard' | 'premium' | 'enterprise';

export interface Plan {
  id: string;
  name: string;
  tier: PlanTier;
  modules: string[];
  limits: Record<string, number>;
  monthlyPrice: number;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  type: string;
  status: TenantStatus;
  planId: string;
  planName: string;
  region: string;
  state: string;
  timezone: string;
  defaultLanguage: string;
  enabledLanguages: string[];
  createdAt: string;
  casePrefix: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  totalCases: number;
  activeCases: number;
  staffCount: number;
  citizenCount: number;
  monthlyRevenue: number;
  monthlyCost: number;
}

export interface EnvironmentConfig {
  cloud: CloudConfig;
  ai: AIConfig;
  communications: CommsConfig;
  features: FeatureConfig;
  security: SecurityConfig;
  branding: BrandingConfig;
}

export interface CloudConfig {
  provider: string;
  region: string;
  instanceType: string;
  dbType: string;
  dbSize: string;
  storageGB: number;
  cdnEnabled: boolean;
  backupFrequency: string;
  sslCertAuto: boolean;
}

export interface AIConfig {
  sttProvider: string;
  sttModel: string;
  ttsProvider: string;
  ttsVoice: string;
  llmProvider: string;
  llmModel: string;
  confidenceThreshold: number;
  maxTurns: number;
  autoRouting: boolean;
}

export interface CommsConfig {
  whatsappEnabled: boolean;
  whatsappBusinessId: string;
  whatsappPhoneNumber: string;
  whatsappProvider: string;
  smsEnabled: boolean;
  smsSenderId: string;
  smsDltEntityId: string;
  smsProvider: string;
  emailEnabled: boolean;
  emailSender: string;
  emailProvider: string;
  telephonyEnabled: boolean;
  telephonyProvider: string;
  telephonyNumber: string;
  pushEnabled: boolean;
}

export interface FeatureConfig {
  modules: Record<string, boolean>;
  roles: RoleConfig[];
}

export interface RoleConfig {
  key: string;
  name: string;
  enabled: boolean;
  permissions: string[];
}

export interface SecurityConfig {
  staff2faRequired: boolean;
  sessionTimeoutMinutes: number;
  ipAllowlist: string[];
  ssoEnabled: boolean;
  ssoProvider: string;
  passwordPolicy: string;
  auditRetentionDays: number;
}

export interface BrandingConfig {
  logoUrl: string;
  faviconUrl: string;
  primaryColor: string;
  headerText: string;
  footerText: string;
  helplineNumber: string;
  supportEmail: string;
  customDomain: string;
}

export interface UsageMetric {
  date: string;
  cases: number;
  voiceSessions: number;
  whatsappMessages: number;
  smsCount: number;
  apiCalls: number;
  storageGB: number;
}

export interface CostBreakdown {
  category: string;
  item: string;
  amount: number;
  unit: string;
}

export interface PlatformUser {
  id: string;
  name: string;
  email: string;
  role: 'platform_owner' | 'platform_support' | 'platform_finance';
}

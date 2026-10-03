import { useState, useMemo, useRef } from 'react';
import {
  getUsageData,
  getCostBreakdown,
  MODULE_LABELS,
  STATUS_STYLES,
} from '../data/mockData';
import { deployConfig, getTenantConfig, saveTenantConfig, addAuditEntry, addConfigChangeEntries, getAllTenants } from '../platformConfig';
import { useAuth } from '../auth';
import type { EnvironmentConfig } from '../types';

interface Props {
  envId: string;
  onBack: () => void;
  onTenantsChanged?: () => void;
}

const CONFIG_GROUPS = [
  { key: 'overview', label: 'Overview', icon: 'info' },
  { key: 'cloud', label: 'Cloud & Infra', icon: 'cloud' },
  { key: 'ai', label: 'AI & Voice', icon: 'psychology' },
  { key: 'comms', label: 'Communications', icon: 'forum' },
  { key: 'features', label: 'Features & Modules', icon: 'extension' },
  { key: 'roles', label: 'Roles & Permissions', icon: 'admin_panel_settings' },
  { key: 'security', label: 'Security', icon: 'shield' },
  { key: 'branding', label: 'Branding', icon: 'palette' },
  { key: 'usage', label: 'Usage & Analytics', icon: 'analytics' },
  { key: 'costs', label: 'Cost Breakdown', icon: 'payments' },
];

// ── Real-world option lists ──────────────────────────────────────────

const CLOUD_PROVIDERS = [
  { value: 'AWS', label: 'Amazon Web Services (AWS)' },
  { value: 'GCP', label: 'Google Cloud Platform (GCP)' },
  { value: 'Azure', label: 'Microsoft Azure' },
  { value: 'DigitalOcean', label: 'DigitalOcean' },
];

const AWS_REGIONS = [
  { value: 'ap-south-1', label: 'Asia Pacific — Mumbai (ap-south-1)' },
  { value: 'ap-south-2', label: 'Asia Pacific — Hyderabad (ap-south-2)' },
  { value: 'ap-southeast-1', label: 'Asia Pacific — Singapore (ap-southeast-1)' },
  { value: 'ap-southeast-2', label: 'Asia Pacific — Sydney (ap-southeast-2)' },
  { value: 'us-east-1', label: 'US East — N. Virginia (us-east-1)' },
  { value: 'eu-west-1', label: 'Europe — Ireland (eu-west-1)' },
];

const GCP_REGIONS = [
  { value: 'asia-south1', label: 'Asia South — Mumbai (asia-south1)' },
  { value: 'asia-south2', label: 'Asia South — Delhi (asia-south2)' },
  { value: 'asia-southeast1', label: 'Asia Southeast — Singapore (asia-southeast1)' },
  { value: 'us-central1', label: 'US Central — Iowa (us-central1)' },
  { value: 'europe-west1', label: 'Europe West — Belgium (europe-west1)' },
];

const AZURE_REGIONS = [
  { value: 'centralindia', label: 'Central India — Pune (centralindia)' },
  { value: 'southindia', label: 'South India — Chennai (southindia)' },
  { value: 'westindia', label: 'West India — Mumbai (westindia)' },
  { value: 'southeastasia', label: 'Southeast Asia — Singapore (southeastasia)' },
  { value: 'eastus', label: 'East US — Virginia (eastus)' },
];

const DO_REGIONS = [
  { value: 'blr1', label: 'Bangalore (blr1)' },
  { value: 'sgp1', label: 'Singapore (sgp1)' },
  { value: 'nyc1', label: 'New York (nyc1)' },
];

function getRegionsForProvider(provider: string) {
  switch (provider) {
    case 'GCP': return GCP_REGIONS;
    case 'Azure': return AZURE_REGIONS;
    case 'DigitalOcean': return DO_REGIONS;
    default: return AWS_REGIONS;
  }
}

const AWS_INSTANCES = [
  { value: 't3.micro', label: 't3.micro — 2 vCPU, 1 GB' },
  { value: 't3.small', label: 't3.small — 2 vCPU, 2 GB' },
  { value: 't3.medium', label: 't3.medium — 2 vCPU, 4 GB' },
  { value: 't3.large', label: 't3.large — 2 vCPU, 8 GB' },
  { value: 'c6i.xlarge', label: 'c6i.xlarge — 4 vCPU, 8 GB' },
  { value: 'c6i.2xlarge', label: 'c6i.2xlarge — 8 vCPU, 16 GB' },
  { value: 'r6i.large', label: 'r6i.large — 2 vCPU, 16 GB (Memory)' },
  { value: 'r6i.xlarge', label: 'r6i.xlarge — 4 vCPU, 32 GB (Memory)' },
];

const GCP_INSTANCES = [
  { value: 'e2-micro', label: 'e2-micro — 0.25 vCPU, 1 GB' },
  { value: 'e2-small', label: 'e2-small — 0.5 vCPU, 2 GB' },
  { value: 'e2-medium', label: 'e2-medium — 1 vCPU, 4 GB' },
  { value: 'e2-standard-2', label: 'e2-standard-2 — 2 vCPU, 8 GB' },
  { value: 'e2-standard-4', label: 'e2-standard-4 — 4 vCPU, 16 GB' },
  { value: 'n2-standard-2', label: 'n2-standard-2 — 2 vCPU, 8 GB' },
  { value: 'n2-standard-4', label: 'n2-standard-4 — 4 vCPU, 16 GB' },
];

const AZURE_INSTANCES = [
  { value: 'B1s', label: 'B1s — 1 vCPU, 1 GB' },
  { value: 'B2s', label: 'B2s — 2 vCPU, 4 GB' },
  { value: 'B2ms', label: 'B2ms — 2 vCPU, 8 GB' },
  { value: 'D2s_v5', label: 'D2s_v5 — 2 vCPU, 8 GB' },
  { value: 'D4s_v5', label: 'D4s_v5 — 4 vCPU, 16 GB' },
  { value: 'D8s_v5', label: 'D8s_v5 — 8 vCPU, 32 GB' },
];

const DO_INSTANCES = [
  { value: 's-1vcpu-1gb', label: 'Basic — 1 vCPU, 1 GB' },
  { value: 's-2vcpu-2gb', label: 'Basic — 2 vCPU, 2 GB' },
  { value: 's-2vcpu-4gb', label: 'Basic — 2 vCPU, 4 GB' },
  { value: 's-4vcpu-8gb', label: 'Basic — 4 vCPU, 8 GB' },
  { value: 'g-2vcpu-8gb', label: 'General Purpose — 2 vCPU, 8 GB' },
];

function getInstancesForProvider(provider: string) {
  switch (provider) {
    case 'GCP': return GCP_INSTANCES;
    case 'Azure': return AZURE_INSTANCES;
    case 'DigitalOcean': return DO_INSTANCES;
    default: return AWS_INSTANCES;
  }
}

const DB_TYPES: Record<string, Array<{ value: string; label: string }>> = {
  AWS: [
    { value: 'RDS PostgreSQL', label: 'Amazon RDS — PostgreSQL' },
    { value: 'RDS MySQL', label: 'Amazon RDS — MySQL' },
    { value: 'Aurora PostgreSQL', label: 'Amazon Aurora — PostgreSQL' },
    { value: 'Aurora MySQL', label: 'Amazon Aurora — MySQL' },
  ],
  GCP: [
    { value: 'Cloud SQL PostgreSQL', label: 'Cloud SQL — PostgreSQL' },
    { value: 'Cloud SQL MySQL', label: 'Cloud SQL — MySQL' },
    { value: 'AlloyDB PostgreSQL', label: 'AlloyDB — PostgreSQL' },
  ],
  Azure: [
    { value: 'Azure PostgreSQL Flexible', label: 'Azure Database — PostgreSQL Flexible Server' },
    { value: 'Azure MySQL Flexible', label: 'Azure Database — MySQL Flexible Server' },
    { value: 'Azure SQL Database', label: 'Azure SQL Database' },
  ],
  DigitalOcean: [
    { value: 'DO Managed PostgreSQL', label: 'Managed Database — PostgreSQL' },
    { value: 'DO Managed MySQL', label: 'Managed Database — MySQL' },
  ],
};

const DB_SIZES: Record<string, Array<{ value: string; label: string }>> = {
  AWS: [
    { value: 'db.t3.micro', label: 'db.t3.micro — 2 vCPU, 1 GB, 20 GB SSD' },
    { value: 'db.t3.small', label: 'db.t3.small — 2 vCPU, 2 GB, 50 GB SSD' },
    { value: 'db.t3.medium', label: 'db.t3.medium — 2 vCPU, 4 GB, 100 GB SSD' },
    { value: 'db.r6g.large', label: 'db.r6g.large — 2 vCPU, 16 GB, 200 GB SSD' },
    { value: 'db.r6g.xlarge', label: 'db.r6g.xlarge — 4 vCPU, 32 GB, 500 GB SSD' },
  ],
  GCP: [
    { value: 'db-f1-micro', label: 'db-f1-micro — Shared, 0.6 GB' },
    { value: 'db-g1-small', label: 'db-g1-small — Shared, 1.7 GB' },
    { value: 'db-custom-2-4096', label: 'Custom — 2 vCPU, 4 GB' },
    { value: 'db-custom-4-8192', label: 'Custom — 4 vCPU, 8 GB' },
    { value: 'db-custom-8-16384', label: 'Custom — 8 vCPU, 16 GB' },
  ],
  Azure: [
    { value: 'B_Standard_B1ms', label: 'Burstable B1ms — 1 vCPU, 2 GB' },
    { value: 'B_Standard_B2s', label: 'Burstable B2s — 2 vCPU, 4 GB' },
    { value: 'GP_Standard_D2ds_v4', label: 'General Purpose D2ds — 2 vCPU, 8 GB' },
    { value: 'GP_Standard_D4ds_v4', label: 'General Purpose D4ds — 4 vCPU, 16 GB' },
  ],
  DigitalOcean: [
    { value: 'db-s-1vcpu-1gb', label: '1 vCPU, 1 GB, 10 GB SSD' },
    { value: 'db-s-1vcpu-2gb', label: '1 vCPU, 2 GB, 25 GB SSD' },
    { value: 'db-s-2vcpu-4gb', label: '2 vCPU, 4 GB, 38 GB SSD' },
    { value: 'db-s-4vcpu-8gb', label: '4 vCPU, 8 GB, 115 GB SSD' },
  ],
};

const BACKUP_FREQUENCIES = [
  { value: 'hourly', label: 'Every Hour' },
  { value: 'every_6h', label: 'Every 6 Hours' },
  { value: 'every_12h', label: 'Every 12 Hours' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
];

const STT_PROVIDERS = [
  { value: 'Browser Native', label: 'Browser Native (Web Speech API)' },
  { value: 'Google Cloud STT', label: 'Google Cloud Speech-to-Text' },
  { value: 'Deepgram', label: 'Deepgram' },
  { value: 'Azure Speech', label: 'Azure Cognitive Services Speech' },
  { value: 'AWS Transcribe', label: 'Amazon Transcribe' },
  { value: 'Whisper (OpenAI)', label: 'OpenAI Whisper' },
  { value: 'Bhashini', label: 'Bhashini (MeitY/IIITH)' },
];

const STT_MODELS: Record<string, Array<{ value: string; label: string }>> = {
  'Browser Native': [
    { value: 'Web Speech API', label: 'Web Speech API (Default)' },
  ],
  'Google Cloud STT': [
    { value: 'latest_long', label: 'Latest Long — Best accuracy' },
    { value: 'latest_short', label: 'Latest Short — Fast response' },
    { value: 'chirp', label: 'Chirp — Multilingual (100+ langs)' },
    { value: 'chirp_2', label: 'Chirp 2 — Enhanced multilingual' },
    { value: 'telephony', label: 'Telephony — Optimised for phone audio' },
  ],
  'Deepgram': [
    { value: 'nova-2', label: 'Nova-2 — Highest accuracy' },
    { value: 'nova-2-general', label: 'Nova-2 General' },
    { value: 'nova-2-phonecall', label: 'Nova-2 Phone Call' },
    { value: 'enhanced', label: 'Enhanced' },
    { value: 'base', label: 'Base' },
  ],
  'Azure Speech': [
    { value: 'hi-IN', label: 'Hindi (India) — hi-IN' },
    { value: 'en-IN', label: 'English (India) — en-IN' },
    { value: 'whisper', label: 'Whisper model via Azure' },
  ],
  'AWS Transcribe': [
    { value: 'standard', label: 'Standard' },
    { value: 'medical', label: 'Medical' },
  ],
  'Whisper (OpenAI)': [
    { value: 'whisper-1', label: 'Whisper v1' },
    { value: 'whisper-large-v3', label: 'Whisper Large v3' },
  ],
  'Bhashini': [
    { value: 'bhashini-hi', label: 'Hindi ASR' },
    { value: 'bhashini-multi', label: 'Multilingual ASR' },
  ],
};

const TTS_PROVIDERS = [
  { value: 'Google Cloud TTS', label: 'Google Cloud Text-to-Speech' },
  { value: 'Azure TTS', label: 'Azure Cognitive Services TTS' },
  { value: 'AWS Polly', label: 'Amazon Polly' },
  { value: 'ElevenLabs', label: 'ElevenLabs' },
  { value: 'Bhashini TTS', label: 'Bhashini TTS (MeitY/IIITH)' },
];

const TTS_VOICES: Record<string, Array<{ value: string; label: string }>> = {
  'Google Cloud TTS': [
    { value: 'hi-IN-Wavenet-A', label: 'Hindi Female — Wavenet-A' },
    { value: 'hi-IN-Wavenet-B', label: 'Hindi Male — Wavenet-B' },
    { value: 'hi-IN-Wavenet-C', label: 'Hindi Female — Wavenet-C' },
    { value: 'hi-IN-Wavenet-D', label: 'Hindi Male — Wavenet-D' },
    { value: 'hi-IN-Neural2-A', label: 'Hindi Female — Neural2-A' },
    { value: 'hi-IN-Neural2-B', label: 'Hindi Male — Neural2-B' },
    { value: 'en-IN-Wavenet-A', label: 'English (India) Female — Wavenet-A' },
    { value: 'en-IN-Wavenet-B', label: 'English (India) Male — Wavenet-B' },
  ],
  'Azure TTS': [
    { value: 'hi-IN-SwaraNeural', label: 'Hindi Female — Swara' },
    { value: 'hi-IN-MadhurNeural', label: 'Hindi Male — Madhur' },
    { value: 'en-IN-NeerjaNeural', label: 'English (India) Female — Neerja' },
    { value: 'en-IN-PrabhatNeural', label: 'English (India) Male — Prabhat' },
  ],
  'AWS Polly': [
    { value: 'Aditi', label: 'Hindi/English (India) Female — Aditi' },
    { value: 'Kajal', label: 'Hindi/English (India) Female — Kajal (Neural)' },
  ],
  'ElevenLabs': [
    { value: 'eleven_multilingual_v2', label: 'Multilingual v2 — Default' },
    { value: 'eleven_turbo_v2_5', label: 'Turbo v2.5 — Low latency' },
  ],
  'Bhashini TTS': [
    { value: 'bhashini-hi-female', label: 'Hindi Female' },
    { value: 'bhashini-hi-male', label: 'Hindi Male' },
  ],
};

const LLM_PROVIDERS = [
  { value: 'Anthropic', label: 'Anthropic (Claude)' },
  { value: 'OpenAI', label: 'OpenAI (GPT)' },
  { value: 'Google', label: 'Google (Gemini)' },
  { value: 'Azure OpenAI', label: 'Azure OpenAI Service' },
  { value: 'Sarvam AI', label: 'Sarvam AI (Indic)' },
];

const LLM_MODELS: Record<string, Array<{ value: string; label: string }>> = {
  'Anthropic': [
    { value: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4' },
    { value: 'claude-opus-4-20250514', label: 'Claude Opus 4' },
    { value: 'claude-haiku-4-20250514', label: 'Claude Haiku 4 (Fast)' },
  ],
  'OpenAI': [
    { value: 'gpt-4o', label: 'GPT-4o' },
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini (Fast)' },
    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
  ],
  'Google': [
    { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
    { value: 'gemini-2.0-pro', label: 'Gemini 2.0 Pro' },
    { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
  ],
  'Azure OpenAI': [
    { value: 'gpt-4o (Azure)', label: 'GPT-4o (Azure-hosted)' },
    { value: 'gpt-4o-mini (Azure)', label: 'GPT-4o Mini (Azure-hosted)' },
  ],
  'Sarvam AI': [
    { value: 'saaras-v2', label: 'Saaras v2 — Indic multilingual' },
    { value: 'saarika-v1', label: 'Saarika v1 — Hindi specialist' },
  ],
};

const WHATSAPP_PROVIDERS = [
  { value: 'Meta Cloud API', label: 'Meta Cloud API (Official)' },
  { value: 'Gupshup', label: 'Gupshup' },
  { value: 'Twilio', label: 'Twilio for WhatsApp' },
  { value: 'Wati', label: 'Wati' },
  { value: 'Interakt', label: 'Interakt' },
];

const SMS_PROVIDERS = [
  { value: 'MSG91', label: 'MSG91' },
  { value: 'Twilio', label: 'Twilio' },
  { value: 'Kaleyra', label: 'Kaleyra' },
  { value: 'Textlocal', label: 'Textlocal' },
  { value: 'Gupshup SMS', label: 'Gupshup SMS' },
  { value: 'Pinnacle', label: 'Pinnacle Teleservices' },
];

const EMAIL_PROVIDERS = [
  { value: 'Amazon SES', label: 'Amazon SES' },
  { value: 'SendGrid', label: 'Twilio SendGrid' },
  { value: 'Mailgun', label: 'Mailgun' },
  { value: 'Postmark', label: 'Postmark' },
  { value: 'SMTP', label: 'Custom SMTP Server' },
];

const TELEPHONY_PROVIDERS = [
  { value: 'Exotel', label: 'Exotel' },
  { value: 'Knowlarity', label: 'Knowlarity' },
  { value: 'Ozonetel', label: 'Ozonetel' },
  { value: 'MyOperator', label: 'MyOperator' },
  { value: 'Twilio Voice', label: 'Twilio Voice' },
  { value: 'Servetel', label: 'Servetel' },
];

const SSO_PROVIDERS = [
  { value: '', label: 'None' },
  { value: 'Google Workspace', label: 'Google Workspace' },
  { value: 'Microsoft Entra ID', label: 'Microsoft Entra ID (Azure AD)' },
  { value: 'Okta', label: 'Okta' },
  { value: 'OneLogin', label: 'OneLogin' },
  { value: 'SAML 2.0', label: 'Custom SAML 2.0' },
];

const PASSWORD_POLICIES = [
  { value: 'basic', label: 'Basic — 8+ characters' },
  { value: 'standard', label: 'Standard — 8+ chars, mixed case, number' },
  { value: 'strong', label: 'Strong — 12+ chars, mixed case, number, symbol' },
  { value: 'government', label: 'Government — 14+ chars, complexity, 90-day rotation' },
];

const SESSION_TIMEOUTS = [
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 60, label: '1 hour' },
  { value: 120, label: '2 hours' },
  { value: 480, label: '8 hours (Shift)' },
];

const AUDIT_RETENTION = [
  { value: 90, label: '90 days (3 months)' },
  { value: 180, label: '180 days (6 months)' },
  { value: 365, label: '365 days (1 year)' },
  { value: 730, label: '730 days (2 years)' },
  { value: 1825, label: '1825 days (5 years)' },
  { value: 2555, label: '2555 days (7 years — Govt. compliance)' },
];

// ── Field Components ────────────────────────────────────────────────

function SelectField({ label, value, options, onChange, hint }: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (v: string) => void;
  hint?: string;
}) {
  return (
    <div className="flex items-center justify-between px-6 py-3.5">
      <div>
        <p className="text-sm font-bold text-dark">{label}</p>
        {hint && <p className="text-xs text-dark-muted mt-0.5">{hint}</p>}
      </div>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-64 h-9 rounded-xl border-2 border-cream-darker bg-cream px-3 text-sm font-bold text-dark outline-none focus:border-primary appearance-none cursor-pointer"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%234A3E34' d='M2 4l4 4 4-4'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function NumberSelectField({ label, value, options, onChange, hint }: {
  label: string;
  value: number;
  options: Array<{ value: number; label: string }>;
  onChange: (v: number) => void;
  hint?: string;
}) {
  return (
    <div className="flex items-center justify-between px-6 py-3.5">
      <div>
        <p className="text-sm font-bold text-dark">{label}</p>
        {hint && <p className="text-xs text-dark-muted mt-0.5">{hint}</p>}
      </div>
      <select
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-64 h-9 rounded-xl border-2 border-cream-darker bg-cream px-3 text-sm font-bold text-dark outline-none focus:border-primary appearance-none cursor-pointer"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%234A3E34' d='M2 4l4 4 4-4'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function ToggleField({ label, value, onChange, hint }: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  hint?: string;
}) {
  return (
    <div className="flex items-center justify-between px-6 py-3.5">
      <div>
        <p className="text-sm font-bold text-dark">{label}</p>
        {hint && <p className="text-xs text-dark-muted mt-0.5">{hint}</p>}
      </div>
      <button
        className="relative w-12 h-7 rounded-full transition-colors"
        style={{ background: value ? '#2F7D4F' : '#E3D6C6' }}
        onClick={() => onChange(!value)}
      >
        <span
          className="absolute top-0.5 w-6 h-6 rounded-full bg-white transition-transform shadow-sm"
          style={{ left: value ? 22 : 2 }}
        />
      </button>
    </div>
  );
}

function NumberField({ label, value, onChange, min, max, step, unit, hint }: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  hint?: string;
}) {
  return (
    <div className="flex items-center justify-between px-6 py-3.5">
      <div>
        <p className="text-sm font-bold text-dark">{label}</p>
        {hint && <p className="text-xs text-dark-muted mt-0.5">{hint}</p>}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={value}
          onChange={e => {
            const n = Number(e.target.value);
            if (!isNaN(n)) onChange(Math.max(min ?? 0, Math.min(max ?? 99999, n)));
          }}
          min={min}
          max={max}
          step={step}
          className="w-28 h-9 rounded-xl border-2 border-cream-darker bg-cream px-3 text-sm font-bold text-dark text-right outline-none focus:border-primary"
        />
        {unit && <span className="text-xs font-bold text-dark-muted">{unit}</span>}
      </div>
    </div>
  );
}

function SliderField({ label, value, onChange, min, max, step, formatValue, hint }: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  formatValue?: (v: number) => string;
  hint?: string;
}) {
  return (
    <div className="px-6 py-3.5">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-sm font-bold text-dark">{label}</p>
          {hint && <p className="text-xs text-dark-muted mt-0.5">{hint}</p>}
        </div>
        <span className="rounded-xl bg-cream px-3 py-1.5 text-sm font-bold text-dark" style={{ fontFamily: 'ui-monospace, Menlo, monospace' }}>
          {formatValue ? formatValue(value) : value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer"
        style={{ background: `linear-gradient(to right, #C24E33 0%, #C24E33 ${((value - min) / (max - min)) * 100}%, #E3D6C6 ${((value - min) / (max - min)) * 100}%, #E3D6C6 100%)` }}
      />
      <div className="flex justify-between mt-1 text-[10px] text-dark-muted">
        <span>{formatValue ? formatValue(min) : min}</span>
        <span>{formatValue ? formatValue(max) : max}</span>
      </div>
    </div>
  );
}

function ColorField({ label, value, onChange, hint }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}) {
  return (
    <div className="flex items-center justify-between px-6 py-3.5">
      <div>
        <p className="text-sm font-bold text-dark">{label}</p>
        {hint && <p className="text-xs text-dark-muted mt-0.5">{hint}</p>}
      </div>
      <div className="flex items-center gap-2">
        <div className="relative">
          <input
            type="color"
            value={value || '#C24E33'}
            onChange={e => onChange(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div
            className="w-9 h-9 rounded-xl border-2 border-cream-darker"
            style={{ background: value || '#C24E33' }}
          />
        </div>
        <span className="rounded-xl bg-cream px-3 py-1.5 text-sm font-bold text-dark" style={{ fontFamily: 'ui-monospace, Menlo, monospace' }}>
          {value || '#C24E33'}
        </span>
      </div>
    </div>
  );
}

function TextField({ label, value, onChange, placeholder, hint, type }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  type?: 'text' | 'email' | 'url' | 'tel';
}) {
  return (
    <div className="flex items-center justify-between px-6 py-3.5">
      <div>
        <p className="text-sm font-bold text-dark">{label}</p>
        {hint && <p className="text-xs text-dark-muted mt-0.5">{hint}</p>}
      </div>
      <input
        type={type || 'text'}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-64 h-9 rounded-xl border-2 border-cream-darker bg-cream px-3 text-sm font-bold text-dark text-right outline-none focus:border-primary placeholder:text-dark-muted/50 placeholder:font-normal"
      />
    </div>
  );
}

function SectionHeader({ title, icon }: { title: string; icon: string }) {
  return (
    <div className="flex items-center gap-2 px-6 py-4">
      <span className="material-symbols-rounded text-lg text-dark-muted">{icon}</span>
      <h4 className="text-xs font-extrabold uppercase text-dark-muted tracking-wider">{title}</h4>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────

export function EnvironmentPage({ envId, onBack }: Props) {
  const { user } = useAuth();
  const tenant = getAllTenants().find(t => t.id === envId);
  const [activeTab, setActiveTab] = useState('overview');
  const [config, setConfig] = useState<EnvironmentConfig>(
    () => getTenantConfig(envId)
  );
  const [saved, setSaved] = useState(false);
  const [deployMessage, setDeployMessage] = useState('');
  const prevConfigRef = useRef<EnvironmentConfig>(config);

  const usage = useMemo(() => getUsageData(envId, tenant?.totalCases), [envId, tenant?.totalCases]);
  const costs = useMemo(() => getCostBreakdown(envId, tenant?.monthlyCost), [envId, tenant?.monthlyCost]);

  if (!tenant) {
    return (
      <div className="p-6">
        <button onClick={onBack} className="flex items-center gap-1 text-sm font-bold text-primary hover:underline">
          <span className="material-symbols-rounded text-lg">arrow_back</span>
          Back
        </button>
        <p className="mt-4 text-dark-muted">Environment not found.</p>
      </div>
    );
  }

  const st = STATUS_STYLES[tenant.status]!;
  const auditUser = { id: user?.id || 'unknown', name: user?.name || 'Unknown' };
  const auditTenant = { id: tenant.id, name: tenant.name };

  function diffAndLog(section: string, oldObj: Record<string, unknown>, newObj: Record<string, unknown>) {
    const changes: Array<{ field: string; oldValue: string; newValue: string }> = [];
    for (const key of Object.keys(newObj)) {
      const ov = oldObj[key];
      const nv = newObj[key];
      if (JSON.stringify(ov) !== JSON.stringify(nv)) {
        changes.push({ field: key, oldValue: String(ov ?? ''), newValue: String(nv ?? '') });
      }
    }
    if (changes.length > 0) {
      addConfigChangeEntries(auditUser, auditTenant, section, changes);
    }
  }

  function persistConfig(next: EnvironmentConfig) {
    saveTenantConfig(envId, next);
  }

  function handleSave() {
    if (!tenant) return;
    diffAndLog('Deploy', { status: 'pending' }, { status: 'deployed' });
    addAuditEntry({
      userId: auditUser.id,
      userName: auditUser.name,
      tenantId: auditTenant.id,
      tenantName: auditTenant.name,
      action: 'deploy',
      section: 'Deployment',
      field: 'Full Config',
      oldValue: '',
      newValue: `Deployed to ${tenant.name}`,
    });
    deployConfig(tenant, config);
    prevConfigRef.current = config;
    setSaved(true);
    setDeployMessage(`Deployed to ${tenant.name}. Staff and Citizen apps will reflect these changes.`);
    setTimeout(() => { setSaved(false); setDeployMessage(''); }, 4000);
  }

  function updateCloud<K extends keyof EnvironmentConfig['cloud']>(key: K, value: EnvironmentConfig['cloud'][K]) {
    setConfig(c => {
      const next = { ...c, cloud: { ...c.cloud, [key]: value } };
      addConfigChangeEntries(auditUser, auditTenant, 'Cloud & Infra', [
        { field: key, oldValue: String(c.cloud[key]), newValue: String(value) },
      ]);
      persistConfig(next);
      return next;
    });
  }

  function updateAI<K extends keyof EnvironmentConfig['ai']>(key: K, value: EnvironmentConfig['ai'][K]) {
    setConfig(c => {
      const next = { ...c, ai: { ...c.ai, [key]: value } };
      addConfigChangeEntries(auditUser, auditTenant, 'AI & Voice', [
        { field: key, oldValue: String(c.ai[key]), newValue: String(value) },
      ]);
      persistConfig(next);
      return next;
    });
  }

  function updateComms<K extends keyof EnvironmentConfig['communications']>(key: K, value: EnvironmentConfig['communications'][K]) {
    setConfig(c => {
      const next = { ...c, communications: { ...c.communications, [key]: value } };
      addConfigChangeEntries(auditUser, auditTenant, 'Communications', [
        { field: key, oldValue: String(c.communications[key]), newValue: String(value) },
      ]);
      persistConfig(next);
      return next;
    });
  }

  function toggleModule(mod: string) {
    setConfig(c => {
      const wasEnabled = c.features.modules[mod];
      const next = {
        ...c,
        features: {
          ...c.features,
          modules: { ...c.features.modules, [mod]: !wasEnabled },
        },
      };
      addAuditEntry({
        userId: auditUser.id,
        userName: auditUser.name,
        tenantId: auditTenant.id,
        tenantName: auditTenant.name,
        action: 'module_toggle',
        section: 'Features & Modules',
        field: mod,
        oldValue: wasEnabled ? 'Enabled' : 'Disabled',
        newValue: wasEnabled ? 'Disabled' : 'Enabled',
      });
      persistConfig(next);
      return next;
    });
  }

  function toggleRole(roleKey: string) {
    setConfig(c => {
      const role = c.features.roles.find(r => r.key === roleKey);
      const wasEnabled = role?.enabled ?? false;
      const next = {
        ...c,
        features: {
          ...c.features,
          roles: c.features.roles.map(r =>
            r.key === roleKey ? { ...r, enabled: !r.enabled } : r
          ),
        },
      };
      addAuditEntry({
        userId: auditUser.id,
        userName: auditUser.name,
        tenantId: auditTenant.id,
        tenantName: auditTenant.name,
        action: 'role_toggle',
        section: 'Roles & Permissions',
        field: role?.name || roleKey,
        oldValue: wasEnabled ? 'Enabled' : 'Disabled',
        newValue: wasEnabled ? 'Disabled' : 'Enabled',
      });
      persistConfig(next);
      return next;
    });
  }

  function updateSecurity<K extends keyof EnvironmentConfig['security']>(key: K, value: EnvironmentConfig['security'][K]) {
    setConfig(c => {
      const next = { ...c, security: { ...c.security, [key]: value } };
      addConfigChangeEntries(auditUser, auditTenant, 'Security', [
        { field: key, oldValue: String(c.security[key]), newValue: String(value) },
      ]);
      persistConfig(next);
      return next;
    });
  }

  function updateBranding<K extends keyof EnvironmentConfig['branding']>(key: K, value: EnvironmentConfig['branding'][K]) {
    setConfig(c => {
      const next = { ...c, branding: { ...c.branding, [key]: value } };
      addConfigChangeEntries(auditUser, auditTenant, 'Branding', [
        { field: key, oldValue: String(c.branding[key]), newValue: String(value) },
      ]);
      persistConfig(next);
      return next;
    });
  }

  const totalUsage = usage.reduce((s, d) => s + d.cases, 0);
  const avgDaily = Math.round(totalUsage / usage.length);
  const peakDay = usage.reduce((max, d) => d.cases > max.cases ? d : max, usage[0]!);
  const totalWhatsapp = usage.reduce((s, d) => s + d.whatsappMessages, 0);
  const totalSms = usage.reduce((s, d) => s + d.smsCount, 0);

  const costByCategory = costs.reduce<Record<string, number>>((acc, c) => {
    acc[c.category] = (acc[c.category] || 0) + c.amount;
    return acc;
  }, {});
  const totalCost = costs.reduce((s, c) => s + c.amount, 0);

  const cloudRegions = getRegionsForProvider(config.cloud.provider);
  const cloudInstances = getInstancesForProvider(config.cloud.provider);
  const dbTypes = DB_TYPES[config.cloud.provider] || DB_TYPES['AWS']!;
  const dbSizes = DB_SIZES[config.cloud.provider] || DB_SIZES['AWS']!;
  const sttModels = STT_MODELS[config.ai.sttProvider] || [];
  const ttsVoices = TTS_VOICES[config.ai.ttsProvider] || [];
  const llmModels = LLM_MODELS[config.ai.llmProvider] || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-cream-dark">
          <span className="material-symbols-rounded text-2xl text-dark">arrow_back</span>
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-extrabold text-dark">{tenant.name}</h2>
            <span className="inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-bold" style={{ background: st.bg, color: st.fg }}>
              <span className="material-symbols-rounded text-sm">{st.icon}</span>
              {st.label}
            </span>
          </div>
          <p className="text-sm text-dark-muted">{tenant.type} · {tenant.state} · Plan: {tenant.planName}</p>
        </div>
        <button
          onClick={handleSave}
          className="flex h-10 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-white transition-colors hover:bg-primary-dark"
        >
          <span className="material-symbols-rounded text-lg">{saved ? 'check' : 'save'}</span>
          {saved ? 'Saved' : 'Deploy Changes'}
        </button>
      </div>

      {deployMessage && (
        <div className="flex items-center gap-3 rounded-xl p-3" style={{ background: '#E6F5EC', border: '1px solid #2F7D4F' }}>
          <span className="material-symbols-rounded text-xl text-success">check_circle</span>
          <p className="text-sm font-bold text-success flex-1">{deployMessage}</p>
          <div className="flex gap-2">
            <a href="/staff/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold text-white" style={{ background: '#2F7D4F' }}>
              <span className="material-symbols-rounded text-sm">open_in_new</span>
              Staff Console
            </a>
            <a href="/citizen/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold text-white" style={{ background: '#2F7D4F' }}>
              <span className="material-symbols-rounded text-sm">open_in_new</span>
              Citizen App
            </a>
          </div>
        </div>
      )}

      <div className="flex gap-6">
        <nav className="w-52 space-y-1 flex-none">
          {CONFIG_GROUPS.map(g => (
            <button
              key={g.key}
              onClick={() => setActiveTab(g.key)}
              className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-left text-sm font-bold transition-colors"
              style={{
                background: activeTab === g.key ? '#C24E33' : 'transparent',
                color: activeTab === g.key ? '#fff' : '#4A3E34',
              }}
            >
              <span className="material-symbols-rounded text-xl">{g.icon}</span>
              {g.label}
            </button>
          ))}
        </nav>

        <div className="flex-1 rounded-2xl bg-white min-w-0" style={{ boxShadow: '0 1px 0 #EADFD2' }}>
          <div className="border-b border-cream-darker px-6 py-4 flex items-center justify-between">
            <h3 className="text-base font-extrabold text-dark">
              {CONFIG_GROUPS.find(g => g.key === activeTab)?.label}
            </h3>
            {saved && (
              <span className="flex items-center gap-1 text-xs font-bold text-success">
                <span className="material-symbols-rounded text-sm">check_circle</span>
                Changes saved
              </span>
            )}
          </div>

          {activeTab === 'overview' && (
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {[
                  { label: 'Total Cases', value: tenant.totalCases.toLocaleString('en-IN'), icon: 'folder_open', bg: '#FBE3D9', fg: '#C24E33' },
                  { label: 'Active Cases', value: tenant.activeCases, icon: 'pending_actions', bg: '#FFF4D6', fg: '#8A5A00' },
                  { label: 'Staff', value: tenant.staffCount, icon: 'badge', bg: '#E0F0FF', fg: '#2F6690' },
                  { label: 'Citizens', value: tenant.citizenCount.toLocaleString('en-IN'), icon: 'groups', bg: '#E6F5EC', fg: '#2F7D4F' },
                ].map(k => (
                  <div key={k.label} className="rounded-2xl p-4 flex flex-col gap-1" style={{ background: k.bg }}>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-rounded text-xl" style={{ color: k.fg }}>{k.icon}</span>
                      <span className="text-xs font-bold" style={{ color: k.fg }}>{k.label}</span>
                    </div>
                    <p className="text-2xl font-extrabold" style={{ color: k.fg }}>{k.value}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-cream-darker divide-y divide-cream">
                <div className="flex items-center justify-between px-5 py-3">
                  <span className="text-sm font-bold text-dark">Slug</span>
                  <span className="text-sm text-dark-muted font-mono">{tenant.slug}</span>
                </div>
                <div className="flex items-center justify-between px-5 py-3">
                  <span className="text-sm font-bold text-dark">Case Prefix</span>
                  <span className="text-sm text-dark-muted font-mono">{tenant.casePrefix}</span>
                </div>
                <div className="flex items-center justify-between px-5 py-3">
                  <span className="text-sm font-bold text-dark">Contact</span>
                  <span className="text-sm text-dark-muted">{tenant.contactName}</span>
                </div>
                <div className="flex items-center justify-between px-5 py-3">
                  <span className="text-sm font-bold text-dark">Email</span>
                  <span className="text-sm text-dark-muted">{tenant.contactEmail}</span>
                </div>
                <div className="flex items-center justify-between px-5 py-3">
                  <span className="text-sm font-bold text-dark">Created</span>
                  <span className="text-sm text-dark-muted">{new Date(tenant.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </div>
                <div className="flex items-center justify-between px-5 py-3">
                  <span className="text-sm font-bold text-dark">Languages</span>
                  <span className="text-sm text-dark-muted">{tenant.enabledLanguages.join(', ')}</span>
                </div>
                <div className="flex items-center justify-between px-5 py-3">
                  <span className="text-sm font-bold text-dark">Region</span>
                  <span className="text-sm text-dark-muted">{tenant.region}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <a
                  href={`/staff/?tenant=${tenant.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 h-10 px-4 rounded-xl border-2 border-cream-darker bg-white text-sm font-bold text-dark hover:bg-cream"
                >
                  <span className="material-symbols-rounded text-lg">open_in_new</span>
                  Open Staff Console
                </a>
                <a
                  href={`/citizen/?tenant=${tenant.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 h-10 px-4 rounded-xl border-2 border-cream-darker bg-white text-sm font-bold text-dark hover:bg-cream"
                >
                  <span className="material-symbols-rounded text-lg">open_in_new</span>
                  Open Citizen App
                </a>
              </div>
            </div>
          )}

          {activeTab === 'cloud' && (
            <div className="divide-y divide-cream">
              <SelectField
                label="Cloud Provider"
                value={config.cloud.provider}
                options={CLOUD_PROVIDERS}
                onChange={v => {
                  const regions = getRegionsForProvider(v);
                  const instances = getInstancesForProvider(v);
                  const dbt = DB_TYPES[v] || DB_TYPES['AWS']!;
                  const dbs = DB_SIZES[v] || DB_SIZES['AWS']!;
                  setConfig(c => {
                    const next = {
                      ...c,
                      cloud: {
                        ...c.cloud,
                        provider: v,
                        region: regions[0]?.value || c.cloud.region,
                        instanceType: instances[0]?.value || c.cloud.instanceType,
                        dbType: dbt[0]?.value || c.cloud.dbType,
                        dbSize: dbs[0]?.value || c.cloud.dbSize,
                      },
                    };
                    addConfigChangeEntries(auditUser, auditTenant, 'Cloud & Infra', [
                      { field: 'provider', oldValue: c.cloud.provider, newValue: v },
                    ]);
                    persistConfig(next);
                    return next;
                  });
                }}
              />
              <SelectField label="Region" value={config.cloud.region} options={cloudRegions} onChange={v => updateCloud('region', v)} hint="Data residency region" />
              <SelectField label="Instance Type" value={config.cloud.instanceType} options={cloudInstances} onChange={v => updateCloud('instanceType', v)} hint="Application server size" />
              <SelectField label="Database Type" value={config.cloud.dbType} options={dbTypes} onChange={v => updateCloud('dbType', v)} />
              <SelectField label="Database Size" value={config.cloud.dbSize} options={dbSizes} onChange={v => updateCloud('dbSize', v)} />
              <SliderField
                label="Storage"
                value={config.cloud.storageGB}
                onChange={v => updateCloud('storageGB', v)}
                min={10}
                max={2000}
                step={10}
                formatValue={v => `${v} GB`}
                hint="Object storage for media, documents and backups"
              />
              <ToggleField label="CDN Enabled" value={config.cloud.cdnEnabled} onChange={v => updateCloud('cdnEnabled', v)} hint="Content delivery network for static assets" />
              <SelectField label="Backup Frequency" value={config.cloud.backupFrequency} options={BACKUP_FREQUENCIES} onChange={v => updateCloud('backupFrequency', v)} />
              <ToggleField label="SSL Auto-Renew" value={config.cloud.sslCertAuto} onChange={v => updateCloud('sslCertAuto', v)} hint="Automatic TLS certificate renewal" />
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="divide-y divide-cream">
              <SectionHeader title="Speech-to-Text (STT)" icon="mic" />
              <SelectField
                label="STT Provider"
                value={config.ai.sttProvider}
                options={STT_PROVIDERS}
                onChange={v => {
                  const models = STT_MODELS[v] || [];
                  updateAI('sttProvider', v);
                  if (models.length > 0) updateAI('sttModel', models[0]!.value);
                }}
              />
              <SelectField label="STT Model" value={config.ai.sttModel} options={sttModels} onChange={v => updateAI('sttModel', v)} hint="Model determines accuracy and latency" />

              <SectionHeader title="Text-to-Speech (TTS)" icon="record_voice_over" />
              <SelectField
                label="TTS Provider"
                value={config.ai.ttsProvider}
                options={TTS_PROVIDERS}
                onChange={v => {
                  const voices = TTS_VOICES[v] || [];
                  updateAI('ttsProvider', v);
                  if (voices.length > 0) updateAI('ttsVoice', voices[0]!.value);
                }}
              />
              <SelectField label="TTS Voice" value={config.ai.ttsVoice} options={ttsVoices} onChange={v => updateAI('ttsVoice', v)} hint="Voice used for IVR and audio responses" />

              <SectionHeader title="Large Language Model (LLM)" icon="psychology" />
              <SelectField
                label="LLM Provider"
                value={config.ai.llmProvider}
                options={LLM_PROVIDERS}
                onChange={v => {
                  const models = LLM_MODELS[v] || [];
                  updateAI('llmProvider', v);
                  if (models.length > 0) updateAI('llmModel', models[0]!.value);
                }}
              />
              <SelectField label="LLM Model" value={config.ai.llmModel} options={llmModels} onChange={v => updateAI('llmModel', v)} hint="Model used for routing, classification and summarisation" />

              <SectionHeader title="Behaviour" icon="tune" />
              <SliderField
                label="Confidence Threshold"
                value={config.ai.confidenceThreshold}
                onChange={v => updateAI('confidenceThreshold', v)}
                min={0.3}
                max={0.95}
                step={0.05}
                formatValue={v => `${Math.round(v * 100)}%`}
                hint="Minimum confidence to auto-accept a classification"
              />
              <NumberField
                label="Max Conversation Turns"
                value={config.ai.maxTurns}
                onChange={v => updateAI('maxTurns', v)}
                min={2}
                max={20}
                hint="Maximum voice interaction turns before fallback"
              />
              <ToggleField label="Auto-Routing" value={config.ai.autoRouting} onChange={v => updateAI('autoRouting', v)} hint="Automatically assign cases to departments based on AI classification" />
            </div>
          )}

          {activeTab === 'comms' && (
            <div className="divide-y divide-cream">
              <SectionHeader title="WhatsApp" icon="chat" />
              <ToggleField label="Enabled" value={config.communications.whatsappEnabled} onChange={v => updateComms('whatsappEnabled', v)} />
              {config.communications.whatsappEnabled && (
                <>
                  <SelectField label="Provider" value={config.communications.whatsappProvider} options={WHATSAPP_PROVIDERS} onChange={v => updateComms('whatsappProvider', v)} />
                  <TextField label="Business Account ID" value={config.communications.whatsappBusinessId} onChange={v => updateComms('whatsappBusinessId', v)} placeholder="WABA-XXX-001" hint="WhatsApp Business Account ID from provider" />
                  <TextField label="Phone Number" value={config.communications.whatsappPhoneNumber} onChange={v => updateComms('whatsappPhoneNumber', v)} placeholder="+91XXXXXXXXXX" type="tel" hint="Registered WhatsApp business number" />
                </>
              )}

              <SectionHeader title="SMS" icon="sms" />
              <ToggleField label="Enabled" value={config.communications.smsEnabled} onChange={v => updateComms('smsEnabled', v)} />
              {config.communications.smsEnabled && (
                <>
                  <SelectField label="Provider" value={config.communications.smsProvider} options={SMS_PROVIDERS} onChange={v => updateComms('smsProvider', v)} />
                  <TextField label="Sender ID" value={config.communications.smsSenderId} onChange={v => updateComms('smsSenderId', v)} placeholder="AYDNPP" hint="6-character alphanumeric DLT-registered sender ID" />
                  <TextField label="DLT Entity ID" value={config.communications.smsDltEntityId} onChange={v => updateComms('smsDltEntityId', v)} placeholder="DLT-1201159876543" hint="TRAI DLT registration entity ID" />
                </>
              )}

              <SectionHeader title="Email" icon="email" />
              <ToggleField label="Enabled" value={config.communications.emailEnabled} onChange={v => updateComms('emailEnabled', v)} />
              {config.communications.emailEnabled && (
                <>
                  <SelectField label="Provider" value={config.communications.emailProvider} options={EMAIL_PROVIDERS} onChange={v => updateComms('emailProvider', v)} />
                  <TextField label="Sender Address" value={config.communications.emailSender} onChange={v => updateComms('emailSender', v)} placeholder="complaints@municipality.gov.in" type="email" hint="Verified sender email address" />
                </>
              )}

              <SectionHeader title="Telephony (IVR)" icon="call" />
              <ToggleField label="Enabled" value={config.communications.telephonyEnabled} onChange={v => updateComms('telephonyEnabled', v)} />
              {config.communications.telephonyEnabled && (
                <>
                  <SelectField label="Provider" value={config.communications.telephonyProvider} options={TELEPHONY_PROVIDERS} onChange={v => updateComms('telephonyProvider', v)} />
                  <TextField label="Phone Number" value={config.communications.telephonyNumber} onChange={v => updateComms('telephonyNumber', v)} placeholder="+91XXXXXXXXXX" type="tel" hint="IVR phone number for voice complaints" />
                </>
              )}

              <SectionHeader title="Push Notifications" icon="notifications" />
              <ToggleField label="Enabled" value={config.communications.pushEnabled} onChange={v => updateComms('pushEnabled', v)} hint="Firebase Cloud Messaging for mobile and web push" />
            </div>
          )}

          {activeTab === 'features' && (
            <div className="p-6">
              <p className="text-sm text-dark-muted mb-4">
                Toggle modules for this environment. Disabled modules are hidden from all users of this tenant.
              </p>
              <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
                {Object.entries(config.features.modules).map(([key, enabled]) => {
                  const meta = MODULE_LABELS[key];
                  if (!meta) return null;
                  return (
                    <div
                      key={key}
                      className="flex items-center gap-3 rounded-xl border-2 p-3 cursor-pointer transition-colors"
                      style={{
                        borderColor: enabled ? '#2F7D4F' : '#E3D6C6',
                        background: enabled ? '#F0FAF4' : 'transparent',
                      }}
                      onClick={() => key !== 'core' && toggleModule(key)}
                    >
                      <span
                        className="material-symbols-rounded text-2xl"
                        style={{ color: enabled ? '#2F7D4F' : '#C4B5A3' }}
                      >
                        {meta.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold" style={{ color: enabled ? '#2A1F17' : '#8A7766' }}>
                          {meta.label}
                        </p>
                        <p className="text-xs" style={{ color: enabled ? '#4A3E34' : '#C4B5A3' }}>
                          {meta.description}
                        </p>
                      </div>
                      {key === 'core' ? (
                        <span className="rounded-lg bg-cream px-2 py-0.5 text-[10px] font-bold text-dark-muted">ALWAYS ON</span>
                      ) : (
                        <span
                          className="material-symbols-rounded text-2xl"
                          style={{ color: enabled ? '#2F7D4F' : '#E3D6C6' }}
                        >
                          {enabled ? 'toggle_on' : 'toggle_off'}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'roles' && (
            <div className="p-6 space-y-4">
              <p className="text-sm text-dark-muted">
                Enable or disable roles for this environment. Disabled roles cannot be assigned to users.
              </p>
              {config.features.roles.map(role => (
                <div key={role.key} className="rounded-xl border-2 border-cream-darker p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-rounded text-xl text-dark-muted">person</span>
                      <h4 className="text-sm font-extrabold text-dark">{role.name}</h4>
                      <span className="text-xs text-dark-muted font-mono">{role.key}</span>
                    </div>
                    <button
                      className="relative w-12 h-7 rounded-full transition-colors"
                      style={{ background: role.enabled ? '#2F7D4F' : '#E3D6C6' }}
                      onClick={() => toggleRole(role.key)}
                    >
                      <span
                        className="absolute top-0.5 w-6 h-6 rounded-full bg-white transition-transform shadow-sm"
                        style={{ left: role.enabled ? 22 : 2 }}
                      />
                    </button>
                  </div>
                  {role.enabled && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {role.permissions.map(p => (
                        <span key={p} className="rounded-lg bg-cream px-2 py-0.5 text-[11px] font-bold text-dark-muted">
                          {p}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'security' && (
            <div className="divide-y divide-cream">
              <ToggleField label="Staff 2FA Required" value={config.security.staff2faRequired} onChange={v => updateSecurity('staff2faRequired', v)} hint="Require two-factor authentication for all staff logins" />
              <SelectField
                label="Password Policy"
                value={config.security.passwordPolicy}
                options={PASSWORD_POLICIES}
                onChange={v => updateSecurity('passwordPolicy', v)}
                hint="Minimum password requirements for staff accounts"
              />
              <NumberSelectField
                label="Session Timeout"
                value={config.security.sessionTimeoutMinutes}
                options={SESSION_TIMEOUTS}
                onChange={v => updateSecurity('sessionTimeoutMinutes', v)}
                hint="Auto-logout after inactivity"
              />
              <ToggleField label="SSO Enabled" value={config.security.ssoEnabled} onChange={v => updateSecurity('ssoEnabled', v)} hint="Single sign-on for staff accounts" />
              {config.security.ssoEnabled && (
                <SelectField
                  label="SSO Provider"
                  value={config.security.ssoProvider}
                  options={SSO_PROVIDERS}
                  onChange={v => updateSecurity('ssoProvider', v)}
                  hint="Identity provider for SSO"
                />
              )}
              <NumberSelectField
                label="Audit Log Retention"
                value={config.security.auditRetentionDays}
                options={AUDIT_RETENTION}
                onChange={v => updateSecurity('auditRetentionDays', v)}
                hint="How long audit logs are retained"
              />
            </div>
          )}

          {activeTab === 'branding' && (
            <div className="divide-y divide-cream">
              <ColorField label="Primary Colour" value={config.branding.primaryColor} onChange={v => updateBranding('primaryColor', v)} hint="Used for buttons, links and accents across all apps" />
              <div className="px-6 py-4">
                <p className="text-xs text-dark-muted mb-3">Preview</p>
                <div className="flex gap-3">
                  <button className="h-10 px-4 rounded-xl text-sm font-bold text-white" style={{ background: config.branding.primaryColor }}>
                    Primary Button
                  </button>
                  <span className="flex items-center gap-1 text-sm font-bold" style={{ color: config.branding.primaryColor }}>
                    <span className="material-symbols-rounded text-lg">link</span>
                    Link text
                  </span>
                  <span className="h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: config.branding.primaryColor }}>
                    AK
                  </span>
                </div>
              </div>
              <TextField label="Header Text" value={config.branding.headerText} onChange={v => updateBranding('headerText', v)} placeholder="e.g. Officer Console" hint="Shown in the staff console header bar" />
              <TextField label="Footer Text" value={config.branding.footerText} onChange={v => updateBranding('footerText', v)} placeholder="e.g. Powered by Samadhan" />
              <TextField label="Helpline Number" value={config.branding.helplineNumber} onChange={v => updateBranding('helplineNumber', v)} placeholder="+91-522-XXXXXXX" type="tel" hint="Shown on the citizen app home screen" />
              <TextField label="Support Email" value={config.branding.supportEmail} onChange={v => updateBranding('supportEmail', v)} placeholder="support@municipality.gov.in" type="email" />
              <TextField label="Custom Domain" value={config.branding.customDomain} onChange={v => updateBranding('customDomain', v)} placeholder="samadhan.municipality.gov.in" hint="CNAME to your municipality domain" />
              <TextField label="Logo URL" value={config.branding.logoUrl} onChange={v => updateBranding('logoUrl', v)} placeholder="https://..." type="url" hint="Square image, min 256×256px" />
              <TextField label="Favicon URL" value={config.branding.faviconUrl} onChange={v => updateBranding('faviconUrl', v)} placeholder="https://..." type="url" hint="Square icon, min 32×32px" />
            </div>
          )}

          {activeTab === 'usage' && (
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {[
                  { label: 'Avg. Cases/Day', value: avgDaily, icon: 'trending_up', bg: '#FBE3D9', fg: '#C24E33' },
                  { label: 'Peak Day', value: `${peakDay.cases} (${peakDay.date.slice(5)})`, icon: 'arrow_upward', bg: '#FFF4D6', fg: '#8A5A00' },
                  { label: 'WhatsApp (30d)', value: totalWhatsapp.toLocaleString('en-IN'), icon: 'chat', bg: '#E6F5EC', fg: '#2F7D4F' },
                  { label: 'SMS (30d)', value: totalSms.toLocaleString('en-IN'), icon: 'sms', bg: '#E0F0FF', fg: '#2F6690' },
                ].map(k => (
                  <div key={k.label} className="rounded-2xl p-4 flex flex-col gap-1" style={{ background: k.bg }}>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-rounded text-xl" style={{ color: k.fg }}>{k.icon}</span>
                      <span className="text-xs font-bold" style={{ color: k.fg }}>{k.label}</span>
                    </div>
                    <p className="text-xl font-extrabold" style={{ color: k.fg }}>{k.value}</p>
                  </div>
                ))}
              </div>

              <div>
                <h4 className="text-sm font-extrabold text-dark mb-3">Daily Cases (Last 30 Days)</h4>
                <div className="rounded-xl border border-cream-darker p-4">
                  <div className="flex items-end gap-[2px] h-32">
                    {usage.map((d, i) => {
                      const maxCases = Math.max(...usage.map(u => u.cases));
                      const h = maxCases > 0 ? (d.cases / maxCases) * 100 : 0;
                      return (
                        <div
                          key={i}
                          className="flex-1 rounded-t transition-all hover:opacity-80"
                          style={{
                            height: `${h}%`,
                            background: d.cases > avgDaily * 1.2 ? '#C24E33' : '#2F7D4F',
                            minWidth: 4,
                          }}
                          title={`${d.date}: ${d.cases} cases`}
                        />
                      );
                    })}
                  </div>
                  <div className="flex justify-between mt-2 text-[10px] text-dark-muted">
                    <span>{usage[0]?.date.slice(5)}</span>
                    <span>{usage[usage.length - 1]?.date.slice(5)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-extrabold text-dark mb-3">Usage Log</h4>
                <div className="rounded-xl border border-cream-darker overflow-hidden">
                  <div className="overflow-x-auto max-h-64 overflow-y-auto">
                    <table className="w-full text-xs">
                      <thead className="sticky top-0">
                        <tr className="bg-cream text-left font-bold text-dark-muted">
                          <th className="px-3 py-2">Date</th>
                          <th className="px-3 py-2 text-right">Cases</th>
                          <th className="px-3 py-2 text-right">Voice</th>
                          <th className="px-3 py-2 text-right">WhatsApp</th>
                          <th className="px-3 py-2 text-right">SMS</th>
                          <th className="px-3 py-2 text-right">API Calls</th>
                          <th className="px-3 py-2 text-right">Storage</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-cream">
                        {usage.slice().reverse().map(d => (
                          <tr key={d.date} className="hover:bg-cream/50">
                            <td className="px-3 py-2 font-bold text-dark">{d.date}</td>
                            <td className="px-3 py-2 text-right">{d.cases}</td>
                            <td className="px-3 py-2 text-right">{d.voiceSessions}</td>
                            <td className="px-3 py-2 text-right">{d.whatsappMessages}</td>
                            <td className="px-3 py-2 text-right">{d.smsCount}</td>
                            <td className="px-3 py-2 text-right">{d.apiCalls.toLocaleString('en-IN')}</td>
                            <td className="px-3 py-2 text-right">{d.storageGB} GB</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'costs' && (
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl p-5" style={{ background: '#FEE4E2' }}>
                  <p className="text-xs font-bold text-danger mb-1">Monthly Cost</p>
                  <p className="text-3xl font-extrabold text-danger">
                    {totalCost.toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs text-danger/70 mt-1">INR</p>
                </div>
                <div className="rounded-2xl p-5" style={{ background: '#E6F5EC' }}>
                  <p className="text-xs font-bold text-success mb-1">Monthly Revenue</p>
                  <p className="text-3xl font-extrabold text-success">
                    {tenant.monthlyRevenue.toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs text-success/70 mt-1">INR</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-extrabold text-dark mb-3">Cost by Category</h4>
                <div className="space-y-2">
                  {Object.entries(costByCategory).map(([cat, amount]) => {
                    const pct = totalCost > 0 ? (amount / totalCost * 100) : 0;
                    return (
                      <div key={cat}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-bold text-dark">{cat}</span>
                          <span className="text-sm font-bold text-dark-muted">
                            {amount.toLocaleString('en-IN')} ({pct.toFixed(0)}%)
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-cream-dark overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-extrabold text-dark mb-3">Line Items</h4>
                <div className="rounded-xl border border-cream-darker overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-cream text-left text-xs font-bold uppercase text-dark-muted">
                        <th className="px-4 py-2.5">Category</th>
                        <th className="px-4 py-2.5">Item</th>
                        <th className="px-4 py-2.5 text-right">Amount (INR)</th>
                        <th className="px-4 py-2.5 text-right">Unit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-cream">
                      {costs.map((c, i) => (
                        <tr key={i} className="hover:bg-cream/50">
                          <td className="px-4 py-2.5 text-dark-muted">{c.category}</td>
                          <td className="px-4 py-2.5 font-bold text-dark">{c.item}</td>
                          <td className="px-4 py-2.5 text-right font-bold">{c.amount.toLocaleString('en-IN')}</td>
                          <td className="px-4 py-2.5 text-right text-dark-muted">{c.unit}</td>
                        </tr>
                      ))}
                      <tr className="bg-cream-dark font-extrabold">
                        <td className="px-4 py-2.5" colSpan={2}>Total</td>
                        <td className="px-4 py-2.5 text-right">{totalCost.toLocaleString('en-IN')}</td>
                        <td className="px-4 py-2.5 text-right text-dark-muted">/month</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

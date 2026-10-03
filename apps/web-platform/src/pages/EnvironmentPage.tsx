import { useState, useMemo } from 'react';
import {
  TENANTS,
  TENANT_CONFIGS,
  getDefaultConfig,
  getUsageData,
  getCostBreakdown,
  MODULE_LABELS,
  STATUS_STYLES,
} from '../data/mockData';
import { deployConfig } from '../platformConfig';
import type { EnvironmentConfig } from '../types';

interface Props {
  envId: string;
  onBack: () => void;
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

function ConfigField({ label, value, editable, onChange }: {
  label: string;
  value: string | number | boolean;
  editable?: boolean;
  onChange?: (v: string) => void;
}) {
  if (typeof value === 'boolean') {
    return (
      <div className="flex items-center justify-between px-6 py-3.5">
        <p className="text-sm font-bold text-dark">{label}</p>
        <button
          className="relative w-12 h-7 rounded-full transition-colors"
          style={{ background: value ? '#2F7D4F' : '#E3D6C6' }}
          onClick={() => onChange?.(String(!value))}
          disabled={!editable}
        >
          <span
            className="absolute top-0.5 w-6 h-6 rounded-full bg-white transition-transform shadow-sm"
            style={{ left: value ? 22 : 2 }}
          />
        </button>
      </div>
    );
  }
  return (
    <div className="flex items-center justify-between px-6 py-3.5">
      <p className="text-sm font-bold text-dark">{label}</p>
      {editable ? (
        <input
          type="text"
          value={String(value)}
          onChange={e => onChange?.(e.target.value)}
          className="w-56 h-9 rounded-xl border-2 border-cream-darker bg-cream px-3 text-sm font-bold text-dark text-right outline-none focus:border-primary"
        />
      ) : (
        <span className="rounded-xl bg-cream px-3 py-1.5 text-sm font-bold text-dark" style={{ fontFamily: 'ui-monospace, Menlo, monospace' }}>
          {String(value)}
        </span>
      )}
    </div>
  );
}

export function EnvironmentPage({ envId, onBack }: Props) {
  const tenant = TENANTS.find(t => t.id === envId);
  const [activeTab, setActiveTab] = useState('overview');
  const [config, setConfig] = useState<EnvironmentConfig>(
    () => TENANT_CONFIGS[envId] || getDefaultConfig()
  );
  const [saved, setSaved] = useState(false);
  const [deployMessage, setDeployMessage] = useState('');

  const usage = useMemo(() => getUsageData(envId), [envId]);
  const costs = useMemo(() => getCostBreakdown(envId), [envId]);

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

  function handleSave() {
    if (!tenant) return;
    deployConfig(tenant, config);
    setSaved(true);
    setDeployMessage(`Deployed to ${tenant.name}. Staff and Citizen apps will reflect these changes.`);
    setTimeout(() => { setSaved(false); setDeployMessage(''); }, 4000);
  }

  function updateCloud(key: string, value: string) {
    setConfig(c => ({ ...c, cloud: { ...c.cloud, [key]: key === 'storageGB' ? Number(value) : key === 'cdnEnabled' || key === 'sslCertAuto' ? value === 'true' : value } }));
  }

  function updateAI(key: string, value: string) {
    setConfig(c => ({
      ...c,
      ai: {
        ...c.ai,
        [key]: key === 'confidenceThreshold' ? Number(value) : key === 'maxTurns' ? Number(value) : key === 'autoRouting' ? value === 'true' : value,
      },
    }));
  }

  function updateComms(key: string, value: string) {
    const boolKeys = ['whatsappEnabled', 'smsEnabled', 'emailEnabled', 'telephonyEnabled', 'pushEnabled'];
    setConfig(c => ({
      ...c,
      communications: {
        ...c.communications,
        [key]: boolKeys.includes(key) ? value === 'true' : value,
      },
    }));
  }

  function toggleModule(mod: string) {
    setConfig(c => ({
      ...c,
      features: {
        ...c.features,
        modules: { ...c.features.modules, [mod]: !c.features.modules[mod] },
      },
    }));
  }

  function toggleRole(roleKey: string) {
    setConfig(c => ({
      ...c,
      features: {
        ...c.features,
        roles: c.features.roles.map(r =>
          r.key === roleKey ? { ...r, enabled: !r.enabled } : r
        ),
      },
    }));
  }

  function updateSecurity(key: string, value: string) {
    const numKeys = ['sessionTimeoutMinutes', 'auditRetentionDays'];
    const boolKeys = ['staff2faRequired', 'ssoEnabled'];
    setConfig(c => ({
      ...c,
      security: {
        ...c.security,
        [key]: numKeys.includes(key) ? Number(value) : boolKeys.includes(key) ? value === 'true' : value,
      },
    }));
  }

  function updateBranding(key: string, value: string) {
    setConfig(c => ({ ...c, branding: { ...c.branding, [key]: value } }));
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
              <ConfigField label="Cloud Provider" value={config.cloud.provider} editable onChange={v => updateCloud('provider', v)} />
              <ConfigField label="Region" value={config.cloud.region} editable onChange={v => updateCloud('region', v)} />
              <ConfigField label="Instance Type" value={config.cloud.instanceType} editable onChange={v => updateCloud('instanceType', v)} />
              <ConfigField label="Database Type" value={config.cloud.dbType} editable onChange={v => updateCloud('dbType', v)} />
              <ConfigField label="Database Size" value={config.cloud.dbSize} editable onChange={v => updateCloud('dbSize', v)} />
              <ConfigField label="Storage (GB)" value={config.cloud.storageGB} editable onChange={v => updateCloud('storageGB', v)} />
              <ConfigField label="CDN Enabled" value={config.cloud.cdnEnabled} editable onChange={v => updateCloud('cdnEnabled', v)} />
              <ConfigField label="Backup Frequency" value={config.cloud.backupFrequency} editable onChange={v => updateCloud('backupFrequency', v)} />
              <ConfigField label="SSL Auto-Renew" value={config.cloud.sslCertAuto} editable onChange={v => updateCloud('sslCertAuto', v)} />
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="divide-y divide-cream">
              <ConfigField label="STT Provider" value={config.ai.sttProvider} editable onChange={v => updateAI('sttProvider', v)} />
              <ConfigField label="STT Model" value={config.ai.sttModel} editable onChange={v => updateAI('sttModel', v)} />
              <ConfigField label="TTS Provider" value={config.ai.ttsProvider} editable onChange={v => updateAI('ttsProvider', v)} />
              <ConfigField label="TTS Voice" value={config.ai.ttsVoice} editable onChange={v => updateAI('ttsVoice', v)} />
              <ConfigField label="LLM Provider" value={config.ai.llmProvider} editable onChange={v => updateAI('llmProvider', v)} />
              <ConfigField label="LLM Model" value={config.ai.llmModel} editable onChange={v => updateAI('llmModel', v)} />
              <ConfigField label="Confidence Threshold" value={config.ai.confidenceThreshold} editable onChange={v => updateAI('confidenceThreshold', v)} />
              <ConfigField label="Max Turns" value={config.ai.maxTurns} editable onChange={v => updateAI('maxTurns', v)} />
              <ConfigField label="Auto-Routing" value={config.ai.autoRouting} editable onChange={v => updateAI('autoRouting', v)} />
            </div>
          )}

          {activeTab === 'comms' && (
            <div className="divide-y divide-cream">
              <div className="px-6 py-4">
                <h4 className="text-xs font-extrabold uppercase text-dark-muted tracking-wider">WhatsApp</h4>
              </div>
              <ConfigField label="Enabled" value={config.communications.whatsappEnabled} editable onChange={v => updateComms('whatsappEnabled', v)} />
              <ConfigField label="Business ID" value={config.communications.whatsappBusinessId} editable onChange={v => updateComms('whatsappBusinessId', v)} />
              <ConfigField label="Phone Number" value={config.communications.whatsappPhoneNumber} editable onChange={v => updateComms('whatsappPhoneNumber', v)} />
              <ConfigField label="Provider" value={config.communications.whatsappProvider} editable onChange={v => updateComms('whatsappProvider', v)} />
              <div className="px-6 py-4">
                <h4 className="text-xs font-extrabold uppercase text-dark-muted tracking-wider">SMS</h4>
              </div>
              <ConfigField label="Enabled" value={config.communications.smsEnabled} editable onChange={v => updateComms('smsEnabled', v)} />
              <ConfigField label="Sender ID" value={config.communications.smsSenderId} editable onChange={v => updateComms('smsSenderId', v)} />
              <ConfigField label="DLT Entity ID" value={config.communications.smsDltEntityId} editable onChange={v => updateComms('smsDltEntityId', v)} />
              <ConfigField label="Provider" value={config.communications.smsProvider} editable onChange={v => updateComms('smsProvider', v)} />
              <div className="px-6 py-4">
                <h4 className="text-xs font-extrabold uppercase text-dark-muted tracking-wider">E-mail</h4>
              </div>
              <ConfigField label="Enabled" value={config.communications.emailEnabled} editable onChange={v => updateComms('emailEnabled', v)} />
              <ConfigField label="Sender Address" value={config.communications.emailSender} editable onChange={v => updateComms('emailSender', v)} />
              <ConfigField label="Provider" value={config.communications.emailProvider} editable onChange={v => updateComms('emailProvider', v)} />
              <div className="px-6 py-4">
                <h4 className="text-xs font-extrabold uppercase text-dark-muted tracking-wider">Telephony</h4>
              </div>
              <ConfigField label="Enabled" value={config.communications.telephonyEnabled} editable onChange={v => updateComms('telephonyEnabled', v)} />
              <ConfigField label="Provider" value={config.communications.telephonyProvider} editable onChange={v => updateComms('telephonyProvider', v)} />
              <ConfigField label="Phone Number" value={config.communications.telephonyNumber} editable onChange={v => updateComms('telephonyNumber', v)} />
              <div className="px-6 py-4">
                <h4 className="text-xs font-extrabold uppercase text-dark-muted tracking-wider">Push Notifications</h4>
              </div>
              <ConfigField label="Enabled" value={config.communications.pushEnabled} editable onChange={v => updateComms('pushEnabled', v)} />
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
              <ConfigField label="Staff 2FA Required" value={config.security.staff2faRequired} editable onChange={v => updateSecurity('staff2faRequired', v)} />
              <ConfigField label="Session Timeout (min)" value={config.security.sessionTimeoutMinutes} editable onChange={v => updateSecurity('sessionTimeoutMinutes', v)} />
              <ConfigField label="SSO Enabled" value={config.security.ssoEnabled} editable onChange={v => updateSecurity('ssoEnabled', v)} />
              <ConfigField label="SSO Provider" value={config.security.ssoProvider} editable onChange={v => updateSecurity('ssoProvider', v)} />
              <ConfigField label="Password Policy" value={config.security.passwordPolicy} editable onChange={v => updateSecurity('passwordPolicy', v)} />
              <ConfigField label="Audit Retention (days)" value={config.security.auditRetentionDays} editable onChange={v => updateSecurity('auditRetentionDays', v)} />
            </div>
          )}

          {activeTab === 'branding' && (
            <div className="divide-y divide-cream">
              <ConfigField label="Primary Colour" value={config.branding.primaryColor} editable onChange={v => updateBranding('primaryColor', v)} />
              <ConfigField label="Header Text" value={config.branding.headerText} editable onChange={v => updateBranding('headerText', v)} />
              <ConfigField label="Footer Text" value={config.branding.footerText} editable onChange={v => updateBranding('footerText', v)} />
              <ConfigField label="Helpline Number" value={config.branding.helplineNumber} editable onChange={v => updateBranding('helplineNumber', v)} />
              <ConfigField label="Support Email" value={config.branding.supportEmail} editable onChange={v => updateBranding('supportEmail', v)} />
              <ConfigField label="Custom Domain" value={config.branding.customDomain} editable onChange={v => updateBranding('customDomain', v)} />
              <ConfigField label="Logo URL" value={config.branding.logoUrl} editable onChange={v => updateBranding('logoUrl', v)} />
              <ConfigField label="Favicon URL" value={config.branding.faviconUrl} editable onChange={v => updateBranding('faviconUrl', v)} />
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

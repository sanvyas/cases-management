import { useState } from 'react';

interface Setting {
  key: string;
  value: unknown;
  description: string;
  group: string;
}

const SETTINGS: Setting[] = [
  { key: 'general.name', value: 'Demo Nagar Nigam', description: 'Organization name', group: 'general' },
  { key: 'general.short_name', value: 'DNN', description: 'Short name', group: 'general' },
  { key: 'general.case_prefix', value: 'GMD', description: 'Case number prefix', group: 'general' },
  { key: 'general.timezone', value: 'Asia/Kolkata', description: 'Timezone', group: 'general' },
  { key: 'general.default_language', value: 'hi', description: 'Default language', group: 'general' },
  { key: 'case.default_sla_hours', value: 48, description: 'Default SLA hours', group: 'case_rules' },
  { key: 'case.acceptance_timeout_minutes', value: 10, description: 'Acceptance timeout (minutes)', group: 'case_rules' },
  { key: 'case.reopen_window_days', value: 7, description: 'Reopen window (days)', group: 'case_rules' },
  { key: 'case.max_reopens', value: 3, description: 'Maximum reopens', group: 'case_rules' },
  { key: 'case.auto_close_days', value: 15, description: 'Auto-close after resolution (days)', group: 'case_rules' },
  { key: 'messaging.quiet_hours_start', value: '22:00', description: 'Quiet hours start', group: 'messaging' },
  { key: 'messaging.quiet_hours_end', value: '07:00', description: 'Quiet hours end', group: 'messaging' },
  { key: 'messaging.sms_sender_id', value: 'SMDHAN', description: 'SMS sender ID', group: 'messaging' },
  { key: 'security.staff_2fa_required', value: false, description: 'Require 2FA for staff', group: 'security' },
  { key: 'security.session_timeout_minutes', value: 30, description: 'Session timeout (minutes)', group: 'security' },
];

const groups = [
  { key: 'general', label: 'General', icon: 'settings' },
  { key: 'case_rules', label: 'Case Rules', icon: 'gavel' },
  { key: 'messaging', label: 'Messaging', icon: 'sms' },
  { key: 'security', label: 'Security', icon: 'shield' },
];

export function SettingsPage() {
  const [activeGroup, setActiveGroup] = useState('general');
  const filtered = SETTINGS.filter((s) => s.group === activeGroup);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-extrabold text-dark">Settings</h2>
        <p className="text-sm text-dark-muted">Tenant configuration</p>
      </div>

      <div className="flex gap-6">
        <nav className="w-52 space-y-1">
          {groups.map((g) => (
            <button
              key={g.key}
              onClick={() => setActiveGroup(g.key)}
              className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-left text-sm font-bold transition-colors"
              style={{
                background: activeGroup === g.key ? '#C24E33' : 'transparent',
                color: activeGroup === g.key ? '#fff' : '#4A3E34',
              }}
            >
              <span className="material-symbols-rounded text-xl">{g.icon}</span>
              {g.label}
            </button>
          ))}
        </nav>

        <div className="flex-1 rounded-2xl bg-white" style={{ boxShadow: '0 1px 0 #EADFD2' }}>
          <div className="border-b border-cream-darker px-6 py-4">
            <h3 className="text-base font-extrabold text-dark">
              {groups.find((g) => g.key === activeGroup)?.label}
            </h3>
          </div>
          <div className="divide-y divide-cream">
            {filtered.map((s) => (
              <div key={s.key} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="text-sm font-bold text-dark">{s.description}</p>
                  <p className="text-xs text-dark-muted">{s.key}</p>
                </div>
                <div className="text-right">
                  <span className="rounded-xl bg-cream px-3 py-1.5 text-sm font-bold text-dark" style={{ fontFamily: 'ui-monospace, Menlo, monospace' }}>
                    {typeof s.value === 'boolean'
                      ? s.value ? 'Yes' : 'No'
                      : String(s.value)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

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
  { key: 'general', label: 'General' },
  { key: 'case_rules', label: 'Case Rules' },
  { key: 'messaging', label: 'Messaging' },
  { key: 'security', label: 'Security' },
];

export function SettingsPage() {
  const [activeGroup, setActiveGroup] = useState('general');
  const filtered = SETTINGS.filter((s) => s.group === activeGroup);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Settings</h2>

      <div className="flex gap-6">
        {/* Group Nav */}
        <nav className="w-48 space-y-1">
          {groups.map((g) => (
            <button
              key={g.key}
              onClick={() => setActiveGroup(g.key)}
              className={`block w-full rounded-lg px-4 py-2 text-left text-sm font-medium transition-colors ${
                activeGroup === g.key
                  ? 'bg-slate-800 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {g.label}
            </button>
          ))}
        </nav>

        {/* Settings List */}
        <div className="flex-1 rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-200 px-6 py-4">
            <h3 className="text-sm font-semibold text-gray-900">
              {groups.find((g) => g.key === activeGroup)?.label}
            </h3>
          </div>
          <div className="divide-y divide-gray-100">
            {filtered.map((s) => (
              <div key={s.key} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">{s.description}</p>
                  <p className="text-xs text-gray-400">{s.key}</p>
                </div>
                <div className="text-right">
                  <span className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-mono text-gray-700">
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

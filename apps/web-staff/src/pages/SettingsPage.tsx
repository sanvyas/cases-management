import { useState } from 'react';
import { staffMembers } from '../data/mockData';
import { useAuth } from '../auth';

const SETTINGS_STORAGE_KEY = 'samadhan_settings';

interface TenantSettings {
  autoAssignEnabled: boolean;
  autoAssignRules: Array<{ department: string; assignee: string }>;
  [key: string]: unknown;
}

function getSettings(): TenantSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (raw) return JSON.parse(raw) as TenantSettings;
  } catch { /* noop */ }
  return { autoAssignEnabled: false, autoAssignRules: [] };
}

function saveSettings(settings: TenantSettings): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch { /* noop */ }
}

export function getAutoAssignEnabled(): boolean {
  return getSettings().autoAssignEnabled;
}

export function getAutoAssignRules(): Array<{ department: string; assignee: string }> {
  return getSettings().autoAssignRules;
}

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
  { key: 'messaging.primary_channel', value: 'whatsapp', description: 'Primary notification channel', group: 'messaging' },
  { key: 'messaging.sms_fallback', value: true, description: 'SMS fallback (OTP only)', group: 'messaging' },
  { key: 'messaging.whatsapp_business_id', value: '', description: 'WhatsApp Business API number', group: 'messaging' },
  { key: 'intake.phone_mode', value: 'inbound_only', description: 'Phone intake mode', group: 'intake' },
  { key: 'intake.channels_enabled', value: 'web,whatsapp,walk_in,phone_inbound', description: 'Enabled intake channels', group: 'intake' },
  { key: 'intake.media_compression', value: true, description: 'Auto-compress uploaded images', group: 'intake' },
  { key: 'intake.max_image_size_kb', value: 500, description: 'Max compressed image size (KB)', group: 'intake' },
  { key: 'intake.speech_engine', value: 'browser_native', description: 'Speech recognition engine', group: 'intake' },
  { key: 'security.staff_2fa_required', value: false, description: 'Require 2FA for staff', group: 'security' },
  { key: 'security.session_timeout_minutes', value: 30, description: 'Session timeout (minutes)', group: 'security' },
];

interface Permission {
  key: string;
  label: string;
  description: string;
}

const PERMISSIONS: Permission[] = [
  { key: 'dashboard.view', label: 'View Dashboard', description: 'Access dashboard KPIs and charts' },
  { key: 'cases.view', label: 'View Cases', description: 'View complaint list and details' },
  { key: 'cases.manage', label: 'Manage Cases', description: 'Update status, approve ATR, extend SLA' },
  { key: 'cases.assign', label: 'Assign Cases', description: 'Assign and reassign cases to staff' },
  { key: 'cases.comment', label: 'Add Comments', description: 'Post comments on cases' },
  { key: 'cases.approve', label: 'Approve ATR', description: 'Approve or return action taken reports' },
  { key: 'cases.status.change', label: 'Change Status', description: 'Update case status (in-progress, etc.)' },
  { key: 'cases.media.upload', label: 'Upload Media', description: 'Upload photos and videos on cases' },
  { key: 'cases.atr.submit', label: 'Submit ATR', description: 'Submit action taken report with evidence' },
  { key: 'cases.escalate', label: 'Escalate Cases', description: 'Escalate cases to higher authority' },
  { key: 'cases.register', label: 'Register Cases', description: 'Register new complaints on behalf of citizens' },
  { key: 'settings.view', label: 'View Settings', description: 'View tenant configuration' },
  { key: 'settings.edit', label: 'Edit Settings', description: 'Modify tenant settings' },
  { key: 'users.view', label: 'View Users', description: 'See staff list and activity' },
  { key: 'users.manage', label: 'Manage Users', description: 'Add, edit, deactivate staff accounts' },
  { key: 'citizen.pii.view', label: 'View Citizen PII', description: 'See unmasked phone numbers' },
  { key: 'reports.export', label: 'Export Reports', description: 'Download CSV and PDF reports' },
];

const ROLES = [
  { name: 'Supervising Officer', permissions: ['dashboard.view', 'cases.view', 'cases.manage', 'cases.assign', 'cases.comment', 'cases.approve', 'cases.status.change', 'cases.media.upload', 'cases.escalate', 'settings.view', 'settings.edit', 'users.view', 'users.manage', 'citizen.pii.view', 'reports.export'] },
  { name: 'Junior Engineer (Field)', permissions: ['dashboard.view', 'cases.view', 'cases.comment', 'cases.status.change', 'cases.media.upload', 'cases.atr.submit'] },
  { name: 'Sanitary Inspector', permissions: ['dashboard.view', 'cases.view', 'cases.comment', 'cases.status.change', 'cases.media.upload', 'cases.atr.submit'] },
  { name: 'Data Entry Operator', permissions: ['cases.view', 'cases.comment', 'cases.register'] },
];

const groups = [
  { key: 'general', label: 'General', icon: 'settings' },
  { key: 'case_rules', label: 'Case Rules', icon: 'gavel' },
  { key: 'auto_assign', label: 'Auto-Assign', icon: 'assignment_ind' },
  { key: 'intake', label: 'Intake Channels', icon: 'call_received' },
  { key: 'messaging', label: 'Notifications', icon: 'notifications' },
  { key: 'security', label: 'Security', icon: 'shield' },
  { key: 'permissions', label: 'Permissions', icon: 'admin_panel_settings' },
  { key: 'users', label: 'Users & Tracking', icon: 'group' },
];

const DEPARTMENTS = ['Water Works', 'Sanitation', 'Electrical', 'Public Works', 'Sewerage', 'Revenue', 'Welfare', 'Administration'];

export function SettingsPage() {
  const { hasPermission } = useAuth();
  const canEdit = hasPermission('settings.edit');
  const [activeGroup, setActiveGroup] = useState('general');
  const filtered = SETTINGS.filter((s) => s.group === activeGroup);

  const [tenantSettings, setTenantSettings] = useState(() => getSettings());
  const [newRuleDept, setNewRuleDept] = useState('');
  const [newRuleAssignee, setNewRuleAssignee] = useState('');

  function toggleAutoAssign() {
    const updated = { ...tenantSettings, autoAssignEnabled: !tenantSettings.autoAssignEnabled };
    setTenantSettings(updated);
    saveSettings(updated);
  }

  function addAutoAssignRule() {
    if (!newRuleDept || !newRuleAssignee) return;
    const rules = [...tenantSettings.autoAssignRules, { department: newRuleDept, assignee: newRuleAssignee }];
    const updated = { ...tenantSettings, autoAssignRules: rules };
    setTenantSettings(updated);
    saveSettings(updated);
    setNewRuleDept('');
    setNewRuleAssignee('');
  }

  function removeAutoAssignRule(idx: number) {
    const rules = tenantSettings.autoAssignRules.filter((_, i) => i !== idx);
    const updated = { ...tenantSettings, autoAssignRules: rules };
    setTenantSettings(updated);
    saveSettings(updated);
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-extrabold text-dark">Settings</h2>
        <p className="text-sm text-dark-muted">Tenant configuration and user management</p>
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

          {/* Standard settings groups */}
          {(activeGroup === 'general' || activeGroup === 'case_rules' || activeGroup === 'messaging' || activeGroup === 'intake' || activeGroup === 'security') && (
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
          )}

          {/* Auto-Assign */}
          {activeGroup === 'auto_assign' && (
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-extrabold text-dark">Auto-Assign Cases</h4>
                  <p className="text-xs text-dark-muted mt-0.5">
                    Automatically assign new cases to staff based on department
                  </p>
                </div>
                <button
                  onClick={toggleAutoAssign}
                  disabled={!canEdit}
                  className="relative w-14 h-8 rounded-full transition-colors disabled:opacity-50"
                  style={{ background: tenantSettings.autoAssignEnabled ? '#2F7D4F' : '#E3D6C6' }}
                >
                  <span
                    className="absolute top-1 w-6 h-6 rounded-full bg-white transition-transform"
                    style={{ left: tenantSettings.autoAssignEnabled ? 30 : 4 }}
                  />
                </button>
              </div>

              {tenantSettings.autoAssignEnabled && (
                <>
                  <div className="rounded-xl bg-cream p-4">
                    <div className="flex items-start gap-2 text-sm">
                      <span className="material-symbols-rounded text-lg text-info mt-0.5">info</span>
                      <p className="text-dark-secondary">
                        When enabled, new cases are automatically assigned to the configured staff member for each department. Cases without a matching rule remain unassigned.
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-extrabold text-dark mb-3">Assignment Rules</h4>
                    {tenantSettings.autoAssignRules.length > 0 ? (
                      <div className="rounded-xl border border-cream-darker overflow-hidden mb-4">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-cream">
                              <th className="text-left px-4 py-2.5 font-bold text-dark-muted">Department</th>
                              <th className="text-left px-4 py-2.5 font-bold text-dark-muted">Default Assignee</th>
                              <th className="text-right px-4 py-2.5 font-bold text-dark-muted">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-cream">
                            {tenantSettings.autoAssignRules.map((rule, idx) => (
                              <tr key={idx}>
                                <td className="px-4 py-3 font-bold text-dark">{rule.department}</td>
                                <td className="px-4 py-3 text-dark-secondary">{rule.assignee}</td>
                                <td className="px-4 py-3 text-right">
                                  <button
                                    onClick={() => removeAutoAssignRule(idx)}
                                    disabled={!canEdit}
                                    className="text-danger hover:underline text-xs font-bold disabled:opacity-50"
                                  >
                                    Remove
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="rounded-xl bg-cream p-6 text-center text-sm text-dark-muted mb-4">
                        No rules configured. Add a rule below.
                      </div>
                    )}

                    {canEdit && (
                      <div className="flex gap-3 items-end">
                        <div className="flex-1">
                          <label className="block text-xs font-bold text-dark-muted mb-1">Department</label>
                          <select
                            value={newRuleDept}
                            onChange={e => setNewRuleDept(e.target.value)}
                            className="w-full h-10 rounded-xl border-2 border-cream-darker bg-cream px-3 text-sm outline-none focus:border-primary"
                          >
                            <option value="">Select...</option>
                            {DEPARTMENTS.filter(d => !tenantSettings.autoAssignRules.some(r => r.department === d)).map(d => (
                              <option key={d} value={d}>{d}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs font-bold text-dark-muted mb-1">Assignee</label>
                          <select
                            value={newRuleAssignee}
                            onChange={e => setNewRuleAssignee(e.target.value)}
                            className="w-full h-10 rounded-xl border-2 border-cream-darker bg-cream px-3 text-sm outline-none focus:border-primary"
                          >
                            <option value="">Select...</option>
                            {staffMembers
                              .filter(s => !newRuleDept || s.department === newRuleDept || true)
                              .map(s => (
                                <option key={s.id} value={s.name}>{s.name} ({s.department})</option>
                              ))}
                          </select>
                        </div>
                        <button
                          onClick={addAutoAssignRule}
                          disabled={!newRuleDept || !newRuleAssignee}
                          className="h-10 px-4 rounded-xl bg-primary text-white text-sm font-bold flex items-center gap-1 disabled:opacity-40"
                        >
                          <span className="material-symbols-rounded text-lg">add</span>
                          Add
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Permissions */}
          {activeGroup === 'permissions' && (
            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-sm font-extrabold text-dark mb-3">Role-based Permissions</h4>
                <div className="rounded-xl border border-cream-darker overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-cream">
                        <th className="text-left px-4 py-2.5 font-bold text-dark-muted">Permission</th>
                        {ROLES.map(r => (
                          <th key={r.name} className="text-center px-3 py-2.5 font-bold text-dark-muted">{r.name}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-cream">
                      {PERMISSIONS.map(p => (
                        <tr key={p.key}>
                          <td className="px-4 py-2.5">
                            <div className="font-bold text-dark">{p.label}</div>
                            <div className="text-xs text-dark-muted">{p.description}</div>
                          </td>
                          {ROLES.map(r => (
                            <td key={r.name} className="text-center px-3 py-2.5">
                              {r.permissions.includes(p.key) ? (
                                <span className="material-symbols-rounded text-xl text-success">check_circle</span>
                              ) : (
                                <span className="material-symbols-rounded text-xl text-dark-faint">cancel</span>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Users & Tracking */}
          {activeGroup === 'users' && (
            <div className="p-6 space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-extrabold text-dark">Staff Directory</h4>
                  <button className="flex items-center gap-1 h-9 px-4 rounded-xl bg-primary text-white text-sm font-bold">
                    <span className="material-symbols-rounded text-lg">person_add</span>
                    Add User
                  </button>
                </div>
                <div className="rounded-xl border border-cream-darker overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-cream">
                        <th className="text-left px-4 py-2.5 font-bold text-dark-muted">Name</th>
                        <th className="text-left px-4 py-2.5 font-bold text-dark-muted">Designation</th>
                        <th className="text-left px-4 py-2.5 font-bold text-dark-muted">Department</th>
                        <th className="text-left px-4 py-2.5 font-bold text-dark-muted">Status</th>
                        <th className="text-left px-4 py-2.5 font-bold text-dark-muted">Last Active</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-cream">
                      {staffMembers.map((s) => (
                        <tr key={s.id}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cream-dark text-xs font-bold text-dark">
                                {s.name.split(' ').slice(-2).map(n => n[0]).join('')}
                              </span>
                              <span className="font-bold text-dark">{s.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-dark-secondary">{s.designation}</td>
                          <td className="px-4 py-3 text-dark-secondary">{s.department}</td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-bold bg-success-light text-success">
                              <span className="w-1.5 h-1.5 rounded-full bg-success" />
                              Active
                            </span>
                          </td>
                          <td className="px-4 py-3 text-dark-muted text-xs">
                            {new Date(Date.now() - Math.random() * 86400000).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-extrabold text-dark mb-3">Activity Log</h4>
                <div className="rounded-xl bg-cream p-4 space-y-3">
                  {[
                    { action: 'Assigned case GRV-2026-00142', actor: 'Aarav Mehta', time: '2 hours ago', icon: 'person_add' },
                    { action: 'Approved ATR for GRV-2026-00146', actor: 'Aarav Mehta', time: '5 hours ago', icon: 'check_circle' },
                    { action: 'Extended SLA for GRV-2026-00144', actor: 'Aarav Mehta', time: '1 day ago', icon: 'more_time' },
                    { action: 'Changed assignee for GRV-2026-00143', actor: 'Aarav Mehta', time: '1 day ago', icon: 'swap_horiz' },
                    { action: 'Added comment on GRV-2026-00148', actor: 'Aarav Mehta', time: '2 days ago', icon: 'chat' },
                  ].map((log, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-none">
                        <span className="material-symbols-rounded text-base text-dark-muted">{log.icon}</span>
                      </span>
                      <div className="flex-1">
                        <span className="font-bold text-dark">{log.actor}</span>
                        <span className="text-dark-secondary"> {log.action}</span>
                      </div>
                      <span className="text-xs text-dark-muted flex-none">{log.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

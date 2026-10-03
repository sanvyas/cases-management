import { useState, useMemo } from 'react';
import { getAuditLog, type AuditEntry } from '../platformConfig';

const ACTION_LABELS: Record<string, { label: string; icon: string; bg: string; fg: string }> = {
  config_change: { label: 'Config Changed', icon: 'settings', bg: '#E0F0FF', fg: '#2F6690' },
  deploy: { label: 'Deployed', icon: 'rocket_launch', bg: '#E6F5EC', fg: '#2F7D4F' },
  module_toggle: { label: 'Module Toggled', icon: 'extension', bg: '#F3E8FF', fg: '#6B21A8' },
  role_toggle: { label: 'Role Toggled', icon: 'admin_panel_settings', bg: '#FFF4D6', fg: '#8A5A00' },
};

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

function truncate(str: string, len: number): string {
  if (str.length <= len) return str;
  return str.slice(0, len) + '...';
}

export function AuditLogPage() {
  const [entries, setEntries] = useState<AuditEntry[]>(() => getAuditLog());
  const [filterTenant, setFilterTenant] = useState('all');
  const [filterAction, setFilterAction] = useState('all');
  const [filterSection, setFilterSection] = useState('all');

  const tenants = useMemo(() => {
    const set = new Set(entries.map(e => e.tenantName));
    return Array.from(set).sort();
  }, [entries]);

  const sections = useMemo(() => {
    const set = new Set(entries.map(e => e.section));
    return Array.from(set).sort();
  }, [entries]);

  const filtered = useMemo(() => {
    return entries.filter(e => {
      if (filterTenant !== 'all' && e.tenantName !== filterTenant) return false;
      if (filterAction !== 'all' && e.action !== filterAction) return false;
      if (filterSection !== 'all' && e.section !== filterSection) return false;
      return true;
    });
  }, [entries, filterTenant, filterAction, filterSection]);

  function handleRefresh() {
    setEntries(getAuditLog());
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-dark">Audit Log</h2>
          <p className="text-sm text-dark-muted">Track all configuration changes across environments</p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex h-10 items-center gap-2 rounded-xl border-2 border-cream-darker bg-white px-4 text-sm font-bold text-dark hover:bg-cream"
        >
          <span className="material-symbols-rounded text-lg">refresh</span>
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-dark-muted">Tenant:</span>
          <select
            value={filterTenant}
            onChange={e => setFilterTenant(e.target.value)}
            className="h-9 rounded-xl border-2 border-cream-darker bg-cream px-3 text-sm font-bold text-dark outline-none focus:border-primary appearance-none cursor-pointer pr-8"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%234A3E34' d='M2 4l4 4 4-4'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}
          >
            <option value="all">All Tenants</option>
            {tenants.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-dark-muted">Action:</span>
          <select
            value={filterAction}
            onChange={e => setFilterAction(e.target.value)}
            className="h-9 rounded-xl border-2 border-cream-darker bg-cream px-3 text-sm font-bold text-dark outline-none focus:border-primary appearance-none cursor-pointer pr-8"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%234A3E34' d='M2 4l4 4 4-4'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}
          >
            <option value="all">All Actions</option>
            <option value="config_change">Config Changed</option>
            <option value="deploy">Deployed</option>
            <option value="module_toggle">Module Toggled</option>
            <option value="role_toggle">Role Toggled</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-dark-muted">Section:</span>
          <select
            value={filterSection}
            onChange={e => setFilterSection(e.target.value)}
            className="h-9 rounded-xl border-2 border-cream-darker bg-cream px-3 text-sm font-bold text-dark outline-none focus:border-primary appearance-none cursor-pointer pr-8"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%234A3E34' d='M2 4l4 4 4-4'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}
          >
            <option value="all">All Sections</option>
            {sections.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="flex-1" />
        <span className="flex items-center text-xs font-bold text-dark-muted">
          {filtered.length} {filtered.length === 1 ? 'entry' : 'entries'}
        </span>
      </div>

      {/* Log table */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center" style={{ boxShadow: '0 1px 0 #EADFD2' }}>
          <span className="material-symbols-rounded text-5xl text-cream-darker mb-3 block">history</span>
          <p className="text-sm font-bold text-dark-muted">No audit entries yet</p>
          <p className="text-xs text-dark-muted mt-1">Changes will appear here when you modify and deploy configurations</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-white overflow-hidden" style={{ boxShadow: '0 1px 0 #EADFD2' }}>
          <div className="overflow-x-auto max-h-[calc(100vh-280px)] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="bg-cream text-left text-xs font-bold uppercase text-dark-muted">
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Tenant</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Section</th>
                  <th className="px-4 py-3">Field</th>
                  <th className="px-4 py-3">Old Value</th>
                  <th className="px-4 py-3">New Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream">
                {filtered.map(entry => {
                  const actionMeta = ACTION_LABELS[entry.action] || ACTION_LABELS['config_change']!;
                  return (
                    <tr key={entry.id} className="hover:bg-cream/50">
                      <td className="px-4 py-3 text-xs text-dark-muted whitespace-nowrap">
                        {formatTimestamp(entry.timestamp)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white flex-none" style={{ background: '#C24E33' }}>
                            {entry.userName.split(' ').map(n => n[0]).join('')}
                          </span>
                          <span className="text-xs font-bold text-dark whitespace-nowrap">{entry.userName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs font-bold text-dark max-w-[160px] truncate">
                        {entry.tenantName}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-bold whitespace-nowrap"
                          style={{ background: actionMeta.bg, color: actionMeta.fg }}
                        >
                          <span className="material-symbols-rounded text-sm">{actionMeta.icon}</span>
                          {actionMeta.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-dark-muted whitespace-nowrap">{entry.section}</td>
                      <td className="px-4 py-3 text-xs font-bold text-dark whitespace-nowrap">{entry.field}</td>
                      <td className="px-4 py-3">
                        {entry.oldValue && (
                          <span className="inline-block rounded-lg px-2 py-0.5 text-[11px] font-bold max-w-[140px] truncate" style={{ background: '#FEE4E2', color: '#B91C1C' }} title={entry.oldValue}>
                            {truncate(entry.oldValue, 24)}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-block rounded-lg px-2 py-0.5 text-[11px] font-bold max-w-[140px] truncate" style={{ background: '#E6F5EC', color: '#2F7D4F' }} title={entry.newValue}>
                          {truncate(entry.newValue, 24)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

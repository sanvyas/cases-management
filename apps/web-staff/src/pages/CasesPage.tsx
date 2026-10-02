import { useState, useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import { mockCases, STATUS_CONFIG, PRIORITY_CONFIG } from '../data/mockData';
import type { CaseStatus } from '../types';

type Tab = 'all' | 'assigned' | 'overdue' | 'atr' | 'resolved';

const tabs: { key: Tab; label: string; icon: string }[] = [
  { key: 'all', label: 'All Open', icon: 'folder_open' },
  { key: 'assigned', label: 'Assigned', icon: 'person_add' },
  { key: 'overdue', label: 'Overdue', icon: 'warning' },
  { key: 'atr', label: 'Needs Review', icon: 'approval' },
  { key: 'resolved', label: 'Resolved', icon: 'task_alt' },
];

const statusFilters: Record<Tab, (s: CaseStatus) => boolean> = {
  all: (s) => !['CLOSED'].includes(s),
  assigned: (s) => s === 'ASSIGNED' || s === 'ACCEPTED',
  overdue: (s) => s === 'OVERDUE',
  atr: (s) => s === 'ATR_SUBMITTED',
  resolved: (s) => s === 'RESOLVED',
};

export function CasesPage() {
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let cases = mockCases.filter((c) => statusFilters[activeTab](c.status));
    if (search) {
      const q = search.toLowerCase();
      cases = cases.filter(
        (c) =>
          c.caseNumber.toLowerCase().includes(q) ||
          c.complaintType.toLowerCase().includes(q) ||
          c.citizenName.toLowerCase().includes(q) ||
          c.location.toLowerCase().includes(q),
      );
    }
    return cases;
  }, [activeTab, search]);

  const counts: Record<Tab, number> = {
    all: mockCases.filter((c) => statusFilters.all(c.status)).length,
    assigned: mockCases.filter((c) => statusFilters.assigned(c.status)).length,
    overdue: mockCases.filter((c) => statusFilters.overdue(c.status)).length,
    atr: mockCases.filter((c) => statusFilters.atr(c.status)).length,
    resolved: mockCases.filter((c) => statusFilters.resolved(c.status)).length,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-dark">Cases</h2>
          <p className="text-sm text-dark-muted">Manage all grievance cases</p>
        </div>
        <div className="relative">
          <span className="material-symbols-rounded absolute left-3 top-1/2 -translate-y-1/2 text-xl text-dark-muted">search</span>
          <input
            type="text"
            placeholder="Search cases..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-xl border-2 border-cream-darker bg-cream pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold transition-all flex-none"
            style={{
              background: activeTab === tab.key ? '#C24E33' : '#fff',
              color: activeTab === tab.key ? '#fff' : '#4A3E34',
              boxShadow: activeTab !== tab.key ? '0 1px 0 #EADFD2' : 'none',
            }}
          >
            <span className="material-symbols-rounded text-lg">{tab.icon}</span>
            {tab.label}
            <span
              className="ml-0.5 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-bold"
              style={{
                background: activeTab === tab.key ? 'rgba(255,255,255,0.25)' : '#E9E3DB',
                color: activeTab === tab.key ? '#fff' : '#4A3E34',
              }}
            >
              {counts[tab.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Case List */}
      <div className="rounded-2xl bg-white" style={{ boxShadow: '0 1px 0 #EADFD2' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cream-darker text-left text-xs font-bold uppercase text-dark-muted">
                <th className="px-4 py-3">Case</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Assignee</th>
                <th className="px-4 py-3">SLA Due</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const st = STATUS_CONFIG[c.status];
                const pr = PRIORITY_CONFIG[c.priority];
                return (
                  <tr key={c.id} className="border-b border-cream hover:bg-cream/50">
                    <td className="px-4 py-3">
                      <Link
                        to="/cases/$caseId"
                        params={{ caseId: c.id }}
                        className="font-bold text-primary hover:underline"
                      >
                        {c.caseNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-rounded text-lg" style={{ color: c.iconFg }}>{c.icon}</span>
                        <div>
                          <p className="font-bold text-dark">{c.complaintType}</p>
                          <p className="text-xs text-dark-muted">{c.subType}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-dark-secondary">{c.zone}, {c.ward}</td>
                    <td className="px-4 py-3">
                      {pr && (
                        <span className="rounded-lg px-2 py-0.5 text-xs font-bold" style={{ background: pr.bg, color: pr.fg }}>
                          {pr.label}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {st && (
                        <span className="flex items-center gap-1 rounded-xl px-2 py-0.5 text-xs font-bold w-fit" style={{ background: st.bg, color: st.fg }}>
                          <span className="material-symbols-rounded text-sm">{st.icon}</span>
                          {st.label}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-dark-secondary">{c.assignee || '—'}</td>
                    <td className="px-4 py-3 text-xs text-dark-muted">
                      {new Date(c.slaDueAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <p className="px-6 py-8 text-center text-sm text-dark-muted">No cases found.</p>
        )}
      </div>
    </div>
  );
}

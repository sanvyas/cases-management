import { useState, useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import { mockCases } from '../data/mockData';
import type { CaseStatus } from '../types';

type Tab = 'all' | 'assigned' | 'overdue' | 'dueToday' | 'resolved';

const tabs: { key: Tab; label: string }[] = [
  { key: 'all', label: 'All Open' },
  { key: 'assigned', label: 'Assigned' },
  { key: 'overdue', label: 'Overdue' },
  { key: 'dueToday', label: 'Due Today' },
  { key: 'resolved', label: 'Resolved' },
];

const tabCountMap: Record<Tab, number> = {
  all: 342,
  assigned: 156,
  overdue: 28,
  dueToday: 45,
  resolved: 0,
};

const statusFilters: Record<Tab, (s: CaseStatus) => boolean> = {
  all: (s) => !['CLOSED'].includes(s),
  assigned: (s) => s === 'ASSIGNED',
  overdue: (s) => s === 'OVERDUE',
  dueToday: (s) => s === 'ASSIGNED' || s === 'IN_PROGRESS',
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Cases</h2>
        <input
          type="text"
          placeholder="Search cases..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
            <span className="ml-1.5 text-xs opacity-60">
              {tabCountMap[tab.key] || ''}
            </span>
          </button>
        ))}
      </div>

      {/* Case List */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs font-medium uppercase text-gray-500">
                <th className="px-4 py-3">Case #</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Assignee</th>
                <th className="px-4 py-3">SLA Due</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link
                      to="/cases/$caseId"
                      params={{ caseId: c.id }}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      {c.caseNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-gray-900">{c.complaintType}</p>
                      <p className="text-xs text-gray-500">{c.subType}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{c.zone}, {c.ward}</td>
                  <td className="px-4 py-3">
                    <PriorityBadge priority={c.priority} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-4 py-3 text-gray-600">{c.assignee || '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {new Date(c.slaDueAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <p className="px-6 py-8 text-center text-sm text-gray-500">No cases found.</p>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    REGISTERED: 'bg-gray-100 text-gray-800',
    ASSIGNED: 'bg-blue-100 text-blue-800',
    ACCEPTED: 'bg-indigo-100 text-indigo-800',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
    ATR_SUBMITTED: 'bg-purple-100 text-purple-800',
    RESOLVED: 'bg-green-100 text-green-800',
    CLOSED: 'bg-slate-100 text-slate-800',
    OVERDUE: 'bg-red-100 text-red-800',
    REOPENED: 'bg-orange-100 text-orange-800',
  };
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[status] ?? 'bg-gray-100 text-gray-800'}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    CRITICAL: 'text-red-700 bg-red-50',
    HIGH: 'text-orange-700 bg-orange-50',
    MEDIUM: 'text-yellow-700 bg-yellow-50',
    LOW: 'text-green-700 bg-green-50',
  };
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${colors[priority] ?? ''}`}>
      {priority}
    </span>
  );
}

import { useState, useMemo, useCallback } from 'react';
import { Link } from '@tanstack/react-router';
import { mockCases, STATUS_CONFIG, PRIORITY_CONFIG } from '../data/mockData';
import { getCitizenCasesAsStaffCases } from '../store';
import type { Case, CaseStatus } from '../types';

type Tab = 'all' | 'assigned' | 'overdue' | 'atr' | 'resolved';
type SortField = 'caseNumber' | 'complaintType' | 'location' | 'priority' | 'status' | 'assignee' | 'registeredAt' | 'slaDueAt';
type SortDir = 'asc' | 'desc';

const tabs: { key: Tab; label: string; icon: string }[] = [
  { key: 'all', label: 'All Open', icon: 'folder_open' },
  { key: 'assigned', label: 'Assigned', icon: 'person_add' },
  { key: 'overdue', label: 'Overdue', icon: 'warning' },
  { key: 'atr', label: 'Needs Review', icon: 'approval' },
  { key: 'resolved', label: 'Resolved', icon: 'task_alt' },
];

const statusFilters: Record<Tab, (s: CaseStatus) => boolean> = {
  all: (s) => !['CLOSED'].includes(s),
  assigned: (s) => s === 'ASSIGNED',
  overdue: (s) => s === 'OVERDUE',
  atr: (s) => s === 'ATR_SUBMITTED',
  resolved: (s) => s === 'RESOLVED',
};

const PRIORITY_ORDER: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };

function getAllCases(): Case[] {
  const citizenCases = getCitizenCasesAsStaffCases();
  return [...citizenCases, ...mockCases];
}

export function CasesPage() {
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('registeredAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [filterType, setFilterType] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterAssignee, setFilterAssignee] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const allCases = useMemo(() => getAllCases(), []);

  const types = useMemo(() => [...new Set(allCases.map(c => c.complaintType))].sort(), [allCases]);
  const departments = useMemo(() => [...new Set(allCases.map(c => c.department))].sort(), [allCases]);
  const assignees = useMemo(() => [...new Set(allCases.filter(c => c.assignee).map(c => c.assignee))].sort(), [allCases]);

  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  }, [sortField]);

  const filtered = useMemo(() => {
    let cases = allCases.filter((c) => statusFilters[activeTab](c.status));

    if (search) {
      const q = search.toLowerCase();
      cases = cases.filter(
        (c) =>
          c.caseNumber.toLowerCase().includes(q) ||
          c.complaintType.toLowerCase().includes(q) ||
          c.citizenName.toLowerCase().includes(q) ||
          c.location.toLowerCase().includes(q) ||
          c.department.toLowerCase().includes(q) ||
          c.assignee.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q),
      );
    }

    if (filterType) cases = cases.filter(c => c.complaintType === filterType);
    if (filterDept) cases = cases.filter(c => c.department === filterDept);
    if (filterAssignee) cases = cases.filter(c => c.assignee === filterAssignee);
    if (filterPriority) cases = cases.filter(c => c.priority === filterPriority);
    if (dateFrom) cases = cases.filter(c => c.registeredAt >= dateFrom);
    if (dateTo) cases = cases.filter(c => c.registeredAt <= dateTo + 'T23:59:59Z');

    cases.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'caseNumber': cmp = a.caseNumber.localeCompare(b.caseNumber); break;
        case 'complaintType': cmp = a.complaintType.localeCompare(b.complaintType); break;
        case 'location': cmp = a.location.localeCompare(b.location); break;
        case 'priority': cmp = (PRIORITY_ORDER[a.priority] ?? 9) - (PRIORITY_ORDER[b.priority] ?? 9); break;
        case 'status': cmp = a.status.localeCompare(b.status); break;
        case 'assignee': cmp = a.assignee.localeCompare(b.assignee); break;
        case 'registeredAt': cmp = a.registeredAt.localeCompare(b.registeredAt); break;
        case 'slaDueAt': cmp = a.slaDueAt.localeCompare(b.slaDueAt); break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return cases;
  }, [activeTab, search, sortField, sortDir, filterType, filterDept, filterAssignee, filterPriority, dateFrom, dateTo, allCases]);

  const counts: Record<Tab, number> = useMemo(() => ({
    all: allCases.filter((c) => statusFilters.all(c.status)).length,
    assigned: allCases.filter((c) => statusFilters.assigned(c.status)).length,
    overdue: allCases.filter((c) => statusFilters.overdue(c.status)).length,
    atr: allCases.filter((c) => statusFilters.atr(c.status)).length,
    resolved: allCases.filter((c) => statusFilters.resolved(c.status)).length,
  }), [allCases]);

  const activeFilterCount = [filterType, filterDept, filterAssignee, filterPriority, dateFrom, dateTo].filter(Boolean).length;

  function clearFilters() {
    setFilterType('');
    setFilterDept('');
    setFilterAssignee('');
    setFilterPriority('');
    setDateFrom('');
    setDateTo('');
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) return <span className="material-symbols-rounded text-sm text-dark-faint">unfold_more</span>;
    return <span className="material-symbols-rounded text-sm text-primary">{sortDir === 'asc' ? 'arrow_upward' : 'arrow_downward'}</span>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-dark">Cases</h2>
          <p className="text-sm text-dark-muted">Manage all grievance cases</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1 h-10 px-3 rounded-xl text-sm font-bold transition-colors"
            style={{
              background: showFilters || activeFilterCount > 0 ? '#C24E33' : '#fff',
              color: showFilters || activeFilterCount > 0 ? '#fff' : '#4A3E34',
              boxShadow: showFilters || activeFilterCount > 0 ? 'none' : '0 1px 0 #EADFD2',
            }}
          >
            <span className="material-symbols-rounded text-lg">filter_list</span>
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-0.5 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-bold bg-white/25">
                {activeFilterCount}
              </span>
            )}
          </button>
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
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="rounded-2xl bg-white p-4" style={{ boxShadow: '0 1px 0 #EADFD2' }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-extrabold text-dark">Filter Cases</h3>
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="text-xs font-bold text-primary">Clear all</button>
            )}
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-dark-muted mb-1 block">Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full h-9 rounded-lg border border-cream-darker bg-cream px-2 text-sm outline-none"
              >
                <option value="">All types</option>
                {types.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-dark-muted mb-1 block">Department</label>
              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="w-full h-9 rounded-lg border border-cream-darker bg-cream px-2 text-sm outline-none"
              >
                <option value="">All departments</option>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-dark-muted mb-1 block">Assignee</label>
              <select
                value={filterAssignee}
                onChange={(e) => setFilterAssignee(e.target.value)}
                className="w-full h-9 rounded-lg border border-cream-darker bg-cream px-2 text-sm outline-none"
              >
                <option value="">All assignees</option>
                {assignees.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-dark-muted mb-1 block">Priority</label>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="w-full h-9 rounded-lg border border-cream-darker bg-cream px-2 text-sm outline-none"
              >
                <option value="">All priorities</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-dark-muted mb-1 block">From date</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full h-9 rounded-lg border border-cream-darker bg-cream px-2 text-sm outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-dark-muted mb-1 block">To date</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full h-9 rounded-lg border border-cream-darker bg-cream px-2 text-sm outline-none"
              />
            </div>
          </div>
        </div>
      )}

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

      {/* Results count */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-dark-muted">{filtered.length} cases</span>
      </div>

      {/* Case List */}
      <div className="rounded-2xl bg-white" style={{ boxShadow: '0 1px 0 #EADFD2' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cream-darker text-left text-xs font-bold uppercase text-dark-muted">
                <th className="px-4 py-3 cursor-pointer select-none" onClick={() => handleSort('caseNumber')}>
                  <span className="flex items-center gap-1">Case <SortIcon field="caseNumber" /></span>
                </th>
                <th className="px-4 py-3 cursor-pointer select-none" onClick={() => handleSort('complaintType')}>
                  <span className="flex items-center gap-1">Type <SortIcon field="complaintType" /></span>
                </th>
                <th className="px-4 py-3 cursor-pointer select-none" onClick={() => handleSort('location')}>
                  <span className="flex items-center gap-1">Location <SortIcon field="location" /></span>
                </th>
                <th className="px-4 py-3 cursor-pointer select-none" onClick={() => handleSort('priority')}>
                  <span className="flex items-center gap-1">Priority <SortIcon field="priority" /></span>
                </th>
                <th className="px-4 py-3 cursor-pointer select-none" onClick={() => handleSort('status')}>
                  <span className="flex items-center gap-1">Status <SortIcon field="status" /></span>
                </th>
                <th className="px-4 py-3 cursor-pointer select-none" onClick={() => handleSort('assignee')}>
                  <span className="flex items-center gap-1">Assignee <SortIcon field="assignee" /></span>
                </th>
                <th className="px-4 py-3 cursor-pointer select-none" onClick={() => handleSort('slaDueAt')}>
                  <span className="flex items-center gap-1">SLA Due <SortIcon field="slaDueAt" /></span>
                </th>
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
                      {c.id.startsWith('citizen-') && (
                        <span className="ml-1 text-xs text-info font-bold">(Citizen)</span>
                      )}
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
                    <td className="px-4 py-3 text-dark-secondary max-w-48 truncate">{c.zone}{c.ward ? `, ${c.ward}` : ''}</td>
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

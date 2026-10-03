import { useState, useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import { dashboardKPIs, departmentSummaries, mockCases, STATUS_CONFIG, PRIORITY_CONFIG } from '../data/mockData';
import { getCitizenCasesAsStaffCases } from '../store';
import type { Case } from '../types';

function getAllCases(): Case[] {
  const citizen = getCitizenCasesAsStaffCases();
  return [...citizen, ...mockCases];
}

export function DashboardPage() {
  const allCases = useMemo(() => getAllCases(), []);

  const [filterDept, setFilterDept] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const departments = useMemo(() => [...new Set(allCases.map(c => c.department).filter(Boolean))].sort(), [allCases]);
  const priorities = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
  const statuses = useMemo(() => [...new Set(allCases.map(c => c.status))].sort(), [allCases]);

  const filtered = useMemo(() => {
    return allCases.filter(c => {
      if (filterDept && c.department !== filterDept) return false;
      if (filterPriority && c.priority !== filterPriority) return false;
      if (filterStatus && c.status !== filterStatus) return false;
      if (dateFrom && c.registeredAt < dateFrom) return false;
      if (dateTo) {
        const to = dateTo + 'T23:59:59Z';
        if (c.registeredAt > to) return false;
      }
      return true;
    });
  }, [allCases, filterDept, filterPriority, filterStatus, dateFrom, dateTo]);

  const activeFilterCount = [filterDept, filterPriority, filterStatus, dateFrom, dateTo].filter(Boolean).length;

  const pendingApproval = filtered.filter((c) => c.status === 'ATR_SUBMITTED');
  const overdueCases = filtered.filter((c) => c.status === 'OVERDUE');
  const recentCases = filtered.slice(0, 5);

  const liveKPIs = useMemo(() => {
    const total = filtered.length;
    const open = filtered.filter(c => !['CLOSED', 'RESOLVED'].includes(c.status)).length;
    const overdue = filtered.filter(c => c.status === 'OVERDUE').length;
    const resolved = filtered.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length;
    return [
      { ...dashboardKPIs[0]!, value: total.toLocaleString('en-IN') },
      { ...dashboardKPIs[1]!, value: open },
      { ...dashboardKPIs[2]!, value: overdue },
      { ...dashboardKPIs[3]!, value: resolved },
      dashboardKPIs[4]!,
      dashboardKPIs[5]!,
    ];
  }, [filtered]);

  const liveDeptSummaries = useMemo(() => {
    if (!activeFilterCount) return departmentSummaries;
    const deptMap = new Map<string, { total: number; open: number; overdue: number; resolved: number }>();
    for (const c of filtered) {
      const dept = c.department || 'Other';
      const entry = deptMap.get(dept) || { total: 0, open: 0, overdue: 0, resolved: 0 };
      entry.total++;
      if (c.status === 'RESOLVED' || c.status === 'CLOSED') entry.resolved++;
      else if (c.status === 'OVERDUE') { entry.overdue++; entry.open++; }
      else entry.open++;
      deptMap.set(dept, entry);
    }
    const iconMap: Record<string, string> = {};
    for (const ds of departmentSummaries) iconMap[ds.department] = ds.icon;
    return [...deptMap.entries()].map(([dept, d]) => ({
      department: dept,
      icon: iconMap[dept] || 'apartment',
      total: d.total,
      open: d.open,
      overdue: d.overdue,
      resolved: d.resolved,
      avgDays: departmentSummaries.find(ds => ds.department === dept)?.avgDays ?? 0,
    }));
  }, [filtered, activeFilterCount]);

  function clearFilters() {
    setFilterDept('');
    setFilterPriority('');
    setFilterStatus('');
    setDateFrom('');
    setDateTo('');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-dark">Dashboard</h2>
          <p className="text-sm text-dark-muted">Overview of all grievances</p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 h-10 px-4 rounded-xl border-2 border-cream-darker bg-white text-sm font-bold text-dark hover:bg-cream"
        >
          <span className="material-symbols-rounded text-lg">filter_list</span>
          Filters
          {activeFilterCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {showFilters && (
        <div className="rounded-2xl bg-white p-5" style={{ boxShadow: '0 1px 0 #EADFD2' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-extrabold text-dark">Filter Dashboard</h3>
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="text-xs font-bold text-primary hover:underline">
                Clear all
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            <div>
              <label className="block text-xs font-bold text-dark-muted mb-1">Department</label>
              <select
                value={filterDept}
                onChange={e => setFilterDept(e.target.value)}
                className="w-full h-10 rounded-xl border-2 border-cream-darker bg-cream px-3 text-sm outline-none focus:border-primary"
              >
                <option value="">All</option>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-dark-muted mb-1">Priority</label>
              <select
                value={filterPriority}
                onChange={e => setFilterPriority(e.target.value)}
                className="w-full h-10 rounded-xl border-2 border-cream-darker bg-cream px-3 text-sm outline-none focus:border-primary"
              >
                <option value="">All</option>
                {priorities.map(p => <option key={p} value={p}>{PRIORITY_CONFIG[p]?.label ?? p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-dark-muted mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="w-full h-10 rounded-xl border-2 border-cream-darker bg-cream px-3 text-sm outline-none focus:border-primary"
              >
                <option value="">All</option>
                {statuses.map(s => <option key={s} value={s}>{STATUS_CONFIG[s]?.label ?? s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-dark-muted mb-1">From Date</label>
              <input
                type="date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                className="w-full h-10 rounded-xl border-2 border-cream-darker bg-cream px-3 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-dark-muted mb-1">To Date</label>
              <input
                type="date"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
                className="w-full h-10 rounded-xl border-2 border-cream-darker bg-cream px-3 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        {liveKPIs.map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-2xl p-4 flex flex-col gap-1"
            style={{ background: kpi.bg }}
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-rounded text-xl" style={{ color: kpi.fg }}>{kpi.icon}</span>
              <span className="text-xs font-bold" style={{ color: kpi.fg }}>{kpi.label}</span>
            </div>
            <p className="text-2xl font-extrabold" style={{ color: kpi.fg }}>{kpi.value}</p>
            {kpi.change && (
              <p className="text-xs font-bold" style={{ color: kpi.fg }}>
                {kpi.trend === 'up' ? '↑' : kpi.trend === 'down' ? '↓' : ''} {kpi.change}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending Approvals */}
        <div className="rounded-2xl bg-white" style={{ boxShadow: '0 1px 0 #EADFD2' }}>
          <div className="flex items-center justify-between border-b border-cream-darker px-5 py-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-rounded text-xl text-warning">approval</span>
              <h3 className="text-base font-extrabold text-dark">Pending Approvals</h3>
              <span className="ml-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white bg-warning">{pendingApproval.length}</span>
            </div>
            <Link to="/cases" className="text-xs font-bold text-primary hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-cream-dark">
            {pendingApproval.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-dark-muted">No pending approvals</p>
            ) : (
              pendingApproval.map((c) => (
                <Link
                  key={c.id}
                  to="/cases/$caseId"
                  params={{ caseId: c.id }}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-cream/50"
                >
                  <span className="w-10 h-10 rounded-xl flex items-center justify-center flex-none" style={{ background: c.iconBg }}>
                    <span className="material-symbols-rounded text-xl" style={{ color: c.iconFg }}>{c.icon}</span>
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-dark">{c.caseNumber}</p>
                    <p className="text-xs text-dark-muted">{c.subType} · {c.assignee}</p>
                  </div>
                  <span className="material-symbols-rounded text-xl text-primary">chevron_right</span>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Overdue Cases */}
        <div className="rounded-2xl bg-white" style={{ boxShadow: '0 1px 0 #EADFD2' }}>
          <div className="flex items-center justify-between border-b border-cream-darker px-5 py-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-rounded text-xl text-danger">warning</span>
              <h3 className="text-base font-extrabold text-dark">Overdue</h3>
              <span className="ml-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white bg-danger">{overdueCases.length}</span>
            </div>
            <Link to="/cases" className="text-xs font-bold text-primary hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-cream-dark">
            {overdueCases.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-dark-muted">No overdue cases</p>
            ) : (
              overdueCases.map((c) => (
                <Link
                  key={c.id}
                  to="/cases/$caseId"
                  params={{ caseId: c.id }}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-cream/50"
                >
                  <span className="w-10 h-10 rounded-xl flex items-center justify-center flex-none" style={{ background: c.iconBg }}>
                    <span className="material-symbols-rounded text-xl" style={{ color: c.iconFg }}>{c.icon}</span>
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-dark">{c.caseNumber}</p>
                    <p className="text-xs text-dark-muted">{c.subType} · {c.location}</p>
                  </div>
                  <PriorityBadge priority={c.priority} />
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Department Summary */}
      <div className="rounded-2xl bg-white" style={{ boxShadow: '0 1px 0 #EADFD2' }}>
        <div className="border-b border-cream-darker px-5 py-4">
          <h3 className="text-base font-extrabold text-dark">Department Summary</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cream-dark text-left text-xs font-bold uppercase text-dark-muted">
                <th className="px-5 py-3">Department</th>
                <th className="px-5 py-3 text-right">Total</th>
                <th className="px-5 py-3 text-right">Open</th>
                <th className="px-5 py-3 text-right">Overdue</th>
                <th className="px-5 py-3 text-right">Resolved</th>
                <th className="px-5 py-3 text-right">Avg Days</th>
              </tr>
            </thead>
            <tbody>
              {liveDeptSummaries.map((d) => (
                <tr key={d.department} className="border-b border-cream hover:bg-cream/50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-rounded text-lg text-dark-muted">{d.icon}</span>
                      <span className="font-bold text-dark">{d.department}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-right font-bold">{d.total}</td>
                  <td className="px-5 py-3 text-right font-bold text-info">{d.open}</td>
                  <td className="px-5 py-3 text-right font-bold text-danger">{d.overdue}</td>
                  <td className="px-5 py-3 text-right font-bold text-success">{d.resolved}</td>
                  <td className="px-5 py-3 text-right text-dark-muted">{d.avgDays}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Cases */}
      <div className="rounded-2xl bg-white" style={{ boxShadow: '0 1px 0 #EADFD2' }}>
        <div className="flex items-center justify-between border-b border-cream-darker px-5 py-4">
          <h3 className="text-base font-extrabold text-dark">Recent Cases</h3>
          <Link to="/cases" className="text-xs font-bold text-primary hover:underline">View all</Link>
        </div>
        <div className="divide-y divide-cream-dark">
          {recentCases.map((c) => {
            const st = STATUS_CONFIG[c.status];
            return (
              <Link
                key={c.id}
                to="/cases/$caseId"
                params={{ caseId: c.id }}
                className="flex items-center gap-3 px-5 py-3 hover:bg-cream/50"
              >
                <span className="w-10 h-10 rounded-xl flex items-center justify-center flex-none" style={{ background: c.iconBg }}>
                  <span className="material-symbols-rounded text-xl" style={{ color: c.iconFg }}>{c.icon}</span>
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-dark">{c.caseNumber}</p>
                  <p className="text-xs text-dark-muted">{c.complaintType} · {c.subType}</p>
                </div>
                {st && (
                  <span className="flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-bold" style={{ background: st.bg, color: st.fg }}>
                    <span className="material-symbols-rounded text-sm">{st.icon}</span>
                    {st.label}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const cfg = PRIORITY_CONFIG[priority];
  if (!cfg) return null;
  return (
    <span className="rounded-lg px-2 py-0.5 text-xs font-bold" style={{ background: cfg.bg, color: cfg.fg }}>
      {cfg.label}
    </span>
  );
}

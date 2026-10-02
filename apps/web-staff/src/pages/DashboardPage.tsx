import { Link } from '@tanstack/react-router';
import { dashboardKPIs, departmentSummaries, mockCases, STATUS_CONFIG, PRIORITY_CONFIG } from '../data/mockData';

export function DashboardPage() {
  const pendingApproval = mockCases.filter((c) => c.status === 'ATR_SUBMITTED');
  const overdueCases = mockCases.filter((c) => c.status === 'OVERDUE');
  const recentCases = mockCases.slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-dark">Dashboard</h2>
        <p className="text-sm text-dark-muted">Overview of all grievances</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        {dashboardKPIs.map((kpi) => (
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
              {departmentSummaries.map((d) => (
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

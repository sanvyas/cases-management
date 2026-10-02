import { dashboardKPIs, departmentSummaries, mockCases } from '../data/mockData';

const statusColors: Record<string, string> = {
  green: 'bg-green-50 text-green-700 border-green-200',
  red: 'bg-red-50 text-red-700 border-red-200',
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  slate: 'bg-slate-50 text-slate-700 border-slate-200',
};

export function DashboardPage() {
  const recentCases = mockCases.slice(0, 5);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Dashboard</h2>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {dashboardKPIs.map((kpi) => (
          <div
            key={kpi.label}
            className={`rounded-xl border p-4 ${statusColors[kpi.color] ?? statusColors.slate}`}
          >
            <p className="text-xs font-medium opacity-75">{kpi.label}</p>
            <p className="mt-1 text-2xl font-bold">{kpi.value}</p>
            {kpi.change && (
              <p className="mt-1 text-xs">
                {kpi.trend === 'up' ? '↑' : kpi.trend === 'down' ? '↓' : ''} {kpi.change}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Department Summary */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-sm font-semibold text-gray-900">Department Summary</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs font-medium uppercase text-gray-500">
                <th className="px-6 py-3">Department</th>
                <th className="px-6 py-3 text-right">Total</th>
                <th className="px-6 py-3 text-right">Open</th>
                <th className="px-6 py-3 text-right">Overdue</th>
                <th className="px-6 py-3 text-right">Resolved</th>
                <th className="px-6 py-3 text-right">Avg Days</th>
              </tr>
            </thead>
            <tbody>
              {departmentSummaries.map((d) => (
                <tr key={d.department} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-6 py-3 font-medium text-gray-900">{d.department}</td>
                  <td className="px-6 py-3 text-right">{d.total}</td>
                  <td className="px-6 py-3 text-right text-blue-600">{d.open}</td>
                  <td className="px-6 py-3 text-right text-red-600">{d.overdue}</td>
                  <td className="px-6 py-3 text-right text-green-600">{d.resolved}</td>
                  <td className="px-6 py-3 text-right">{d.avgDays}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Cases */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-sm font-semibold text-gray-900">Recent Cases</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {recentCases.map((c) => (
            <div key={c.id} className="flex items-center justify-between px-6 py-3 hover:bg-gray-50">
              <div>
                <p className="text-sm font-medium text-gray-900">{c.caseNumber}</p>
                <p className="text-xs text-gray-500">{c.complaintType} &middot; {c.subType}</p>
              </div>
              <div className="text-right">
                <StatusBadge status={c.status} />
                <p className="mt-1 text-xs text-gray-500">{c.assignee || 'Unassigned'}</p>
              </div>
            </div>
          ))}
        </div>
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

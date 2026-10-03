import { useMemo } from 'react';
import { STATUS_STYLES } from '../data/mockData';
import type { Tenant } from '../types';

export function DashboardPage({ tenants, onNavigate }: { tenants: Tenant[]; onNavigate: (envId: string) => void }) {
  const stats = useMemo(() => {
    const active = tenants.filter(t => t.status === 'active').length;
    const trial = tenants.filter(t => t.status === 'trial').length;
    const totalCases = tenants.reduce((s, t) => s + t.totalCases, 0);
    const activeCases = tenants.reduce((s, t) => s + t.activeCases, 0);
    const totalStaff = tenants.reduce((s, t) => s + t.staffCount, 0);
    const totalCitizens = tenants.reduce((s, t) => s + t.citizenCount, 0);
    const monthlyRevenue = tenants.reduce((s, t) => s + t.monthlyRevenue, 0);
    const monthlyCost = tenants.reduce((s, t) => s + t.monthlyCost, 0);
    return { active, trial, totalCases, activeCases, totalStaff, totalCitizens, monthlyRevenue, monthlyCost };
  }, [tenants]);

  const kpis = [
    { label: 'Active Tenants', value: stats.active, icon: 'apartment', bg: '#E6F5EC', fg: '#2F7D4F' },
    { label: 'On Trial', value: stats.trial, icon: 'hourglass_top', bg: '#E0F0FF', fg: '#2F6690' },
    { label: 'Total Cases', value: stats.totalCases.toLocaleString('en-IN'), icon: 'folder_open', bg: '#FBE3D9', fg: '#C24E33' },
    { label: 'Active Cases', value: stats.activeCases.toLocaleString('en-IN'), icon: 'pending_actions', bg: '#FFF4D6', fg: '#8A5A00' },
    { label: 'Staff Users', value: stats.totalStaff, icon: 'badge', bg: '#F3E8FF', fg: '#6B21A8' },
    { label: 'Citizens', value: stats.totalCitizens.toLocaleString('en-IN'), icon: 'groups', bg: '#E9E3DB', fg: '#4A3E34' },
  ];

  const revenue = stats.monthlyRevenue;
  const cost = stats.monthlyCost;
  const margin = revenue > 0 ? ((revenue - cost) / revenue * 100).toFixed(0) : '0';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-dark">Platform Overview</h2>
        <p className="text-sm text-dark-muted">All deployments at a glance</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        {kpis.map(k => (
          <div key={k.label} className="rounded-2xl p-4 flex flex-col gap-1" style={{ background: k.bg }}>
            <div className="flex items-center gap-2">
              <span className="material-symbols-rounded text-xl" style={{ color: k.fg }}>{k.icon}</span>
              <span className="text-xs font-bold" style={{ color: k.fg }}>{k.label}</span>
            </div>
            <p className="text-2xl font-extrabold" style={{ color: k.fg }}>{k.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl bg-white p-5" style={{ boxShadow: '0 1px 0 #EADFD2' }}>
          <h3 className="text-sm font-extrabold text-dark mb-3">Monthly Revenue</h3>
          <p className="text-3xl font-extrabold text-success">
            {(revenue / 1000).toFixed(0)}K
          </p>
          <p className="text-xs text-dark-muted mt-1">INR per month</p>
        </div>
        <div className="rounded-2xl bg-white p-5" style={{ boxShadow: '0 1px 0 #EADFD2' }}>
          <h3 className="text-sm font-extrabold text-dark mb-3">Monthly Cost</h3>
          <p className="text-3xl font-extrabold text-danger">
            {(cost / 1000).toFixed(0)}K
          </p>
          <p className="text-xs text-dark-muted mt-1">INR per month</p>
        </div>
        <div className="rounded-2xl bg-white p-5" style={{ boxShadow: '0 1px 0 #EADFD2' }}>
          <h3 className="text-sm font-extrabold text-dark mb-3">Gross Margin</h3>
          <p className="text-3xl font-extrabold text-info">{margin}%</p>
          <p className="text-xs text-dark-muted mt-1">Revenue minus infra cost</p>
        </div>
      </div>

      <div className="rounded-2xl bg-white" style={{ boxShadow: '0 1px 0 #EADFD2' }}>
        <div className="border-b border-cream-darker px-5 py-4">
          <h3 className="text-base font-extrabold text-dark">All Environments</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cream-dark text-left text-xs font-bold uppercase text-dark-muted">
                <th className="px-5 py-3">Environment</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Plan</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Cases</th>
                <th className="px-5 py-3 text-right">Staff</th>
                <th className="px-5 py-3 text-right">Revenue</th>
                <th className="px-5 py-3 text-right">Cost</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {tenants.map(t => {
                const st = STATUS_STYLES[t.status]!;
                return (
                  <tr key={t.id} className="border-b border-cream hover:bg-cream/50 cursor-pointer" onClick={() => onNavigate(t.id)}>
                    <td className="px-5 py-3">
                      <div>
                        <p className="font-bold text-dark">{t.name}</p>
                        <p className="text-xs text-dark-muted">{t.state}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-dark-secondary">{t.type}</td>
                    <td className="px-5 py-3">
                      <span className="rounded-lg bg-cream px-2 py-0.5 text-xs font-bold text-dark">{t.planName}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-bold" style={{ background: st.bg, color: st.fg }}>
                        <span className="material-symbols-rounded text-sm">{st.icon}</span>
                        {st.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-bold">{t.totalCases.toLocaleString('en-IN')}</td>
                    <td className="px-5 py-3 text-right">{t.staffCount}</td>
                    <td className="px-5 py-3 text-right font-bold text-success">
                      {t.monthlyRevenue > 0 ? `${(t.monthlyRevenue / 1000).toFixed(0)}K` : '--'}
                    </td>
                    <td className="px-5 py-3 text-right text-dark-muted">
                      {t.monthlyCost > 0 ? `${(t.monthlyCost / 1000).toFixed(0)}K` : '--'}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className="material-symbols-rounded text-xl text-primary">chevron_right</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

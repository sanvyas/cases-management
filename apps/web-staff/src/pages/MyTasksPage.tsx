import { useState, useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import { mockCases, STATUS_CONFIG, PRIORITY_CONFIG } from '../data/mockData';

type Tab = 'pending' | 'active' | 'done';

const tabs: { key: Tab; label: string; icon: string }[] = [
  { key: 'pending', label: 'New', icon: 'notification_important' },
  { key: 'active', label: 'Active', icon: 'engineering' },
  { key: 'done', label: 'Done', icon: 'task_alt' },
];

export function MyTasksPage() {
  const [activeTab, setActiveTab] = useState<Tab>('pending');

  const myTasks = useMemo(() => {
    return mockCases.filter((c) => c.assignee.includes('Ramesh Sharma'));
  }, []);

  const filtered = useMemo(() => {
    return myTasks.filter((c) => {
      if (activeTab === 'pending') return c.status === 'ASSIGNED';
      if (activeTab === 'active') return c.status === 'ACCEPTED' || c.status === 'IN_PROGRESS';
      return c.status === 'ATR_SUBMITTED' || c.status === 'RESOLVED' || c.status === 'CLOSED';
    });
  }, [activeTab, myTasks]);

  const counts = {
    pending: myTasks.filter((c) => c.status === 'ASSIGNED').length,
    active: myTasks.filter((c) => c.status === 'ACCEPTED' || c.status === 'IN_PROGRESS').length,
    done: myTasks.filter((c) => ['ATR_SUBMITTED', 'RESOLVED', 'CLOSED'].includes(c.status)).length,
  };

  return (
    <div className="px-4 py-4 flex flex-col gap-4">
      <div>
        <h2 className="text-2xl font-extrabold text-dark">My Tasks</h2>
        <p className="text-sm text-dark-muted">{myTasks.length} tasks assigned to you</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-bold transition-all"
            style={{
              background: activeTab === tab.key ? '#C24E33' : '#fff',
              color: activeTab === tab.key ? '#fff' : '#4A3E34',
              boxShadow: activeTab !== tab.key ? '0 1px 0 #EADFD2' : 'none',
            }}
          >
            <span className="material-symbols-rounded text-lg">{tab.icon}</span>
            {tab.label}
            <span
              className="flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-bold"
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

      {/* Task List */}
      <div className="flex flex-col gap-3">
        {filtered.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center" style={{ boxShadow: '0 1px 0 #EADFD2' }}>
            <span className="material-symbols-rounded text-4xl text-dark-muted mb-2">inbox</span>
            <p className="text-sm text-dark-muted">No tasks in this category</p>
          </div>
        ) : (
          filtered.map((c) => {
            const st = STATUS_CONFIG[c.status];
            const pr = PRIORITY_CONFIG[c.priority];
            const isOverdue = new Date(c.slaDueAt) < new Date() && !c.resolvedAt;
            return (
              <Link
                key={c.id}
                to="/tasks/$taskId"
                params={{ taskId: c.id }}
                className="rounded-2xl bg-white p-4 flex flex-col gap-3"
                style={{ boxShadow: '0 1px 0 #EADFD2' }}
              >
                <div className="flex items-center gap-3">
                  <span className="w-12 h-12 rounded-xl flex items-center justify-center flex-none" style={{ background: c.iconBg }}>
                    <span className="material-symbols-rounded text-2xl" style={{ color: c.iconFg }}>{c.icon}</span>
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-extrabold text-dark">{c.caseNumber}</span>
                      {pr && (
                        <span className="rounded-lg px-1.5 py-0.5 text-[10px] font-bold" style={{ background: pr.bg, color: pr.fg }}>
                          {pr.label}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-dark-muted">{c.subType}</p>
                  </div>
                  {st && (
                    <span className="flex items-center gap-1 rounded-xl px-2 py-1 text-xs font-bold flex-none" style={{ background: st.bg, color: st.fg }}>
                      <span className="material-symbols-rounded text-sm">{st.icon}</span>
                      {st.label}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs text-dark-muted">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-rounded text-sm">location_on</span>
                    {c.location}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-xs text-dark-muted">
                    <span className="material-symbols-rounded text-sm">schedule</span>
                    SLA: {new Date(c.slaDueAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {isOverdue && (
                    <span className="flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-bold bg-danger-light text-danger">
                      <span className="material-symbols-rounded text-sm">warning</span>
                      Overdue
                    </span>
                  )}
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}

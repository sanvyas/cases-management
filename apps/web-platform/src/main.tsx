import { StrictMode, useState, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider, useAuth } from './auth';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { EnvironmentPage } from './pages/EnvironmentPage';
import { NewEnvironmentPage } from './pages/NewEnvironmentPage';
import { AuditLogPage } from './pages/AuditLogPage';
import { TENANTS } from './data/mockData';
import { seedDefaultConfig } from './platformConfig';
import './index.css';

seedDefaultConfig();

type View =
  | { page: 'dashboard' }
  | { page: 'environment'; envId: string }
  | { page: 'new-environment' }
  | { page: 'audit-log' };

function PlatformLayout() {
  const { user, logout } = useAuth();
  const [view, setView] = useState<View>({ page: 'dashboard' });
  const [configOpen, setConfigOpen] = useState(true);

  const goToDashboard = useCallback(() => setView({ page: 'dashboard' }), []);
  const goToEnvironment = useCallback((envId: string) => {
    setView({ page: 'environment', envId });
    setConfigOpen(true);
  }, []);
  const goToNew = useCallback(() => setView({ page: 'new-environment' }), []);
  const goToAuditLog = useCallback(() => setView({ page: 'audit-log' }), []);

  return (
    <div className="flex h-screen bg-cream" style={{ fontFamily: "'Mukta', sans-serif" }}>
      <aside className="flex w-64 flex-col" style={{ background: '#1B2A4A' }}>
        <div className="border-b border-white/10 px-6 py-5">
          <h1 className="text-xl font-extrabold tracking-tight text-white">Samadhan</h1>
          <p className="text-xs text-white/40">Platform Console</p>
        </div>
        <nav className="mt-4 flex-1 space-y-1 px-3 overflow-y-auto">
          <button
            onClick={goToDashboard}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-colors"
            style={{
              background: view.page === 'dashboard' ? '#C24E33' : 'transparent',
              color: view.page === 'dashboard' ? '#fff' : 'rgba(255,255,255,0.5)',
            }}
          >
            <span className="material-symbols-rounded text-xl">space_dashboard</span>
            Overview
          </button>

          {/* Configure section — always visible */}
          <button
            onClick={() => setConfigOpen(!configOpen)}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-colors"
            style={{
              background: view.page === 'environment' ? '#C24E33' : 'transparent',
              color: view.page === 'environment' ? '#fff' : 'rgba(255,255,255,0.5)',
            }}
          >
            <span className="material-symbols-rounded text-xl">tune</span>
            <span className="flex-1 text-left">Configure</span>
            <span
              className="material-symbols-rounded text-lg transition-transform"
              style={{ transform: configOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
            >
              expand_more
            </span>
          </button>

          {configOpen && (
            <div className="ml-3 space-y-0.5 border-l-2 border-white/10 pl-3">
              {TENANTS.map(t => {
                const isActive = view.page === 'environment' && view.envId === t.id;
                const statusDot = t.status === 'active' ? '#2F7D4F' : t.status === 'trial' ? '#2F6690' : t.status === 'suspended' ? '#B91C1C' : '#8A7766';
                return (
                  <button
                    key={t.id}
                    onClick={() => goToEnvironment(t.id)}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-bold transition-colors"
                    style={{
                      background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                      color: isActive ? '#fff' : 'rgba(255,255,255,0.4)',
                    }}
                  >
                    <span className="w-2 h-2 rounded-full flex-none" style={{ background: statusDot }} />
                    <span className="truncate">{t.name}</span>
                  </button>
                );
              })}
            </div>
          )}

          <button
            onClick={goToNew}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-colors"
            style={{
              background: view.page === 'new-environment' ? '#C24E33' : 'transparent',
              color: view.page === 'new-environment' ? '#fff' : 'rgba(255,255,255,0.5)',
            }}
          >
            <span className="material-symbols-rounded text-xl">add_circle</span>
            New Environment
          </button>

          <button
            onClick={goToAuditLog}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-colors"
            style={{
              background: view.page === 'audit-log' ? '#C24E33' : 'transparent',
              color: view.page === 'audit-log' ? '#fff' : 'rgba(255,255,255,0.5)',
            }}
          >
            <span className="material-symbols-rounded text-xl">history</span>
            Audit Log
          </button>
        </nav>

        <div className="border-t border-white/10 p-3">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white" style={{ background: '#C24E33' }}>
              {user?.name.split(' ').map(n => n[0]).join('')}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-white truncate">{user?.name}</p>
              <p className="text-xs text-white/40">Platform Owner</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-white/50 transition-colors hover:bg-white/10 hover:text-white"
          >
            <span className="material-symbols-rounded text-xl">logout</span>
            Logout
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center justify-between border-b border-cream-darker bg-white px-6">
          <div className="flex items-center gap-2 text-sm text-dark-muted">
            <span className="material-symbols-rounded text-lg">shield</span>
            <span className="font-bold text-dark">Platform Owner Console</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative flex h-10 w-10 items-center justify-center rounded-xl text-dark-muted hover:bg-cream-dark">
              <span className="material-symbols-rounded text-2xl">notifications</span>
              <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-danger border-2 border-white" />
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          {view.page === 'dashboard' && (
            <DashboardPage onNavigate={goToEnvironment} />
          )}
          {view.page === 'environment' && (
            <EnvironmentPage envId={view.envId} onBack={goToDashboard} />
          )}
          {view.page === 'new-environment' && (
            <NewEnvironmentPage
              onBack={goToDashboard}
              onCreate={(name, type, planId) => {
                void name; void type; void planId;
                goToDashboard();
              }}
            />
          )}
          {view.page === 'audit-log' && (
            <AuditLogPage />
          )}
        </main>
      </div>
    </div>
  );
}

function App() {
  const { isAuthenticated } = useAuth();
  const [, forceUpdate] = useState(0);

  if (!isAuthenticated) {
    return <LoginPage onSuccess={() => forceUpdate(n => n + 1)} />;
  }

  return <PlatformLayout />;
}

function Root() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);

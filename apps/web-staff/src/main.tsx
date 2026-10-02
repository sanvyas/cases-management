import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import {
  createRouter,
  createRoute,
  createRootRoute,
  RouterProvider,
  Outlet,
  Link,
  useNavigate,
} from '@tanstack/react-router';
import { AuthProvider, useAuth } from './auth';
import { DashboardPage } from './pages/DashboardPage';
import { CasesPage } from './pages/CasesPage';
import { CaseDetailPage } from './pages/CaseDetailPage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';
import { MyTasksPage } from './pages/MyTasksPage';
import { TaskDetailPage } from './pages/TaskDetailPage';
import './index.css';

function OfficerLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { to: '/' as const, label: 'Dashboard', icon: 'dashboard' },
    { to: '/cases' as const, label: 'Cases', icon: 'folder_open' },
    { to: '/settings' as const, label: 'Settings', icon: 'settings' },
  ];

  function handleLogout() {
    logout();
    void navigate({ to: '/login' });
  }

  return (
    <div className="flex h-screen bg-cream" style={{ fontFamily: "'Mukta', sans-serif" }}>
      <aside className="flex w-64 flex-col bg-dark text-white">
        <div className="border-b border-white/10 px-6 py-5">
          <h1 className="text-xl font-extrabold tracking-tight text-white">समाधान</h1>
          <p className="text-xs text-white/50">Samadhan · Officer Console</p>
        </div>
        <nav className="mt-4 flex-1 space-y-1 px-3">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-white/60 transition-colors hover:bg-white/10 hover:text-white [&.active]:bg-primary [&.active]:text-white"
              activeOptions={{ exact: item.to === '/' }}
            >
              <span className="material-symbols-rounded text-xl">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-white/10 p-3">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
              {user?.name.split(' ').map((n) => n[0]).join('')}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-white truncate">{user?.name}</p>
              <p className="text-xs text-white/50">{user?.roleLabel}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          >
            <span className="material-symbols-rounded text-xl">logout</span>
            Logout
          </button>
        </div>
      </aside>
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center justify-between border-b border-cream-darker bg-white px-6">
          <div className="flex items-center gap-2 text-sm text-dark-muted">
            <span className="material-symbols-rounded text-lg">apartment</span>
            <span className="font-bold text-dark">{user?.tenantName}</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative flex h-10 w-10 items-center justify-center rounded-xl text-dark-muted hover:bg-cream-dark">
              <span className="material-symbols-rounded text-2xl">notifications</span>
              <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-danger border-2 border-white" />
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function FieldWorkerLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    void navigate({ to: '/login' });
  }

  return (
    <div className="flex min-h-dvh flex-col bg-cream" style={{ fontFamily: "'Mukta', sans-serif" }}>
      <header className="flex items-center gap-3 px-4 pt-3 pb-2 bg-white border-b border-cream-darker">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
          {user?.name.split(' ').map((n) => n[0]).join('')}
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-lg font-extrabold leading-tight text-dark">{user?.name}</div>
          <div className="text-xs text-dark-muted">{user?.roleLabel} · {user?.tenantName}</div>
        </div>
        <button
          onClick={handleLogout}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-dark-muted hover:bg-cream-dark"
        >
          <span className="material-symbols-rounded text-2xl">logout</span>
        </button>
      </header>
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
});

const officerLayout = createRoute({
  getParentRoute: () => rootRoute,
  id: 'officer',
  component: OfficerLayout,
});

const fieldLayout = createRoute({
  getParentRoute: () => rootRoute,
  id: 'field',
  component: FieldWorkerLayout,
});

const dashboardRoute = createRoute({
  getParentRoute: () => officerLayout,
  path: '/',
  component: DashboardPage,
});

const casesRoute = createRoute({
  getParentRoute: () => officerLayout,
  path: '/cases',
  component: CasesPage,
});

const caseDetailRoute = createRoute({
  getParentRoute: () => officerLayout,
  path: '/cases/$caseId',
  component: CaseDetailPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => officerLayout,
  path: '/settings',
  component: SettingsPage,
});

const myTasksRoute = createRoute({
  getParentRoute: () => fieldLayout,
  path: '/tasks',
  component: MyTasksPage,
});

const taskDetailRoute = createRoute({
  getParentRoute: () => fieldLayout,
  path: '/tasks/$taskId',
  component: TaskDetailPage,
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  officerLayout.addChildren([dashboardRoute, casesRoute, caseDetailRoute, settingsRoute]),
  fieldLayout.addChildren([myTasksRoute, taskDetailRoute]),
]);

const router = createRouter({ routeTree, basepath: import.meta.env.BASE_URL });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

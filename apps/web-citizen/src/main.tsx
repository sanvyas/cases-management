import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import {
  createRouter,
  createRoute,
  createRootRoute,
  RouterProvider,
  Outlet,
  Navigate,
} from '@tanstack/react-router';
import { LangProvider } from './lang';
import { HomePage } from './pages/HomePage';
import { RegisterPage } from './pages/RegisterPage';
import { TrackPage } from './pages/TrackPage';
import { DetailPage } from './pages/DetailPage';
import { LangPickerPage } from './pages/LangPickerPage';
import { LoginPage } from './pages/LoginPage';
import { getCitizenUser } from './store';
import './index.css';

function CitizenLayout() {
  return (
    <div className="mx-auto min-h-dvh max-w-md bg-cream" style={{ fontFamily: "'Mukta', sans-serif" }}>
      <Outlet />
    </div>
  );
}

function AuthGuard() {
  const user = getCitizenUser();
  if (!user) {
    return <Navigate to="/login" />;
  }
  return <Outlet />;
}

const rootRoute = createRootRoute({ component: CitizenLayout });

const langPickerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LangPickerPage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
});

const authLayout = createRoute({
  getParentRoute: () => rootRoute,
  id: 'auth',
  component: AuthGuard,
});

const homeRoute = createRoute({
  getParentRoute: () => authLayout,
  path: '/home',
  component: HomePage,
});

const registerRoute = createRoute({
  getParentRoute: () => authLayout,
  path: '/register',
  component: RegisterPage,
  validateSearch: (search: Record<string, unknown>) => ({
    category: (search.category as string) || undefined,
  }),
});

const trackRoute = createRoute({
  getParentRoute: () => authLayout,
  path: '/track',
  component: TrackPage,
});

const detailRoute = createRoute({
  getParentRoute: () => authLayout,
  path: '/complaint/$id',
  component: DetailPage,
});

const routeTree = rootRoute.addChildren([
  langPickerRoute,
  loginRoute,
  authLayout.addChildren([homeRoute, registerRoute, trackRoute, detailRoute]),
]);

const router = createRouter({ routeTree, basepath: import.meta.env.BASE_URL });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function App() {
  return (
    <LangProvider>
      <RouterProvider router={router} />
    </LangProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

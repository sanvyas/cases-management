import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import {
  createRouter,
  createRoute,
  createRootRoute,
  RouterProvider,
  Outlet,
} from '@tanstack/react-router';
import { LangProvider } from './lang';
import { HomePage } from './pages/HomePage';
import { RegisterPage } from './pages/RegisterPage';
import { TrackPage } from './pages/TrackPage';
import { DetailPage } from './pages/DetailPage';
import { LangPickerPage } from './pages/LangPickerPage';
import './index.css';

/* ─── Layout ─── */
function CitizenLayout() {
  return (
    <div className="mx-auto min-h-screen max-w-lg bg-white">
      <Outlet />
    </div>
  );
}

/* ─── Routes ─── */
const rootRoute = createRootRoute({ component: CitizenLayout });

const langPickerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LangPickerPage,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/home',
  component: HomePage,
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: RegisterPage,
});

const trackRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/track',
  component: TrackPage,
});

const detailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/complaint/$id',
  component: DetailPage,
});

const routeTree = rootRoute.addChildren([
  langPickerRoute,
  homeRoute,
  registerRoute,
  trackRoute,
  detailRoute,
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

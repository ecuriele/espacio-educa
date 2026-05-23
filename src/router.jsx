import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import AppShell from '@components/layout/AppShell';
import { store } from '@store/index';

const LoginPage       = lazy(() => import('./pages/LoginPage'));
const DashboardPage   = lazy(() => import('./pages/DashboardPage'));
const ModulesPage     = lazy(() => import('./pages/ModulesPage'));
const ModuleDetailsPage = lazy(() => import('./pages/ModuleDetailsPage'));
const LessonPage      = lazy(() => import('./pages/LessonPage'));
const EditorPage      = lazy(() => import('./pages/EditorPage'));
const SandboxPage     = lazy(() => import('./pages/SandboxPage'));
const ChallengesPage  = lazy(() => import('./pages/ChallengesPage'));
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage'));
const ProfilePage     = lazy(() => import('./pages/ProfilePage'));
const GitHubPage      = lazy(() => import('./pages/GitHubPage'));
const MisEntregasPage = lazy(() => import('./pages/MisEntregasPage'));
const NotFoundPage    = lazy(() => import('./pages/NotFoundPage'));

const AdminShell          = lazy(() => import('./components/layout/AdminShell'));
const AdminDashboardPage  = lazy(() => import('./pages/admin/AdminDashboardPage'));
const MonitoringPage      = lazy(() => import('./pages/admin/MonitoringPage'));
const SubmissionsPage     = lazy(() => import('./pages/admin/SubmissionsPage'));
const CurriculumPage      = lazy(() => import('./pages/admin/CurriculumPage'));
const LessonBuilderPage   = lazy(() => import('./pages/admin/LessonBuilderPage'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#ea5837]/20 flex items-center justify-center animate-pulse">
          <div className="w-5 h-5 border-2 border-[#ea5837]/40 border-t-[#ea5837] rounded-full animate-spin" />
        </div>
        <p className="text-sm text-slate-400">Cargando...</p>
      </div>
    </div>
  );
}

function requireAuth({ request }) {
  const state = store.getState();
  const { isAuthenticated, status } = state.auth;

  // Si Firebase aún está verificando la sesión (status: 'loading'), dejar pasar
  // El componente de destino se encargará del estado de carga
  if (status === 'loading') return null;

  if (!isAuthenticated) {
    const url = new URL(request.url);
    throw new Response(null, {
      status: 302,
      headers: { Location: `/login?redirect=${encodeURIComponent(url.pathname)}` },
    });
  }
  return null;
}

function requireTeacher({ request }) {
  const state = store.getState();
  const { isAuthenticated, user, status } = state.auth;

  if (status === 'loading') return null;

  if (!isAuthenticated) {
    const url = new URL(request.url);
    throw new Response(null, {
      status: 302,
      headers: { Location: `/login?redirect=${encodeURIComponent(url.pathname)}` },
    });
  }

  if (user?.rol !== 'profesor') {
    // Estudiante intentando acceder al panel de profesor
    throw new Response(null, {
      status: 302,
      headers: { Location: '/panel?error=no-access' },
    });
  }

  return null;
}

const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <Suspense fallback={<PageLoader />}>
        <LoginPage />
      </Suspense>
    ),
  },

  {
    path: '/',
    element: <AppShell />,
    loader: requireAuth,
    children: [
      { index: true, element: <Navigate to="/panel" replace /> },
      {
        path: 'panel',
        element: <Suspense fallback={<PageLoader />}><DashboardPage /></Suspense>,
      },
      {
        path: 'modulos',
        element: <Suspense fallback={<PageLoader />}><ModulesPage /></Suspense>,
      },
      {
        path: 'modulos/:moduloId',
        element: <Suspense fallback={<PageLoader />}><ModuleDetailsPage /></Suspense>,
      },
      {
        path: 'modulos/:moduloId/leccion/:leccionId',
        element: <Suspense fallback={<PageLoader />}><LessonPage /></Suspense>,
      },
      {
        path: 'editor',
        element: <Suspense fallback={<PageLoader />}><EditorPage /></Suspense>,
      },
      {
        path: 'sandbox',
        element: <Suspense fallback={<PageLoader />}><SandboxPage /></Suspense>,
      },
      {
        path: 'retos',
        element: <Suspense fallback={<PageLoader />}><ChallengesPage /></Suspense>,
      },
      {
        path: 'clasificacion',
        element: <Suspense fallback={<PageLoader />}><LeaderboardPage /></Suspense>,
      },
      {
        path: 'perfil',
        element: <Suspense fallback={<PageLoader />}><ProfilePage /></Suspense>,
      },
      {
        path: 'github',
        element: <Suspense fallback={<PageLoader />}><GitHubPage /></Suspense>,
      },
      {
        path: 'mis-entregas',
        element: <Suspense fallback={<PageLoader />}><MisEntregasPage /></Suspense>,
      },
    ],
  },

  {
    path: '/admin',
    element: (
      <Suspense fallback={<PageLoader />}>
        <AdminShell />
      </Suspense>
    ),
    loader: requireTeacher,
    children: [
      { index: true, element: <Navigate to="/admin/panel" replace /> },
      {
        path: 'panel',
        element: <Suspense fallback={<PageLoader />}><AdminDashboardPage /></Suspense>,
      },
      {
        path: 'monitoreo',
        element: <Suspense fallback={<PageLoader />}><MonitoringPage /></Suspense>,
      },
      {
        path: 'entregas',
        element: <Suspense fallback={<PageLoader />}><SubmissionsPage /></Suspense>,
      },
      {
        path: 'pensum',
        element: <Suspense fallback={<PageLoader />}><CurriculumPage /></Suspense>,
      },

      {
        path: 'builder/:moduloId',
        element: <Suspense fallback={<PageLoader />}><LessonBuilderPage /></Suspense>,
      },
    ],
  },

  {
    path: '*',
    element: (
      <Suspense fallback={<PageLoader />}>
        <NotFoundPage />
      </Suspense>
    ),
  },
]);

export default router;

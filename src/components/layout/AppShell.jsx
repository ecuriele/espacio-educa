import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@services/firebase/config';
import { 
  Home, BookOpen, Terminal, FlaskConical, Zap, Trophy, User, Github,
  Rocket, Menu, ChevronLeft, ChevronRight, Sun, Moon, WifiOff, Shield, Send, Activity, Clock
} from 'lucide-react';
import {
  toggleTheme, toggleSidebar, toggleMobileSidebar, closeMobileSidebar,
  setOnlineStatus, selectTheme, selectSidebarOpen, selectMobileSidebar,
  selectIsOnline, selectShowOffline, dismissOfflineBanner,
} from '@store/slices/uiSlice';
import { selectCurrentUser, selectIsOfflineSession, selectIsTeacher, updateUserProfile } from '@store/slices/authSlice';
import { selectStreak, selectTotalXp, selectRank, selectRankProgress } from '@store/slices/gamificationSlice';
import { selectPendingCount } from '@store/slices/syncSlice';
import AchievementToast from '@components/gamification/AchievementToast';
import ProgressBar from '@components/gamification/ProgressBar';
import StreakBadge from '@components/gamification/StreakBadge';

const NAV_ITEMS = [
  { to: '/panel',          label: 'Inicio',        icon: Home,         id: 'nav-dashboard'   },
  { to: '/modulos',        label: 'Módulos',       icon: BookOpen,     id: 'nav-modules'     },
  { to: '/mis-entregas',   label: 'Mis Entregas',  icon: Send,         id: 'nav-entregas'    },
  { to: '/sandbox',        label: 'Sandbox',       icon: FlaskConical, id: 'nav-sandbox'     },
  { to: '/retos',          label: 'Retos',         icon: Zap,          id: 'nav-challenges'  },
  { to: '/clasificacion',  label: 'Ranking',       icon: Trophy,       id: 'nav-leaderboard' },
  { to: '/perfil',         label: 'Mi Perfil',     icon: User,         id: 'nav-profile'     },
  { to: '/github',         label: 'GitHub',        icon: Github,       id: 'nav-github'      },
];

export default function AppShell() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Estados globales
  const theme = useSelector(selectTheme);
  const sidebarOpen = useSelector(selectSidebarOpen);
  const mobileSidebar = useSelector(selectMobileSidebar);
  const isOnline = useSelector(selectIsOnline);
  const showOfflineBanner = useSelector(selectShowOffline);
  const pendingSync = useSelector(selectPendingCount);
  
  // Auth y Gamification
  const user = useSelector(selectCurrentUser);
  const isTeacher = useSelector(selectIsTeacher);
  const isOfflineSession = useSelector(selectIsOfflineSession);
  const streak = useSelector(selectStreak);
  const xp = useSelector(selectTotalXp);
  const rank = useSelector(selectRank);
  const rankProgress = useSelector(selectRankProgress);

  // Estado del Onboarding
  const [onboardingData, setOnboardingData] = useState({ colegio: 'María Inmaculada', salon: 'Básico' });
  const [savingOnboarding, setSavingOnboarding] = useState(false);
  // needsOnboarding: solo estudiantes sin colegio/salon en Redux
  // (profesores y admins están exentos siempre)
  const needsOnboarding = user
    && user.rol !== 'profesor'
    && user.rol !== 'admin'
    && (!user.colegio || !user.salon);

  useEffect(() => {
    const handleOnline  = () => dispatch(setOnlineStatus(true));
    const handleOffline = () => dispatch(setOnlineStatus(false));
    window.addEventListener('online',  handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online',  handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [dispatch]);

  const handleSaveOnboarding = async (e) => {
    e.preventDefault();
    if (!onboardingData.colegio || !onboardingData.salon) {
      alert('Por favor selecciona tu colegio y tu curso.');
      return;
    }
    setSavingOnboarding(true);
    try {
      const userId = user?.uid || user?.id;
      if (!userId) throw new Error("ID de usuario no disponible");
      
      const updates = {
        colegio: onboardingData.colegio.trim(),
        salon:   onboardingData.salon.trim(),
      };
      
      try {
        // Guardar en Firestore
        await setDoc(doc(db, 'perfiles_usuarios', userId), updates, { merge: true });
      } catch (fbErr) {
        console.error('Error guardando perfil en Firebase (ignorado para no bloquear):', fbErr);
        // Continuamos para no bloquear al estudiante
      }

      // Guardar en IndexedDB localmente por si recarga la página
      try {
        const { getDB, STORES } = await import('@db/schema');
        const localDb = await getDB();
        const localUser = await localDb.get(STORES.USUARIOS, userId);
        if (localUser) {
          await localDb.put(STORES.USUARIOS, { ...localUser, ...updates });
        }
      } catch (idbErr) {
        console.error('Error actualizando IndexedDB:', idbErr);
      }

      // Actualizar Redux
      dispatch(updateUserProfile(updates));
      setSavingOnboarding(false);
    } catch (err) {
      console.error(err);
      alert('Error interno al guardar: ' + err.message);
      setSavingOnboarding(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-surface-dark transition-colors duration-300 overflow-x-hidden flex font-sans">
      
      {/* ── Modal de Onboarding (para nuevos usuarios de Google) ── */}
      {needsOnboarding && (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-surface-card rounded-2xl shadow-xl p-6 md:p-8 max-w-md w-full animate-fade-up">
            <div className="w-12 h-12 bg-accent-100 dark:bg-accent-500/20 text-accent-600 dark:text-accent-400 rounded-full flex items-center justify-center mb-4 mx-auto">
              <User size={24} />
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white text-center mb-2">¡Completa tu perfil!</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm text-center mb-6">
              Para brindarte la mejor experiencia, necesitamos un par de datos adicionales.
            </p>
            <form onSubmit={handleSaveOnboarding} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tu Colegio / Institución</label>
                <select 
                  required
                  value={onboardingData.colegio}
                  onChange={e => setOnboardingData(d => ({ ...d, colegio: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-surface-border rounded-xl text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-accent-500/50 outline-none transition-all cursor-pointer"
                >
                  <option value="" disabled hidden>Selecciona tu colegio</option>
                  <option value="María Inmaculada">María Inmaculada</option>
                  <option value="Campo Rico">Campo Rico</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Sección / Curso</label>
                <select 
                  required
                  value={onboardingData.salon}
                  onChange={e => setOnboardingData(d => ({ ...d, salon: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-surface-border rounded-xl text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-accent-500/50 outline-none transition-all cursor-pointer"
                >
                  <option value="" disabled hidden>Selecciona tu curso</option>
                  <option value="Básico">Básico</option>
                  <option value="Avanzado">Avanzado</option>
                </select>
              </div>
              <button 
                type="submit" 
                disabled={savingOnboarding}
                className="w-full py-3 bg-accent-500 hover:bg-accent-600 text-white rounded-xl font-bold transition-colors mt-2"
              >
                {savingOnboarding ? 'Guardando...' : 'Comenzar a aprender'}
              </button>
            </form>
          </div>
        </div>
      )}

      {mobileSidebar && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
          onClick={() => dispatch(closeMobileSidebar())}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed top-0 left-0 h-full z-40 flex flex-col',
          'bg-white dark:bg-surface-card border-r border-slate-200 dark:border-surface-border',
          'transition-all duration-300 ease-in-out',
          // Desktop
          'hidden md:flex',
          sidebarOpen ? 'w-64' : 'w-[72px]',
          // Mobile
          'max-md:flex max-md:w-72',
          mobileSidebar ? 'max-md:translate-x-0' : 'max-md:-translate-x-full'
        )}
      >
        {/* Logo + Toggle */}
        <div className="relative flex items-center px-4 py-4 h-[73px] border-b border-slate-200 dark:border-surface-border">
          <div className={clsx('flex items-center gap-3 overflow-hidden w-full', !sidebarOpen && 'justify-center')}>
            <div className="flex-shrink-0 flex items-center justify-center">
              <img src="/brandboard/original/weeArtboard%2034.svg" alt="EE" className={clsx("object-contain transition-all", sidebarOpen ? "w-8 h-8" : "w-9 h-9")} />
            </div>
            {(sidebarOpen || mobileSidebar) && (
              <div className="animate-fade-up flex items-center h-8">
                <img src="/brandboard/original/weeMesa%20de%20trabajo%201.svg" alt="Espacio Educa" className="h-full object-contain" />
              </div>
            )}
          </div>
          <button
            id="sidebar-toggle-btn"
            onClick={() => dispatch(toggleSidebar())}
            className="hidden md:flex absolute -right-3.5 top-1/2 -translate-y-1/2 p-1 bg-white dark:bg-surface-card border border-slate-200 dark:border-surface-border text-slate-400 hover:text-accent-500 dark:hover:text-white rounded-full shadow-sm transition-all z-50"
            title={sidebarOpen ? 'Colapsar sidebar' : 'Expandir sidebar'}
          >
            {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>

        {/* Perfil del usuario */}
        {(sidebarOpen || mobileSidebar) && (
          <div className="px-4 py-3 border-b border-slate-200 dark:border-surface-border">
            {/* Avatar + Nombre */}
            <div className="flex items-center gap-3 mb-2">
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-400 to-accent-600 dark:from-brand-500 dark:to-brand-700 flex items-center justify-center text-white font-bold text-sm shadow-sm overflow-hidden">
                  {(user?.avatarUrl || user?.fotoUrl || user?.photoURL) ? (
                    <img src={user.avatarUrl || user.fotoUrl || user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    user?.nombreMostrar?.[0]?.toUpperCase() ?? '?'
                  )}
                </div>
                {/* Badge de rango */}
                <span
                  className="absolute -bottom-1 -right-1 text-xs leading-none"
                  title={rank?.label}
                >
                  {rank?.icon}
                </span>
              </div>
              <div className="ml-3 hidden sm:block text-left">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-tight">
                  {user?.nombreMostrar ?? 'Estudiante'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {user?.correo?.split('@')[0]}
                </p>
              </div>
            </div>

            {/* Barra de XP hacia siguiente rango */}
            <ProgressBar
              percent={rankProgress}
              label={`${xp} XP`}
              size="sm"
              color={theme === 'dark' ? 'brand' : 'accent'}
            />
          </div>
        )}

        {/* Racha compacta */}
        {(sidebarOpen || mobileSidebar) && (
          <div className="px-4 py-2 border-b border-slate-200 dark:border-surface-border">
            <StreakBadge streak={streak?.rachaActual ?? 0} compact />
          </div>
        )}

        {/* Navegación principal */}
        <nav className="flex-1 px-2 py-3 overflow-y-auto">
          <ul className="space-y-1">
            {NAV_ITEMS.map(({ to, label, icon: Icon, id }) => (
              <li key={to}>
                <NavLink
                  id={id}
                  to={to}
                  className={({ isActive }) => clsx(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group',
                    isActive
                      ? 'bg-accent-100 dark:bg-accent-500/20 text-accent-700 dark:text-accent-400 ring-1 ring-accent-500/30'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-surface-hover'
                  )}
                  title={!sidebarOpen ? label : undefined}
                >
                  <span className="text-base flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Icon size={20} />
                  </span>
                  {(sidebarOpen || mobileSidebar) && (
                    <span className="truncate">{label}</span>
                  )}
                </NavLink>
              </li>
            ))}
            
            {/* Administrador */}
            {isTeacher && (
              <li className="mt-4 pt-4 border-t border-slate-200 dark:border-surface-border">
                <NavLink
                  id="nav-admin"
                  to="/admin"
                  className={({ isActive }) => clsx(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group',
                    isActive
                      ? 'bg-danger-100 dark:bg-danger-500/20 text-danger-700 dark:text-danger-400 ring-1 ring-danger-500/30'
                      : 'text-slate-500 dark:text-slate-400 hover:text-danger-600 dark:hover:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-500/10'
                  )}
                  title={!sidebarOpen ? 'Modo Admin' : undefined}
                >
                  <span className="text-base flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Shield size={20} />
                  </span>
                  {(sidebarOpen || mobileSidebar) && (
                    <span className="truncate text-danger-600 dark:text-danger-400 font-bold">Modo Admin</span>
                  )}
                </NavLink>
              </li>
            )}
          </ul>
        </nav>

        {/* Indicador de sync pendiente */}
        {pendingSync > 0 && (sidebarOpen || mobileSidebar) && (
          <div className="px-4 py-2 border-t border-slate-200 dark:border-surface-border">
            <div className="flex items-center gap-2 text-xs text-warning-500 dark:text-warning-400">
              <span className="animate-spin">⟳</span>
              <span>{pendingSync} ítem{pendingSync > 1 ? 's' : ''} pendiente{pendingSync > 1 ? 's' : ''} de sync</span>
            </div>
          </div>
        )}
      </aside>

      {/* Main Area */}
      <div
        className={clsx(
          'flex flex-col flex-1 min-w-0 transition-all duration-300',
          sidebarOpen ? 'md:ml-64' : 'md:ml-[72px]'
        )}
      >
        <header className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 bg-white/80 dark:bg-surface-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-surface-border">
          {/* Mobile menu toggle */}
          <button
            id="mobile-menu-btn"
            className="md:hidden p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-surface-hover rounded-xl transition-all"
            onClick={() => dispatch(toggleMobileSidebar())}
            aria-label="Abrir menú"
          >
            <Menu size={24} />
          </button>

          {/* Título de sección / Logo Navbar */}
          <div className="hidden md:flex items-center h-8">
            <img src="/brandboard/original/weeMesa%20de%20trabajo%201.svg" alt="Espacio Educa" className="h-full object-contain" />
          </div>

          {/* Controles del lado derecho */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Estado de conexión */}
            <div
              id="connection-status"
              className={clsx(
                'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all',
                isOnline
                  ? 'text-accent-400 bg-accent-400/10'
                  : 'text-danger-400 bg-danger-400/10 animate-pulse'
              )}
              title={isOnline ? 'Conectado' : 'Sin conexión — modo offline activo'}
            >
              <span className={clsx('w-1.5 h-1.5 rounded-full', isOnline ? 'bg-accent-400' : 'bg-danger-400')} />
              <span className="hidden sm:inline">{isOnline ? 'En línea' : 'Offline'}</span>
            </div>

            {/* Toggle de tema */}
            <button
              id="theme-toggle-btn"
              onClick={() => dispatch(toggleTheme())}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-surface-hover rounded-xl transition-all"
              title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              aria-label="Alternar tema"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Avatar / perfil */}
            <button
              id="user-profile-btn"
              onClick={() => navigate('/perfil')}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-400 to-accent-600 dark:from-brand-500 dark:to-brand-700 flex items-center justify-center text-white text-sm font-bold hover:ring-2 hover:ring-accent-400 dark:hover:ring-brand-400 transition-all shadow-sm overflow-hidden"
              aria-label="Mi perfil"
            >
              {(user?.avatarUrl || user?.fotoUrl || user?.photoURL) ? (
                <img src={user.avatarUrl || user.fotoUrl || user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                user?.nombreMostrar?.[0]?.toUpperCase() ?? '?'
              )}
            </button>
          </div>
        </header>

        {showOfflineBanner && (
          <div
            id="offline-banner"
            className="flex items-center justify-between px-4 py-2.5 bg-warning-500/15 border-b border-warning-500/30 text-sm text-warning-400 animate-slide-in-right"
          >
            <div className="flex items-center gap-3">
              <WifiOff size={16} className="shrink-0" />
              <span>
                Modo offline activo — tu progreso se guarda localmente y se sincronizará cuando recuperes conexión.
                {isOfflineSession && ' (Sesión offline)'}
              </span>
            </div>
            <button
              onClick={() => dispatch(dismissOfflineBanner())}
              className="ml-2 text-warning-400 hover:text-warning-300 text-lg leading-none"
              aria-label="Cerrar aviso"
            >
              ×
            </button>
          </div>
        )}

        <main id="main-content" className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>

      <AchievementToast />
    </div>
  );
}

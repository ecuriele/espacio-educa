import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectCurrentUser } from '@store/slices/authSlice';
import { logout } from '@store/slices/authSlice';
import {
  LayoutDashboard, FileText, BookOpen, Upload,
  LogOut, Menu, X, GraduationCap, ChevronRight,
  Bell, Settings, Activity, Clock, Users
} from 'lucide-react';
import clsx from 'clsx';

const NAV_ITEMS = [
  { to: '/admin/panel',    label: 'General',       icon: Activity },
  { to: '/admin/monitoreo',label: 'Monitoreo estudiantes', icon: Users },
  { to: '/admin/entregas', label: 'Entregas recientes', icon: Clock },
  { to: '/admin/pensum',   label: 'Pensum / Cursos', icon: BookOpen },
];

export default function AdminShell() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const user      = useSelector(selectCurrentUser);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = async () => {
    dispatch({ type: 'auth/clearAuthState' });
    await dispatch(logout(user?.id));
    navigate('/login', { replace: true });
  };

  return (
    <div className="h-screen h-[100dvh] w-full bg-slate-100 dark:bg-surface-dark flex overflow-hidden">

      <aside
        className={clsx(
          'h-full flex flex-col bg-white dark:bg-surface-card border-r border-slate-200 dark:border-surface-border transition-all duration-300 shrink-0',
          sidebarOpen ? 'w-64' : 'w-16'
        )}
      >
        {/* Header del sidebar */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200 dark:border-surface-border shrink-0">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#ea5837] flex items-center justify-center">
                <GraduationCap size={16} className="text-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">Espacio Educa</p>
                <p className="text-[10px] text-[#ea5837] font-semibold uppercase tracking-wider">Panel Profesor</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-surface-hover rounded-lg transition-all"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Navegación — scrollable si hubiera muchos items */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group',
                  isActive
                    ? 'bg-[#ea5837]/10 text-[#ea5837] dark:bg-[#ea5837]/15'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-surface-hover hover:text-slate-900 dark:hover:text-white'
                )
              }
              title={!sidebarOpen ? label : undefined}
            >
              <Icon size={18} className="shrink-0" />
              {sidebarOpen && <span>{label}</span>}
              {sidebarOpen && (
                <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </NavLink>
          ))}
        </nav>

        {/* Perfil del profesor — siempre visible al fondo, nunca dentro del scroll */}
        <div className="shrink-0 p-3 border-t border-slate-200 dark:border-surface-border mt-auto sticky bottom-0 z-10 bg-white dark:bg-surface-card">
          {sidebarOpen ? (
            <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-surface-hover transition-all">
              <div className="w-9 h-9 rounded-xl bg-[#ea5837]/20 flex items-center justify-center text-[#ea5837] font-bold text-sm shrink-0 overflow-hidden">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  user?.nombreMostrar?.[0]?.toUpperCase() ?? 'P'
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user?.nombreMostrar}</p>
                <p className="text-xs text-[#ea5837] font-medium">Profesor</p>
              </div>
              <button
                onClick={handleLogout}
                title="Cerrar sesión"
                className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition-colors shrink-0"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              title="Cerrar sesión"
              className="w-full flex items-center justify-center p-2 text-slate-400 hover:text-red-500 rounded-xl hover:bg-slate-100 dark:hover:bg-surface-hover transition-all"
            >
              <LogOut size={18} />
            </button>
          )}
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-surface-card border-b border-slate-200 dark:border-surface-border shrink-0">
          <div />
          <div className="flex items-center gap-3">
            <button className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-surface-hover rounded-xl transition-all" title="Notificaciones">
              <Bell size={18} />
            </button>
            <NavLink to="/panel" className="text-xs text-slate-500 dark:text-slate-400 hover:text-[#ea5837] transition-colors flex items-center gap-1">
              <Settings size={14} /> Vista de estudiante
            </NavLink>
          </div>
        </header>

        {/* Contenido de la página actual */}
        <div className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

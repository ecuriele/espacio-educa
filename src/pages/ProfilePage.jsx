import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectCurrentUser, logout, updatePreferences } from '@store/slices/authSlice';
import { selectStreak, selectTotalXp, selectRank, loadUserAchievements, selectBadges, checkSubmissionAchievements } from '@store/slices/gamificationSlice';
import { ACHIEVEMENT_CATALOG } from '@db/models';
import StreakBadge from '@components/gamification/StreakBadge';
import ProgressBar from '@components/gamification/ProgressBar';
import { useNavigate } from 'react-router-dom';
import { Medal, Flame, Zap, Calendar, Hand, BarChart3, BookOpen, GraduationCap } from 'lucide-react';
import { getIconForEmoji } from '@utils/iconMap';

export default function ProfilePage() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const user      = useSelector(selectCurrentUser);
  const streak    = useSelector(selectStreak) || { rachaActual: 0, rachaMasLarga: 0, totalDiasActivos: 0 };
  const totalXp   = useSelector(selectTotalXp) || 0;
  const rank      = useSelector(selectRank);
  const badges    = useSelector(selectBadges) || [];

  useEffect(() => {
    if (user?.id) {
      dispatch(checkSubmissionAchievements(user.id)).then(() => {
        dispatch(loadUserAchievements(user.id));
      });
    }
  }, [user?.id, dispatch]);

  const handleLogout = async () => {
    // 1. Limpiar el estado de Redux de forma síncrona
    dispatch({ type: 'auth/clearAuthState' });
    // 2. Ejecutar el logout en Firebase y limpiar IndexedDB
    await dispatch(logout(user?.id));
    // 3. Navegar al login
    navigate('/login', { replace: true });
  };

  return (
    <div className="space-y-6 animate-fade-up max-w-2xl mx-auto">
      {/* Card de perfil */}
      <div className="bg-white dark:bg-surface-card border border-slate-200 dark:border-surface-border rounded-2xl p-6 flex items-center gap-5 shadow-sm dark:shadow-none">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-brand-100 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 flex items-center justify-center text-4xl font-black shrink-0 border-2 border-brand-200 dark:border-brand-500/30 overflow-hidden">
          {(user?.avatarUrl || user?.fotoUrl || user?.photoURL) ? (
            <img src={user.avatarUrl || user.fotoUrl || user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            user?.nombreMostrar?.[0]?.toUpperCase() ?? '?'
          )}
        </div>
        <div className="text-center sm:text-left flex-1 mt-4 sm:mt-0">
          <h1 className="text-xl font-black text-slate-900 dark:text-white">{user?.nombreMostrar}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{user?.correo}</p>
          <div className="flex flex-wrap gap-2 mt-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 rounded-lg text-xs font-semibold">
              <Hand size={14} className="text-brand-500" /> Estudiante Activo
            </div>
            {user?.colegio && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-surface-hover text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold">
                <BookOpen size={14} className="text-slate-500" /> {user.colegio}
              </div>
            )}
            {user?.salon && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-surface-hover text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold">
                <GraduationCap size={14} className="text-slate-500" /> Curso {user.salon}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-sm font-semibold flex items-center gap-1.5 text-accent-600 dark:text-brand-300">{getIconForEmoji(rank?.icon, 16)} {rank?.label}</span>
            <span className="text-xs text-slate-400 dark:text-slate-500">·</span>
            <span className="text-sm text-accent-600 dark:text-accent-400 font-semibold">{totalXp} XP</span>
          </div>
        </div>
        <StreakBadge streak={streak?.rachaActual ?? 0} compact />
      </div>

      {/* Logros */}
      <div className="bg-white dark:bg-surface-card border border-slate-200 dark:border-surface-border rounded-2xl p-5 shadow-sm dark:shadow-none">
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2"><Medal className="text-warning-500" size={20} /> Logros ({(badges || []).length}/{ACHIEVEMENT_CATALOG.length})</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {ACHIEVEMENT_CATALOG.map((ach) => {
            const unlocked = (badges || []).includes(ach.id);
            return (
              <div
                key={ach.id}
                title={`${ach.titulo}: ${ach.descripcion}`}
                className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border text-center transition-all min-h-[100px] ${
                  unlocked
                    ? 'bg-accent-50 dark:bg-brand-500/10 border-accent-200 dark:border-brand-500/30 animate-badge-pop shadow-sm dark:shadow-none'
                    : 'bg-slate-50 dark:bg-surface-hover border-slate-200 dark:border-surface-border opacity-40 grayscale'
                }`}
              >
                <div className="flex items-center justify-center">{getIconForEmoji(ach.icono, 28)}</div>
                <span className="text-xs text-slate-700 dark:text-slate-300 font-bold leading-tight mt-1">{ach.titulo}</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">{ach.requisito}</span>
                {unlocked && ach.xp > 0 && (
                  <span className="text-[10px] font-bold text-accent-600 dark:text-accent-400 mt-1">+{ach.xp}XP</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Estadísticas de racha */}
      <div className="bg-white dark:bg-surface-card border border-slate-200 dark:border-surface-border rounded-2xl p-5 shadow-sm dark:shadow-none">
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2"><BarChart3 className="text-accent-500" size={20} /> Estadísticas</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { label: 'Racha actual', value: streak?.rachaActual ?? 0, icon: <Flame size={28} className="mx-auto text-warning-500" />, color: 'text-warning-500 dark:text-warning-400' },
            { label: 'Mejor racha', value: streak?.rachaMasLarga ?? 0, icon: <Zap size={28} className="mx-auto text-accent-500" />, color: 'text-accent-600 dark:text-brand-300' },
            { label: 'Días activos', value: streak?.totalDiasActivos ?? 0, icon: <Calendar size={28} className="mx-auto text-brand-500" />, color: 'text-accent-600 dark:text-accent-400' },
          ].map(({ label, value, icon, color }) => (
            <div key={label} className="bg-slate-50 dark:bg-surface-hover rounded-xl p-3 border border-slate-100 dark:border-transparent flex flex-col items-center">
              <span className="mb-1">{icon}</span>
              <span className={`text-2xl font-black ${color}`}>{value}</span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Botón cerrar sesión */}
      <button
        id="logout-btn"
        onClick={handleLogout}
        className="w-full py-3 px-6 border border-danger-500/40 text-danger-400 hover:bg-danger-500/10 rounded-xl text-sm font-medium transition-all"
      >
        Cerrar sesión
      </button>
    </div>
  );
}

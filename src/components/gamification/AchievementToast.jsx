import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast, { Toaster } from 'react-hot-toast';
import { selectPendingNotifications, clearNotification } from '@store/slices/gamificationSlice';
import { AchievementModel } from '@db/models';
import { selectCurrentUser } from '@store/slices/authSlice';
import { Trophy, X } from 'lucide-react';
import { getIconForEmoji } from '@utils/iconMap';
import clsx from 'clsx';

function AchievementToastContent({ achievement, onDismiss }) {
  return (
    <div className="flex items-start gap-4">
      {/* Icono con borde gradiente premium */}
      <div className="relative flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400 via-orange-500 to-brand-500 p-[2px] shadow-lg shadow-orange-500/30 animate-badge-pop mt-1">
        <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[14px] flex items-center justify-center">
          <div className="drop-shadow-md scale-[1.15]">{getIconForEmoji(achievement.icono, 26)}</div>
        </div>
        <div className="absolute -inset-1 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl blur opacity-20 -z-10"></div>
      </div>
      
      {/* Texto */}
      <div className="flex-1 min-w-0 pt-0.5">
        <p className="text-[10px] font-black text-orange-500 dark:text-orange-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
          <Trophy size={12} className="stroke-[3]" /> LOGRO DESBLOQUEADO
        </p>
        <p className="text-sm font-bold text-slate-900 dark:text-white leading-snug mb-1">{achievement.titulo}</p>
        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">{achievement.descripcion}</p>
        
        {achievement.xp > 0 && (
          <div className="mt-2.5">
            <span className="inline-flex px-2.5 py-0.5 rounded-full bg-orange-100 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 text-orange-700 dark:text-orange-400 text-[10px] font-black tracking-wide">
              +{achievement.xp} XP
            </span>
          </div>
        )}
      </div>

      {/* Botón cerrar */}
      <button
        onClick={onDismiss}
        className="flex-shrink-0 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full transition-all"
        aria-label="Cerrar notificación"
      >
        <X size={14} className="stroke-[2.5]" />
      </button>
    </div>
  );
}

export default function AchievementToast() {
  const dispatch     = useDispatch();
  const user         = useSelector(selectCurrentUser);
  const notifications = useSelector(selectPendingNotifications);

  useEffect(() => {
    notifications.forEach(async (achievement) => {
      // Mostrar toast
      toast.custom(
        (t) => (
          <div
            className={clsx(
              'max-w-sm w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl dark:shadow-2xl dark:shadow-orange-900/20 p-4 transition-all duration-300 relative overflow-hidden',
              t.visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95 pointer-events-none'
            )}
          >
            <AchievementToastContent
              achievement={achievement}
              onDismiss={() => {
                toast.dismiss(t.id);
                dispatch(clearNotification(achievement.logroId));
              }}
            />
          </div>
        ),
        {
          id: `achievement-${achievement.logroId}`,
          duration: 5000,
          position: 'top-right',
        }
      );

      // Marcar como visto en IndexedDB
      if (user?.id) {
        await AchievementModel.markSeen(user.id, achievement.logroId);
        dispatch(clearNotification(achievement.logroId));
      }
    });
  }, [notifications, dispatch, user]);

  return (
    <Toaster
      position="top-right"
      containerStyle={{ top: '72px', right: '16px' }}
      toastOptions={{
        style: { background: 'transparent', boxShadow: 'none', padding: 0 },
      }}
    />
  );
}

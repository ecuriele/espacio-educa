import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLeaderboard, selectLeaderboard, selectTotalXp, selectRank } from '@store/slices/gamificationSlice';
import { selectCurrentUser, selectIsTeacher } from '@store/slices/authSlice';
import { getRankForXp } from '@store/slices/gamificationSlice';
import { Trophy, Medal } from 'lucide-react';
import { getIconForEmoji } from '@utils/iconMap';

const MEDALS = [
  <Medal size={24} className="text-yellow-500" fill="currentColor" />, 
  <Medal size={24} className="text-slate-400" fill="currentColor" />, 
  <Medal size={24} className="text-amber-600" fill="currentColor" />
];

export default function LeaderboardPage() {
  const dispatch     = useDispatch();
  const leaderboard  = useSelector(selectLeaderboard);
  const currentUser  = useSelector(selectCurrentUser);
  const myXp         = useSelector(selectTotalXp);
  const myRank       = useSelector(selectRank);
  const isTeacher    = useSelector(selectIsTeacher);

  useEffect(() => {
    if (currentUser) {
      const salonQuery = isTeacher ? 'all' : (currentUser.salon || 'basico');
      dispatch(fetchLeaderboard(salonQuery));
    }
  }, [dispatch, currentUser, isTeacher]);

  return (
    <div className="space-y-6 animate-fade-up max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-black font-display text-slate-900 dark:text-white flex items-center gap-2"><Trophy className="text-warning-500" size={28} /> Tabla de clasificación</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Los mejores estudiantes del módulo. ¿Llegas al Top 3?</p>
      </div>

      {/* Mi posición */}
      {!isTeacher && (
        <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 shadow-glow">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/10 flex items-center justify-center border-4 border-white/20 shrink-0 text-white font-bold text-3xl">
          {currentUser?.nombreMostrar?.[0]?.toUpperCase() ?? '?'}
        </div>
        <div className="text-center sm:text-left flex-1 text-white">
          <p className="text-sm font-bold text-slate-900 dark:text-white">{currentUser?.nombreMostrar ?? 'Tú'} <span className="text-accent-600 dark:text-brand-300 text-xs">(Tú)</span></p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{myRank?.label} · {myXp} XP</p>
        </div>
        <span className="flex items-center justify-center">{getIconForEmoji(myRank?.icon, 28)}</span>
        </div>
      )}

      {/* Lista */}
      <div className="bg-white dark:bg-surface-card border border-slate-200 dark:border-surface-border rounded-2xl overflow-hidden shadow-sm dark:shadow-none">
        {leaderboard.map((entry, index) => {
          const rank = getRankForXp(entry.xp);
          const isMe = entry.userId === currentUser?.id;
          return (
            <div
              key={entry.userId}
              className={`flex items-center gap-4 px-5 py-4 border-b border-slate-200 dark:border-surface-border last:border-0 transition-colors ${
                isMe ? 'bg-accent-50 dark:bg-brand-600/10' : 'hover:bg-slate-50 dark:hover:bg-surface-hover'
              }`}
            >
              <span className="text-xl w-8 text-center font-bold flex justify-center">
                {index < 3 ? MEDALS[index] : <span className="text-slate-400 text-sm">{index + 1}</span>}
              </span>
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-surface-border text-slate-600 dark:text-slate-400 font-bold flex items-center justify-center text-xs">
                {entry.displayName?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-semibold ${isMe ? 'text-brand-600 dark:text-brand-400' : 'text-slate-900 dark:text-white'}`}>
                  {entry.displayName} {isMe && '(Tú)'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{rank.label}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-accent-600 dark:text-accent-400">{entry.xp.toLocaleString()} XP</p>
                <div className="flex justify-end mt-0.5 text-slate-400 dark:text-slate-500">{getIconForEmoji(rank.icon, 16)}</div>
              </div>
            </div>
          );
        })}
        {leaderboard.length === 0 && (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400">
            <Trophy size={48} className="mb-4 text-slate-300 dark:text-slate-600" />
            <p className="text-sm">Aún no hay estudiantes en el ranking.</p>
          </div>
        )}
      </div>
    </div>
  );
}

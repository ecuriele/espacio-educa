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

  const top3 = leaderboard.slice(0, 3);
  const others = leaderboard.slice(3);

  return (
    <div className="space-y-6 animate-fade-up max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-black font-display text-slate-900 dark:text-white flex items-center gap-2"><Trophy className="text-warning-500" size={28} /> Tabla de clasificación</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Los mejores estudiantes del módulo. ¿Llegas al Top 3?</p>
      </div>

      {/* Mi posición */}
      {!isTeacher && (
        <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 shadow-glow">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/10 flex items-center justify-center border-4 border-white/20 shrink-0 text-white font-bold text-3xl overflow-hidden">
            {currentUser?.avatarUrl ? (
              <img src={currentUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              currentUser?.nombreMostrar?.[0]?.toUpperCase() ?? '?'
            )}
          </div>
          <div className="text-center sm:text-left flex-1 text-white">
            <p className="text-sm font-bold text-slate-900 dark:text-white">{currentUser?.nombreMostrar ?? 'Tú'} <span className="text-accent-600 dark:text-brand-300 text-xs">(Tú)</span></p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{myRank?.label} · {myXp} XP</p>
          </div>
          <span className="flex items-center justify-center">{getIconForEmoji(myRank?.icon, 28)}</span>
        </div>
      )}

      {/* Podio Top 3 */}
      {top3.length > 0 && (
        <div className="flex justify-center items-end gap-3 sm:gap-6 mt-12 mb-6 px-2">
          {top3[1] && <PodiumItem entry={top3[1]} position={2} isMe={top3[1].userId === currentUser?.id} />}
          {top3[0] && <PodiumItem entry={top3[0]} position={1} isMe={top3[0].userId === currentUser?.id} />}
          {top3[2] && <PodiumItem entry={top3[2]} position={3} isMe={top3[2].userId === currentUser?.id} />}
        </div>
      )}

      {/* Lista del resto */}
      {others.length > 0 && (
        <div className="bg-white dark:bg-surface-card border border-slate-200 dark:border-surface-border rounded-2xl overflow-hidden shadow-sm dark:shadow-none">
          {others.map((entry, index) => {
            const rank = getRankForXp(entry.xp);
            const isMe = entry.userId === currentUser?.id;
            const actualRank = index + 4; // Ya que saltamos los 3 primeros
            return (
              <div
                key={entry.userId}
                className={`flex items-center gap-4 px-5 py-4 border-b border-slate-200 dark:border-surface-border last:border-0 transition-colors ${
                  isMe ? 'bg-accent-50 dark:bg-brand-600/10' : 'hover:bg-slate-50 dark:hover:bg-surface-hover'
                }`}
              >
                <span className="text-xl w-8 text-center font-bold flex justify-center text-slate-400">
                  {actualRank}
                </span>
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-surface-border text-slate-600 dark:text-slate-400 font-bold flex items-center justify-center text-xs overflow-hidden shrink-0">
                  {entry.avatar ? (
                    <img src={entry.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    entry.displayName?.[0]?.toUpperCase() ?? '?'
                  )}
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
        </div>
      )}
      
      {leaderboard.length === 0 && (
        <div className="py-12 flex flex-col items-center justify-center text-slate-400 bg-white dark:bg-surface-card rounded-2xl border border-slate-200 dark:border-surface-border">
          <Trophy size={48} className="mb-4 text-slate-300 dark:text-slate-600" />
          <p className="text-sm">Aún no hay estudiantes en el ranking.</p>
        </div>
      )}
    </div>
  );
}

function PodiumItem({ entry, position, isMe }) {
  const isFirst = position === 1;
  const heightClass = position === 1 ? 'h-36 sm:h-44' : position === 2 ? 'h-28 sm:h-36' : 'h-24 sm:h-28';
  
  const colorClass = 
    position === 1 ? 'from-yellow-400 to-amber-500 border-yellow-200 dark:border-yellow-500/30 text-yellow-900 shadow-yellow-500/40' :
    position === 2 ? 'from-slate-300 to-slate-400 border-slate-200 dark:border-slate-500/30 text-slate-800 shadow-slate-400/30' :
    'from-orange-400 to-orange-600 border-orange-300 dark:border-orange-500/30 text-orange-950 shadow-orange-600/30';

  const badgeIcon = 
    position === 1 ? <span className="text-4xl drop-shadow-md">🥇</span> :
    position === 2 ? <span className="text-3xl drop-shadow-md">🥈</span> :
    <span className="text-3xl drop-shadow-md">🥉</span>;

  const badgeBg = 
    position === 1 ? 'bg-yellow-100 text-yellow-600 border-yellow-300' :
    position === 2 ? 'bg-slate-100 text-slate-600 border-slate-300' :
    'bg-orange-100 text-orange-700 border-orange-300';

  return (
    <div className="flex flex-col items-center flex-1 max-w-[120px] sm:max-w-[140px] animate-fade-up" style={{ animationDelay: `${position * 150}ms` }}>
      {/* Avatar */}
      <div className={`relative mb-3 ${isFirst ? 'w-20 h-20 sm:w-24 sm:h-24' : 'w-16 h-16 sm:w-20 sm:h-20'} rounded-full bg-slate-200 dark:bg-surface-border flex items-center justify-center font-bold text-xl sm:text-2xl shadow-xl border-4 ${isMe ? 'border-brand-500' : 'border-white dark:border-surface-card'} z-10 transition-transform hover:scale-105`}>
        {entry.avatar ? (
          <img src={entry.avatar} alt="Avatar" className="w-full h-full object-cover rounded-full" />
        ) : (
          <span className="text-slate-500 dark:text-slate-400">{entry.displayName?.[0]?.toUpperCase() ?? '?'}</span>
        )}
        {/* Badge position */}
        <div className={`absolute -bottom-2 ${isFirst ? '-right-1' : '-right-2'} ${badgeBg} w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-black border-2 shadow-sm`}>
          {position}
        </div>
      </div>
      
      {/* User Info */}
      <div className="text-center mb-3 w-full px-1">
        <p className={`text-sm font-bold truncate ${isMe ? 'text-brand-600 dark:text-brand-400' : 'text-slate-800 dark:text-slate-200'}`}>
          {entry.displayName.split(' ')[0]}
        </p>
        <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-semibold truncate">{entry.xp.toLocaleString()} XP</p>
      </div>

      {/* Pillar */}
      <div className={`w-full rounded-t-2xl bg-gradient-to-t ${colorClass} ${heightClass} flex flex-col items-center justify-start pt-4 sm:pt-6 relative overflow-hidden shadow-2xl border-t border-l border-r`}>
        <div className="absolute inset-0 bg-white/20 dark:bg-black/10"></div>
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/30 to-transparent"></div>
        <div className="relative z-10 opacity-90 drop-shadow-lg">
          {badgeIcon}
        </div>
      </div>
    </div>
  );
}

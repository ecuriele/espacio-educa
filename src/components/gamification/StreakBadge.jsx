import React from 'react';
import clsx from 'clsx';
import { Flame, Trophy, Zap, Dumbbell } from 'lucide-react';

export default function StreakBadge({ streak = 0, compact = false }) {
  const isActive = streak > 0;
  const isHot    = streak >= 7;

  if (compact) {
    return (
      <div
        className={clsx(
          'flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold transition-all',
          isActive ? 'bg-warning-500/15 text-warning-400' : 'bg-surface-hover text-slate-500'
        )}
        title={`Racha: ${streak} día${streak !== 1 ? 's' : ''} consecutivo${streak !== 1 ? 's' : ''}`}
      >
        <span className={clsx(isHot && 'animate-streak-flame', 'text-warning-500')}><Flame size={16} /></span>
        <span>{streak}</span>
      </div>
    );
  }

  return (
    <div
      className={clsx(
        'flex flex-col items-center p-4 rounded-2xl border transition-all',
        isActive
          ? 'bg-warning-500/10 border-warning-500/30 shadow-glow-green'
          : 'bg-surface-hover border-surface-border'
      )}
    >
      <span className={clsx('mb-1 text-warning-500', isHot && 'animate-streak-flame')}><Flame size={36} /></span>
      <span className={clsx('text-3xl font-black', isActive ? 'text-warning-400' : 'text-slate-500')}>
        {streak}
      </span>
      <span className="text-xs text-slate-400 mt-0.5">
        día{streak !== 1 ? 's' : ''} seguido{streak !== 1 ? 's' : ''}
      </span>
      {isActive && (
        <div className="flex items-center justify-center gap-1.5 text-xs text-warning-400/70 mt-2">
          {streak >= 30 ? <><Trophy size={14} /> ¡Leyenda!</> :
           streak >= 7  ? <><Zap size={14} /> ¡Imparable!</> :
           <><Dumbbell size={14} /> ¡Sigue así!</>}
        </div>
      )}
    </div>
  );
}

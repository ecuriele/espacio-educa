import React from 'react';
import clsx from 'clsx';

const COLOR_MAP = {
  brand:   { bar: 'bg-gradient-to-r from-brand-500 to-brand-400', text: 'text-brand-300' },
  accent:  { bar: 'bg-gradient-to-r from-accent-500 to-accent-400', text: 'text-accent-300' },
  warning: { bar: 'bg-gradient-to-r from-warning-500 to-warning-400', text: 'text-warning-300' },
};

const SIZE_MAP = {
  sm: { bar: 'h-1.5', text: 'text-xs' },
  md: { bar: 'h-2.5', text: 'text-sm' },
  lg: { bar: 'h-4',   text: 'text-base' },
};

export default function ProgressBar({
  percent = 0,
  label = '',
  sublabel = '',
  color = 'brand',
  size = 'md',
  animated = true,
  showPercent = true,
  className = '',
}) {
  const clampedPercent = Math.min(100, Math.max(0, percent));
  const colors = COLOR_MAP[color] || COLOR_MAP.brand;
  const sizes  = SIZE_MAP[size]   || SIZE_MAP.md;

  return (
    <div className={clsx('w-full', className)}>
      {/* Labels */}
      {(label || showPercent) && (
        <div className="flex justify-between items-center mb-1">
          <span className={clsx('font-medium text-slate-300', sizes.text)}>{label}</span>
          {showPercent && (
            <span className={clsx('font-semibold', sizes.text, colors.text)}>{clampedPercent}%</span>
          )}
        </div>
      )}
      {sublabel && <p className="text-xs text-slate-500 mb-1">{sublabel}</p>}

      {/* Track */}
      <div className={clsx('w-full rounded-full bg-surface-hover overflow-hidden', sizes.bar)}>
        {/* Fill */}
        <div
          className={clsx(
            'h-full rounded-full transition-all duration-700 ease-out',
            colors.bar,
            animated && 'animate-progress-fill'
          )}
          style={{ width: `${clampedPercent}%`, '--progress-width': `${clampedPercent}%` }}
          role="progressbar"
          aria-valuenow={clampedPercent}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}

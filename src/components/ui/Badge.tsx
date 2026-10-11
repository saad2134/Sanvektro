import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'emerald' | 'cyan' | 'amber' | 'rose' | 'slate' | 'indigo';
  size?: 'sm' | 'md';
  isSquircle?: boolean;
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'emerald',
  size = 'md',
  isSquircle = false,
  className = '',
  children,
  ...props
}) => {
  const variantStyles = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    slate: 'bg-slate-800/80 text-slate-300 border-slate-700/60',
    indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
  }[variant];

  const sizeStyles = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1';
  const geometryStyles = isSquircle ? 'aspect-square flex items-center justify-center rounded-xl p-2' : 'rounded-lg';

  return (
    <span
      className={`inline-flex items-center font-mono font-medium border ${variantStyles} ${sizeStyles} ${geometryStyles} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: 'safe' | 'caution' | 'danger' | 'neutral' | 'indigo';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  className = '',
  ...props
}) => {
  const styles = {
    safe: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    caution: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    danger: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    neutral: 'bg-slate-800/60 text-slate-300 border border-slate-700/50',
    indigo: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium tracking-wide uppercase ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'squircle';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  children,
  ...props
}) => {
  const variantStyles = {
    primary: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-lg shadow-emerald-500/20 active:scale-[0.98]',
    secondary: 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700/80 active:scale-[0.98]',
    danger: 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 active:scale-[0.98]',
    ghost: 'hover:bg-slate-800/60 text-slate-400 hover:text-slate-200',
    squircle: 'aspect-square flex items-center justify-center rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/60 active:scale-95'
  }[variant];

  const sizeStyles = variant === 'squircle' ? 'p-2.5' : {
    sm: 'text-xs px-2.5 py-1.5 rounded-lg',
    md: 'text-sm px-4 py-2 rounded-xl',
    lg: 'text-base px-6 py-2.5 rounded-xl font-semibold'
  }[size];

  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none ${variantStyles} ${sizeStyles} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
      ) : null}
      {children}
    </button>
  );
};

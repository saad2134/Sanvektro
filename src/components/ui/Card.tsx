import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'surface' | 'glass' | 'subtle';
  isPadded?: boolean;
}

export const Card: React.FC<CardProps> = ({
  variant = 'surface',
  isPadded = true,
  className = '',
  children,
  ...props
}) => {
  const variantStyles = {
    surface: 'bg-[#090d16]/90 border border-slate-800/80 shadow-xl backdrop-blur-md',
    glass: 'bg-[#0d121e]/80 border border-slate-800/90 shadow-2xl backdrop-blur-lg',
    subtle: 'bg-slate-900/40 border border-slate-800/60'
  }[variant];

  return (
    <div
      className={`rounded-2xl transition-all ${variantStyles} ${isPadded ? 'p-4 sm:p-5' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

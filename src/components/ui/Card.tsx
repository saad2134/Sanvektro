import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'surface' | 'glass';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  ...props
}) => {
  const variantStyles = {
    default: 'bg-[#111320] border border-[#1E2238]',
    surface: 'bg-[#0E101A] border border-[#1A1E30]',
    glass: 'bg-[#111320]/80 backdrop-blur-md border border-[#1E2238]/60',
  };

  return (
    <div
      className={`rounded-xl p-5 md:p-6 transition-colors ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'gold' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  fullWidth?: boolean;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  fullWidth = false,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-full transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed';

  const sizeStyles = {
    sm: 'px-4 py-2 text-xs tracking-wider uppercase',
    md: 'px-6 py-3 text-sm tracking-wider uppercase',
    lg: 'px-8 py-4 text-base tracking-wider uppercase font-semibold',
  };

  const variantStyles = {
    primary: 'bg-[#6B0D2F] text-white hover:bg-[#540924] shadow-md hover:shadow-lg hover:shadow-[#6B0D2F]/20',
    gold: 'bg-[#D4AF37] text-[#1A1315] hover:bg-[#B8952B] font-semibold shadow-md hover:shadow-lg hover:shadow-[#D4AF37]/30',
    secondary: 'bg-[#FAF7F2] text-[#6B0D2F] border border-[#6B0D2F] hover:bg-[#6B0D2F] hover:text-white',
    outline: 'bg-transparent text-[#1A1315] border border-[#D4AF37] hover:border-[#6B0D2F] hover:text-[#6B0D2F]',
    ghost: 'bg-transparent text-[#1A1315] hover:bg-[#6B0D2F]/10 hover:text-[#6B0D2F]',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

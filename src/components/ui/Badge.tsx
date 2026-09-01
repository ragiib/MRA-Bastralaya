import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'discount' | 'bestseller' | 'new' | 'tag' | 'gold' | 'soldout';
  className?: string;
}

export default function Badge({ children, variant = 'tag', className = '' }: BadgeProps) {
  const variantStyles = {
    discount: 'bg-[#6B0D2F] text-white font-bold',
    bestseller: 'bg-[#D4AF37] text-[#1A1315] font-semibold',
    new: 'bg-[#1A1315] text-white font-medium',
    tag: 'bg-[#F3ECE2] text-[#6B0D2F] font-medium border border-[#D4AF37]/30',
    gold: 'bg-[#FAF7F2] text-[#B8952B] border border-[#D4AF37] font-semibold',
    soldout: 'bg-red-950/90 text-red-200 border border-red-500/50 font-bold',
  };

  return (
    <span
      className={`inline-block px-2.5 py-1 text-[11px] uppercase tracking-wider rounded-md ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

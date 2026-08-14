import React from 'react';

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export default function SectionHeading({
  title,
  subtitle,
  align = 'center',
  className = '',
}: SectionHeadingProps) {
  const alignment = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end',
  };

  return (
    <div className={`flex flex-col mb-10 ${alignment[align]} ${className}`}>
      {/* Subtitle / Tag */}
      {subtitle && (
        <span className="text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-semibold mb-2">
          {subtitle}
        </span>
      )}

      {/* Main Serif Heading */}
      <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-[#1A1315] font-normal tracking-wide">
        {title}
      </h2>

      {/* Luxury Indian Decorative Line Accent */}
      <div className="flex items-center gap-2 mt-3 text-[#D4AF37]">
        <div className="h-[1px] w-8 bg-[#D4AF37]/50" />
        <span className="text-xs font-serif">◈</span>
        <div className="h-[1px] w-8 bg-[#D4AF37]/50" />
      </div>
    </div>
  );
}

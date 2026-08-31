import React from 'react';

export default function TopAnnouncement() {
  return (
    <div className="bg-[#6B0D2F] text-white text-[11px] sm:text-xs py-2 px-4 text-center tracking-wider font-medium border-b border-[#D4AF37]/30">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 sm:gap-6 flex-wrap">
        <span>✨ Welcome to MRA Bastralaya — Sarees, Ladies Suits & Bed Sheets</span>
        <span className="hidden md:inline text-[#D4AF37]/70">|</span>
        <span className="hidden md:inline text-white/90">Store Enquiries & Customer Support Available</span>
        <span className="hidden lg:inline text-[#D4AF37]/70">|</span>
        <span className="hidden lg:inline text-[#D4AF37]">In-Store & Online</span>
      </div>
    </div>
  );
}


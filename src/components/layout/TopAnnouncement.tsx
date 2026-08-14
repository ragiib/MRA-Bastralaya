import React from 'react';

export default function TopAnnouncement() {
  return (
    <div className="bg-[#6B0D2F] text-white text-[11px] sm:text-xs py-2 px-4 text-center tracking-wider font-medium border-b border-[#D4AF37]/30">
      <div className="max-w-7xl mx-auto flex items-center justify-between sm:justify-center gap-4">
        <span>✨ Free Express Shipping across India on orders above ₹2,999</span>
        <span className="hidden md:inline text-[#D4AF37]">|</span>
        <span className="hidden md:inline">100% Authentic Weaver Certified Handloom Sarees</span>
        <span className="hidden lg:inline text-[#D4AF37]">|</span>
        <span className="hidden lg:inline">📞 Store Helpdesk: +91 98765 43210</span>
      </div>
    </div>
  );
}

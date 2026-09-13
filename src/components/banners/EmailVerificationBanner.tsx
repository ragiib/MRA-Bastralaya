'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Mail, ArrowRight } from 'lucide-react';
import { useShop } from '@/context/ShopContext';

interface EmailVerificationBannerProps {
  className?: string;
}

export default function EmailVerificationBanner({ className = '' }: EmailVerificationBannerProps) {
  const pathname = usePathname();
  const { user, isAuthenticated } = useShop();

  // Only render for authenticated users whose email is NOT yet verified
  if (!isAuthenticated || !user || user.emailVerified) {
    return null;
  }

  // Do not show on the verification page itself
  if (pathname === '/account/verify-email') {
    return null;
  }

  const verifyUrl = `/account/verify-email?callbackUrl=${encodeURIComponent(pathname || '/account')}`;

  return (
    <aside
      aria-label="Email Verification Reminder"
      className={`bg-[#3B121F] text-white border-b border-[#D4AF37]/40 py-2.5 px-3 sm:px-6 relative z-30 transition-all shadow-xs ${className}`}
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4 text-xs">
        <div className="flex items-center gap-2.5 flex-1 min-w-0 text-center sm:text-left">
          <div className="w-5 h-5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center shrink-0">
            <Mail className="w-3 h-3 text-[#D4AF37]" />
          </div>
          <p className="tracking-wide">
            <span className="font-medium text-white/95">
              Verify your email address (<span className="text-[#D4AF37]">{user.email}</span>)
            </span>
            <span className="hidden md:inline text-white/70">
              {' '}— required to place orders via WhatsApp and receive dispatch updates.
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={verifyUrl}
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#D4AF37] hover:bg-[#C59F2A] text-[#1A1315] font-semibold text-[11px] uppercase tracking-wider transition-colors shadow-xs group"
          >
            <span>Verify Email</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </aside>
  );
}

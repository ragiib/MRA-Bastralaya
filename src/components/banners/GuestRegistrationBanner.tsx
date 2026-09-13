'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, X, ArrowRight } from 'lucide-react';
import { useShop } from '@/context/ShopContext';

const SESSION_STORAGE_KEY = 'mra_dismiss_guest_banner';

export default function GuestRegistrationBanner() {
  const { isAuthenticated } = useShop();
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    // Check session storage on client mount
    if (typeof window !== 'undefined') {
      const dismissed = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (!dismissed) {
        setIsDismissed(false);
      }
    }
  }, []);

  // Do not show if authenticated or dismissed for this browser session
  if (isAuthenticated || isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(SESSION_STORAGE_KEY, 'true');
    }
  };

  return (
    <aside
      aria-label="Guest Welcome Notification"
      className="bg-[#590B27] text-white border-b border-[#D4AF37]/40 py-2 px-3 sm:px-6 relative z-30 transition-all shadow-xs"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-0 justify-center sm:justify-start">
          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
          <p className="tracking-wide truncate sm:text-clip">
            <span className="font-medium text-white/95">
              Create an account for faster ordering &amp; doorstep delivery
            </span>
            <span className="hidden md:inline text-white/70">
              {' '}— enjoy saved wishlist access and real-time WhatsApp updates.
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/register"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37] hover:bg-[#C59F2A] text-[#1A1315] font-semibold text-[11px] uppercase tracking-wider transition-colors shadow-xs group"
          >
            <span>Sign Up</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <button
            type="button"
            onClick={handleDismiss}
            className="p-1 text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Dismiss sign up banner for this session"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}

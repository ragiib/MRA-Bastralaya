'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Check, ArrowRight, UserCheck, Phone, MapPin } from 'lucide-react';
import { SafeUser, User } from '@/types/auth';
import { hasCompleteContact, hasCompleteAddress, isProfileComplete } from '@/lib/utils/address';
import { useShop } from '@/context/ShopContext';

interface ProfileCompletionStepperProps {
  user?: User | SafeUser | null;
  callbackUrl?: string;
  className?: string;
}

export default function ProfileCompletionStepper({
  user: propUser,
  callbackUrl: propCallbackUrl,
  className = '',
}: ProfileCompletionStepperProps) {
  const pathname = usePathname();
  const { user: contextUser, isAuthenticated } = useShop();

  const user = propUser !== undefined ? propUser : contextUser;

  // Only display for authenticated users who have not completed their profile
  if (!user || !isAuthenticated || isProfileComplete(user)) {
    return null;
  }

  const callbackUrl = propCallbackUrl || pathname || '/account';
  const completeProfileHref = `/account/complete-profile?callbackUrl=${encodeURIComponent(callbackUrl)}`;

  const isContactDone = hasCompleteContact(user);
  const isAddressDone = hasCompleteAddress(user);

  return (
    <div
      className={`bg-white rounded-2xl border border-[#D4AF37]/40 shadow-sm p-5 sm:p-6 relative overflow-hidden animate-fadeIn ${className}`}
    >
      {/* Decorative Brand Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#6B0D2F] via-[#D4AF37] to-[#6B0D2F]" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        {/* Left Side: Summary & Stepper */}
        <div className="space-y-3 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#6B0D2F] border border-[#D4AF37]/30">
              Profile Setup Pending
            </span>
            <span className="text-xs text-[#6E676A]">
              Complete your profile for instant WhatsApp ordering &amp; doorstep delivery
            </span>
          </div>

          {/* Stepper Progress Bar */}
          <div className="flex items-center flex-wrap gap-2 sm:gap-3 pt-1 text-xs">
            {/* Step 1: Account Created */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium">
              <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                <Check className="w-2.5 h-2.5" />
              </span>
              <span>1. Account Created</span>
            </div>

            <span className="text-gray-300 hidden sm:inline">→</span>

            {/* Step 2: Contact Info */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium border ${
                isContactDone
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-amber-50 border-amber-300 text-amber-900 ring-2 ring-amber-400/20'
              }`}
            >
              {isContactDone ? (
                <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                  <Check className="w-2.5 h-2.5" />
                </span>
              ) : (
                <span className="w-4 h-4 rounded-full bg-[#6B0D2F] text-white flex items-center justify-center text-[10px] font-bold">
                  2
                </span>
              )}
              <Phone className="w-3 h-3 text-[#6B0D2F]" />
              <span>2. Contact Phone</span>
              {!isContactDone && (
                <span className="text-[10px] bg-amber-200/60 text-amber-900 px-1.5 rounded-sm ml-0.5">
                  Needs Action
                </span>
              )}
            </div>

            <span className="text-gray-300 hidden sm:inline">→</span>

            {/* Step 3: Delivery Address */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium border ${
                isAddressDone
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : isContactDone
                  ? 'bg-amber-50 border-amber-300 text-amber-900 ring-2 ring-amber-400/20'
                  : 'bg-gray-50 border-gray-200 text-gray-400'
              }`}
            >
              {isAddressDone ? (
                <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                  <Check className="w-2.5 h-2.5" />
                </span>
              ) : (
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isContactDone ? 'bg-[#6B0D2F] text-white' : 'bg-gray-300 text-white'
                  }`}
                >
                  3
                </span>
              )}
              <MapPin className="w-3 h-3" />
              <span>3. Delivery Address</span>
              {!isAddressDone && isContactDone && (
                <span className="text-[10px] bg-amber-200/60 text-amber-900 px-1.5 rounded-sm ml-0.5">
                  Needs Action
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: CTA Button */}
        <div className="shrink-0 flex items-center gap-3">
          <Link
            href={completeProfileHref}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#6B0D2F] hover:bg-[#540924] text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-sm hover:shadow-md group"
          >
            <UserCheck className="w-4 h-4 text-[#D4AF37]" />
            <span>Complete Profile</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}

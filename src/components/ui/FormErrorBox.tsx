'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';

interface FormErrorBoxProps {
  error?: string | null;
  id?: string;
  className?: string;
  variant?: 'light' | 'dark';
  actionLink?: {
    href: string;
    label: string;
  };
}

/**
 * Reusable prominent error box for form-level notices and actions.
 * Positioned right next to submit/action buttons, with full accessibility support.
 */
export default function FormErrorBox({
  error,
  id,
  className = '',
  variant = 'light',
  actionLink,
}: FormErrorBoxProps) {
  if (!error) return null;

  const isDark = variant === 'dark';

  return (
    <div
      id={id}
      role="alert"
      aria-live="assertive"
      className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-xs sm:text-[13px] leading-relaxed transition-all animate-fadeIn ${
        isDark
          ? 'bg-red-950/80 border-red-800 text-red-200 shadow-lg'
          : 'bg-[#FEF2F2] border-red-200 text-[#991B1B] shadow-xs'
      } ${className}`}
    >
      <AlertCircle
        className={`w-4 h-4 shrink-0 mt-0.5 ${
          isDark ? 'text-red-400' : 'text-red-600'
        }`}
      />
      <div className="flex-1">
        <span className="font-medium">{error}</span>
        {actionLink && (
          <div className="mt-1.5">
            <a
              href={actionLink.href}
              className={`font-semibold underline ${
                isDark ? 'text-[#D4AF37] hover:text-white' : 'text-[#6B0D2F] hover:text-[#540924]'
              }`}
            >
              {actionLink.label} &rarr;
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

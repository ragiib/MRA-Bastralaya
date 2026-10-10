'use client';

import React from 'react';
import { Check, Circle } from 'lucide-react';

interface PasswordRequirementsLiveProps {
  password?: string;
  className?: string;
}

/**
 * Live password strength indicators showing 8+ characters, letter, and number,
 * transitioning smoothly from gray to emerald green as met.
 */
export default function PasswordRequirementsLive({
  password = '',
  className = '',
}: PasswordRequirementsLiveProps) {
  const hasMinLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  const rules = [
    { label: '8+ characters', met: hasMinLength },
    { label: 'At least 1 letter', met: hasLetter },
    { label: 'At least 1 number', met: hasNumber },
  ];

  return (
    <div
      className={`p-2.5 rounded-xl bg-[#FAF7F2] border border-[#D4AF37]/30 text-[11px] space-y-1.5 ${className}`}
      aria-label="Password strength requirements"
    >
      <div className="text-[10px] uppercase font-semibold tracking-wider text-[#6E676A]">
        Password Requirements:
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-2">
        {rules.map((rule, idx) => (
          <div
            key={idx}
            className={`flex items-center gap-1.5 transition-colors duration-200 ${
              rule.met
                ? 'text-emerald-700 font-semibold'
                : 'text-gray-400'
            }`}
          >
            {rule.met ? (
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <Check className="w-2.5 h-2.5 text-emerald-600 stroke-[3]" />
              </span>
            ) : (
              <Circle className="w-3 h-3 text-gray-300 shrink-0" />
            )}
            <span>{rule.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';

interface FieldErrorProps {
  error?: string | null;
  id?: string;
  className?: string;
}

/**
 * Reusable field-level error label rendered directly below an input.
 */
export default function FieldError({ error, id, className = '' }: FieldErrorProps) {
  if (!error) return null;

  return (
    <div
      id={id}
      role="alert"
      aria-live="assertive"
      className={`text-[11px] sm:text-xs text-red-600 mt-1.5 flex items-center gap-1.5 font-medium animate-fadeIn ${className}`}
    >
      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-500" />
      <span>{error}</span>
    </div>
  );
}

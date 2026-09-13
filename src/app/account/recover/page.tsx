'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Phone, ArrowRight, ShieldCheck, MessageCircle, KeyRound, AlertCircle } from 'lucide-react';
import { isValidIndianPhone } from '@/lib/utils/phone';

export default function AccountRecoveryPage() {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recoveryResult, setRecoveryResult] = useState<{
    submittedPhone: string;
    whatsappUrl: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isValidIndianPhone(phone)) {
      setError('Please enter a valid 10-digit Indian mobile number (e.g. 98765 43210).');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/recover-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to process account recovery. Please try again.');
        setIsLoading(false);
        return;
      }

      setRecoveryResult({
        submittedPhone: data.phone,
        whatsappUrl: data.whatsappUrl,
      });
    } catch {
      setError('A network error occurred. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col justify-center items-center px-4 py-12 selection:bg-[#D4AF37]/30 selection:text-[#6B0D2F]">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#D4AF37]/30 p-8 sm:p-10 relative">
        {/* Decorative Top Accent */}
        <div className="absolute -top-px left-8 right-8 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />

        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center group mb-4">
            <span className="font-serif text-2xl tracking-[0.18em] text-[#1A1315] group-hover:text-[#6B0D2F] transition-colors">
              MRA BASTRALAYA
            </span>
            <span className="text-[9px] uppercase tracking-[0.25em] text-[#D4AF37] font-semibold">
              Textiles &amp; Apparel
            </span>
          </Link>

          <h1 className="font-serif text-2xl text-[#1A1315] font-normal">Account Recovery</h1>
          <p className="text-xs text-[#6E676A] mt-1.5 leading-relaxed">
            Can&apos;t remember the email address associated with your account? Enter your registered mobile number below.
          </p>
        </div>

        {/* Error Notice */}
        {error && (
          <div className="mb-6 p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5 animate-fadeIn">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!recoveryResult ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-[#1A1315] mb-1.5">
                Registered Mobile Phone Number
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-3 flex items-center gap-1 text-gray-400 text-xs font-medium pointer-events-none">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  <span>+91</span>
                </div>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="98765 43210"
                  className="w-full bg-[#FAF7F2] border border-[#D4AF37]/30 rounded-xl px-3.5 py-2.5 pl-16 text-sm text-[#1A1315] placeholder-gray-400 focus:outline-none focus:border-[#6B0D2F] focus:ring-1 focus:ring-[#6B0D2F] transition-all"
                  autoFocus
                />
              </div>
              <p className="text-[10px] text-gray-500 mt-1">
                Enter the 10-digit mobile number linked to your previous orders or account.
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-[#6B0D2F] hover:bg-[#540924] text-white py-3 px-4 rounded-xl font-medium text-xs uppercase tracking-widest transition-all shadow-md hover:shadow-lg disabled:opacity-60 flex items-center justify-center gap-2 group cursor-pointer"
            >
              {isLoading ? (
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Continue Account Recovery</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="space-y-5 animate-fadeIn">
            <div className="p-4 rounded-xl bg-amber-50/70 border border-[#D4AF37]/40 text-xs text-[#2C2426] space-y-2.5">
              <div className="flex items-center gap-2 text-[#6B0D2F] font-semibold text-sm">
                <AlertCircle className="w-4 h-4 text-[#D4AF37]" />
                <span>Manual Verification Required</span>
              </div>
              <p className="leading-relaxed text-[#5A5052]">
                For your privacy and security, email addresses are never revealed on screen.
              </p>
              <p className="leading-relaxed text-[#5A5052]">
                Please connect with our store support team directly via WhatsApp using phone{' '}
                <strong className="text-[#1A1315]">{recoveryResult.submittedPhone}</strong>. A staff member will verify your identity and guide you to regain access.
              </p>
            </div>

            <a
              href={recoveryResult.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20BD5A] text-white text-xs uppercase tracking-wider font-semibold transition-all shadow-md hover:shadow-lg cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Contact Store on WhatsApp</span>
            </a>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setRecoveryResult(null);
                  setPhone('');
                }}
                className="text-xs text-[#6E676A] hover:text-[#6B0D2F] underline"
              >
                ← Try a different mobile number
              </button>
            </div>
          </div>
        )}

        {/* Navigation Back */}
        <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-center gap-4 text-[11px] text-[#6E676A]">
          <Link href="/login" className="hover:text-[#6B0D2F] flex items-center gap-1">
            <KeyRound className="w-3 h-3" />
            <span>Sign In</span>
          </Link>
          <span className="text-gray-300">•</span>
          <Link href="/forgot-password" className="hover:text-[#6B0D2F]">
            Forgot Password?
          </Link>
          <span className="text-gray-300">•</span>
          <div className="flex items-center gap-1 text-[#8C8285]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Verified Support</span>
          </div>
        </div>
      </div>
    </div>
  );
}

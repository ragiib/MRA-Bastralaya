'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Mail, Eye, EyeOff, ShieldAlert, ArrowRight, ArrowLeft } from 'lucide-react';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/admin';
  const urlError = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(
    urlError === 'unauthorized'
      ? 'Access denied. You must be an authenticated Administrator to enter this area.'
      : ''
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, requiredRole: 'ADMIN' }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Authentication failed. Please verify administrator credentials.');
        setIsLoading(false);
        return;
      }

      // Success -> navigate to admin dashboard
      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError('A network error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-[#1E181A] text-[#FAF7F2] rounded-2xl shadow-2xl border border-[#D4AF37]/30 p-8 sm:p-10 relative">
      {/* Decorative Gold Border Glow */}
      <div className="absolute -top-px left-8 right-8 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />

      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#2A1F23] border border-[#D4AF37]/40 text-[#D4AF37] mb-3 shadow-inner">
          <Lock className="w-6 h-6" />
        </div>
        <h1 className="font-serif text-2xl tracking-widest text-[#FAF7F2] uppercase font-normal">
          MRA BASTRALAYA
        </h1>
        <div className="mt-1 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#D4AF37]">
            Staff & Administration Portal
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Secure, server-restricted console for store administrators only.
        </p>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="mb-6 p-3.5 rounded-xl bg-red-950/80 border border-red-800 text-red-200 text-xs flex items-start gap-2.5 animate-fadeIn">
          <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{error}</span>
        </div>
      )}

      {/* Admin Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-gray-300 mb-1.5">
            Admin Email Address
          </label>
          <div className="relative">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@mrabastralaya.com"
              className="w-full bg-[#140F11] border border-[#D4AF37]/30 rounded-xl px-3.5 py-2.5 pl-10 text-sm text-[#FAF7F2] placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
            />
            <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-gray-300 mb-1.5">
            Administrator Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-[#140F11] border border-[#D4AF37]/30 rounded-xl px-3.5 py-2.5 pl-10 pr-10 text-sm text-[#FAF7F2] placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
            />
            <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-200 transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-3 bg-[#D4AF37] hover:bg-[#B8952B] text-[#1A1315] py-3 px-4 rounded-xl font-semibold text-xs uppercase tracking-widest transition-all shadow-lg hover:shadow-xl disabled:opacity-60 flex items-center justify-center gap-2 group cursor-pointer"
        >
          {isLoading ? (
            <span className="inline-block w-4 h-4 border-2 border-[#1A1315]/30 border-t-[#1A1315] rounded-full animate-spin" />
          ) : (
            <>
              <span>Authenticate & Enter Console</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </>
          )}
        </button>
      </form>

      {/* Security Notice Note */}
      <div className="mt-8 pt-6 border-t border-white/10 text-center space-y-2 text-[11px] text-gray-400">
        <p className="leading-relaxed">
          Public registration is disabled. Admin accounts are provisioned solely through secure server-side management.
        </p>
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-[#D4AF37] hover:underline pt-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Public Storefront</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-[#120D0E] flex flex-col justify-center items-center px-4 py-12 selection:bg-[#D4AF37]/30 selection:text-[#FAF7F2]">
      <Suspense fallback={<div className="text-xs text-gray-400">Loading...</div>}>
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}

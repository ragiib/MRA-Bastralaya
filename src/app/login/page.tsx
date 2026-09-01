'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, ShoppingBag } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/account';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, requiredRole: 'CUSTOMER' }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Authentication failed. Please check your credentials.');
        setIsLoading(false);
        return;
      }

      // Success -> navigate to callbackUrl or account
      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError('A network error occurred. Please check your connection and try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#D4AF37]/30 p-8 sm:p-10 relative">
      {/* Decorative Top Accent */}
      <div className="absolute -top-px left-8 right-8 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />

      {/* Header */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex flex-col items-center group mb-4">
          <span className="font-serif text-2xl tracking-[0.18em] text-[#1A1315] group-hover:text-[#6B0D2F] transition-colors">
            MRA BASTRALAYA
          </span>
          <span className="text-[9px] uppercase tracking-[0.25em] text-[#D4AF37] font-semibold">
            Textiles & Apparel
          </span>
        </Link>
        <h1 className="font-serif text-2xl text-[#1A1315] font-normal">Customer Sign In</h1>
        <p className="text-xs text-[#6E676A] mt-1.5">
          Access your personal account, saved items, and order preferences.
        </p>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="mb-6 p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5 animate-fadeIn">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-[#1A1315] mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full bg-[#FAF7F2] border border-[#D4AF37]/30 rounded-xl px-3.5 py-2.5 pl-10 text-sm text-[#1A1315] placeholder-gray-400 focus:outline-none focus:border-[#6B0D2F] focus:ring-1 focus:ring-[#6B0D2F] transition-all"
            />
            <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-medium uppercase tracking-wider text-[#1A1315]">
              Password
            </label>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#FAF7F2] border border-[#D4AF37]/30 rounded-xl px-3.5 py-2.5 pl-10 pr-10 text-sm text-[#1A1315] placeholder-gray-400 focus:outline-none focus:border-[#6B0D2F] focus:ring-1 focus:ring-[#6B0D2F] transition-all"
            />
            <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
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
              <span>Sign In to Account</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-6 text-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#D4AF37]/20" />
        </div>
        <span className="relative px-3 bg-white text-[11px] uppercase tracking-wider text-[#6E676A]">
          New Customer?
        </span>
      </div>

      {/* Registration Callout */}
      <div className="text-center">
        <Link
          href="/register"
          className="inline-flex items-center justify-center w-full py-2.5 px-4 rounded-xl border border-[#D4AF37]/40 text-[#6B0D2F] hover:bg-[#FAF7F2] font-medium text-xs uppercase tracking-wider transition-colors"
        >
          Create New Customer Account
        </Link>
      </div>

      {/* Trust Badge */}
      <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-center gap-4 text-[11px] text-[#6E676A]">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Secure Encrypted Session</span>
        </div>
        <span className="text-gray-300">•</span>
        <Link href="/" className="hover:text-[#6B0D2F] flex items-center gap-1">
          <ShoppingBag className="w-3 h-3" />
          <span>Return to Store</span>
        </Link>
      </div>
    </div>
  );
}

export default function CustomerLoginPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col justify-center items-center px-4 py-12 selection:bg-[#D4AF37]/30 selection:text-[#6B0D2F]">
      <Suspense fallback={<div className="text-xs text-[#6E676A]">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}

'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, ShoppingBag, CheckCircle2 } from 'lucide-react';
import FormErrorBox from '@/components/ui/FormErrorBox';
import FieldError from '@/components/ui/FieldError';
import { focusAndScrollTo } from '@/lib/utils/scrollHelper';

function getSafeCallbackUrl(rawUrl: string | null): string {
  if (!rawUrl) return '/account';
  let decoded = rawUrl;
  try {
    decoded = decodeURIComponent(rawUrl);
  } catch {
    // ignore decoding error
  }
  if (
    !decoded.startsWith('/') ||
    decoded.startsWith('//') ||
    decoded.startsWith('/login') ||
    decoded.startsWith('/register')
  ) {
    return '/account';
  }
  return decoded;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = getSafeCallbackUrl(searchParams.get('callbackUrl'));
  const isSessionExpired = searchParams.get('session_expired') === 'true';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [error, setError] = useState('');
  const [errorLink, setErrorLink] = useState<{ href: string; label: string } | undefined>(undefined);
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const clearFieldError = (field: 'email' | 'password') => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    if (error) setError('');
    if (errorLink) setErrorLink(undefined);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setErrorLink(undefined);
    setFieldErrors({});

    // Client-side validation: check both fields
    const errors: typeof fieldErrors = {};
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }
    if (!password) {
      errors.password = 'Please enter your account password.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('Please provide your registered email and password.');
      const firstField = Object.keys(errors)[0];
      focusAndScrollTo(`login-input-${firstField}`);
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password, requiredRole: 'CUSTOMER' }),
      });

      const data = await res.json();

      if (!res.ok) {
        const serverErr = data.error || 'Authentication failed. Please check your credentials.';
        setError(serverErr);

        if (serverErr.toLowerCase().includes('not verified') || serverErr.toLowerCase().includes('verify')) {
          setErrorLink({
            href: `/account/verify-email?email=${encodeURIComponent(email.trim().toLowerCase())}&callbackUrl=${encodeURIComponent(callbackUrl)}`,
            label: 'Verify your email now',
          });
        } else if (serverErr.toLowerCase().includes('password') || serverErr.toLowerCase().includes('credential')) {
          setFieldErrors({ password: 'Password does not match our records.' });
          setErrorLink({
            href: '/forgot-password',
            label: 'Reset your password',
          });
          focusAndScrollTo('login-input-password');
        } else {
          focusAndScrollTo('login-error-box');
        }

        setIsLoading(false);
        return;
      }

      setSuccessMessage('Signed in successfully! Redirecting...');
      setTimeout(() => {
        window.location.href = callbackUrl;
      }, 500);
    } catch {
      setError("We couldn't sign you in. Please check your internet connection and try again, or call 8391097995 if it keeps happening.");
      focusAndScrollTo('login-error-box');
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
            Textiles &amp; Apparel
          </span>
        </Link>
        <h1 className="font-serif text-2xl text-[#1A1315] font-normal">Customer Sign In</h1>
        <p className="text-xs text-[#6E676A] mt-1.5">
          Access your personal account, saved items, and order preferences.
        </p>
      </div>

      {/* Session Expired Notice */}
      {isSessionExpired && !error && (
        <div className="mb-6 p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2.5 animate-fadeIn">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
          <span>Your previous session has expired. Please sign in to continue.</span>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label htmlFor="login-input-email" className="block text-xs font-medium uppercase tracking-wider text-[#1A1315] mb-1.5">
            Email Address <span className="text-[#6B0D2F]">*</span>
          </label>
          <div className="relative">
            <input
              id="login-input-email"
              type="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                clearFieldError('email');
              }}
              placeholder="name@example.com"
              aria-invalid={Boolean(fieldErrors.email)}
              className={`w-full bg-[#FAF7F2] rounded-xl px-3.5 py-2.5 pl-10 text-sm text-[#1A1315] placeholder-gray-400 focus:outline-none transition-all ${
                fieldErrors.email
                  ? 'border-2 border-red-500 focus:border-red-600 focus:ring-1 focus:ring-red-500'
                  : 'border border-[#D4AF37]/30 focus:border-[#6B0D2F] focus:ring-1 focus:ring-[#6B0D2F]'
              }`}
            />
            <Mail className={`w-4 h-4 absolute left-3.5 top-3 ${fieldErrors.email ? 'text-red-500' : 'text-gray-400'}`} />
          </div>
          <FieldError error={fieldErrors.email} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="login-input-password" className="block text-xs font-medium uppercase tracking-wider text-[#1A1315]">
              Password <span className="text-[#6B0D2F]">*</span>
            </label>
            <Link
              href="/forgot-password"
              className="text-[11px] text-[#6B0D2F] hover:underline transition-colors font-medium"
            >
              Forgot Password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="login-input-password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                clearFieldError('password');
              }}
              placeholder="••••••••"
              aria-invalid={Boolean(fieldErrors.password)}
              className={`w-full bg-[#FAF7F2] rounded-xl px-3.5 py-2.5 pl-10 pr-10 text-sm text-[#1A1315] placeholder-gray-400 focus:outline-none transition-all ${
                fieldErrors.password
                  ? 'border-2 border-red-500 focus:border-red-600 focus:ring-1 focus:ring-red-500'
                  : 'border border-[#D4AF37]/30 focus:border-[#6B0D2F] focus:ring-1 focus:ring-[#6B0D2F]'
              }`}
            />
            <Lock className={`w-4 h-4 absolute left-3.5 top-3 ${fieldErrors.password ? 'text-red-500' : 'text-gray-400'}`} />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <FieldError error={fieldErrors.password} />
        </div>

        {/* Prominent Action Error Box right above Submit Button */}
        {error && (
          <FormErrorBox
            id="login-error-box"
            error={error}
            actionLink={errorLink}
            className="mt-3"
          />
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 bg-[#6B0D2F] hover:bg-[#540924] text-white py-3.5 px-4 rounded-xl font-medium text-xs uppercase tracking-widest transition-all shadow-md hover:shadow-lg disabled:opacity-60 flex items-center justify-center gap-2 group cursor-pointer"
        >
          {isLoading ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Signing In to Account...</span>
            </>
          ) : (
            <>
              <span>Sign In to Account</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </>
          )}
        </button>

        <div className="text-center pt-1">
          <Link
            href="/account/recover"
            className="text-[11px] text-[#6E676A] hover:text-[#6B0D2F] transition-colors"
          >
            Can&apos;t remember your registered email?
          </Link>
        </div>
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
          href={callbackUrl !== '/account' ? `/register?callbackUrl=${encodeURIComponent(callbackUrl)}` : '/register'}
          className="inline-flex items-center justify-center w-full py-2.5 px-4 rounded-xl border border-[#D4AF37]/40 text-[#6B0D2F] hover:bg-[#FAF7F2] font-medium text-xs uppercase tracking-wider transition-colors"
        >
          Create New Customer Account
        </Link>
      </div>

      {/* Trust Badge & Links */}
      <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col items-center gap-2 text-[11px] text-[#6E676A]">
        <div className="flex items-center justify-center gap-4">
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
        <div className="pt-1">
          <Link
            href="/admin/login"
            className="text-[11px] text-[#8C8285] hover:text-[#6B0D2F] transition-colors"
          >
            Store Owner? Sign in here
          </Link>
        </div>
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

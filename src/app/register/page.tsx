'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, User, Phone, ArrowRight, ShieldCheck, ShoppingBag, CheckCircle2 } from 'lucide-react';
import { isValidIndianPhone, normalizeIndianPhone } from '@/lib/utils/phone';
import { validatePasswordStrength } from '@/lib/utils/validation';
import FormErrorBox from '@/components/ui/FormErrorBox';
import FieldError from '@/components/ui/FieldError';
import PasswordRequirementsLive from '@/components/ui/PasswordRequirementsLive';
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

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = getSafeCallbackUrl(searchParams.get('callbackUrl'));

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [error, setError] = useState('');
  const [errorLink, setErrorLink] = useState<{ href: string; label: string } | undefined>(undefined);
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const clearFieldError = (field: keyof typeof fieldErrors) => {
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

    // Client-side validation: check all fields simultaneously
    const errors: typeof fieldErrors = {};

    if (name.trim().length < 2) {
      errors.name = 'Please enter your full name (at least 2 characters).';
    }

    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    if (phone.trim() && !isValidIndianPhone(phone)) {
      errors.phone = 'Please enter a valid 10-digit Indian mobile number (e.g. 98765 43210).';
    }

    const strength = validatePasswordStrength(password);
    if (!strength.valid) {
      errors.password = strength.error || 'Password must be at least 8 characters and include a letter and a number.';
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match. Please verify and re-enter.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('Please resolve the highlighted field problems before completing registration.');
      const firstField = Object.keys(errors)[0];
      focusAndScrollTo(`register-input-${firstField}`);
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim() ? normalizeIndianPhone(phone) : undefined,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const serverErr = data.error || 'Failed to create your account. Please try again.';
        setError(serverErr);

        if (serverErr.toLowerCase().includes('already registered') || serverErr.toLowerCase().includes('email')) {
          setFieldErrors({ email: 'This email is already registered. Try signing in instead.' });
          setErrorLink({ href: `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`, label: 'Sign in to existing account' });
          focusAndScrollTo('register-input-email');
        } else if (serverErr.toLowerCase().includes('phone')) {
          setFieldErrors({ phone: serverErr });
          focusAndScrollTo('register-input-phone');
        } else if (serverErr.toLowerCase().includes('password')) {
          setFieldErrors({ password: serverErr });
          focusAndScrollTo('register-input-password');
        } else {
          focusAndScrollTo('register-error-box');
        }

        setIsLoading(false);
        return;
      }

      // Success
      setSuccessMessage('Account created successfully! Redirecting to email verification...');
      setTimeout(() => {
        window.location.href = `/account/verify-email?callbackUrl=${encodeURIComponent(callbackUrl)}`;
      }, 1000);
    } catch {
      setError("We couldn't save this. Please check your internet connection and try again, or call 8391097995 if it keeps happening.");
      focusAndScrollTo('register-error-box');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col justify-center items-center px-4 py-12 selection:bg-[#D4AF37]/30 selection:text-[#6B0D2F]">
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
          <h1 className="font-serif text-2xl text-[#1A1315] font-normal">Create Account</h1>
          <p className="text-xs text-[#6E676A] mt-1.5 leading-relaxed">
            Creating an account takes just 30 seconds. It lets you save favorites to your wishlist and view your order requests across all devices.
          </p>
        </div>

        {/* Success Notice if created */}
        {successMessage && (
          <div className="mb-6 p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2.5 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{successMessage}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label htmlFor="register-input-name" className="block text-xs font-medium uppercase tracking-wider text-[#1A1315] mb-1.5">
              Full Name <span className="text-[#6B0D2F]">*</span>
            </label>
            <div className="relative">
              <input
                id="register-input-name"
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  clearFieldError('name');
                }}
                placeholder="e.g. Priya Sharma"
                aria-invalid={Boolean(fieldErrors.name)}
                className={`w-full bg-[#FAF7F2] rounded-xl px-3.5 py-2.5 pl-10 text-sm text-[#1A1315] placeholder-gray-400 focus:outline-none transition-all ${
                  fieldErrors.name
                    ? 'border-2 border-red-500 focus:border-red-600 focus:ring-1 focus:ring-red-500'
                    : 'border border-[#D4AF37]/30 focus:border-[#6B0D2F] focus:ring-1 focus:ring-[#6B0D2F]'
                }`}
              />
              <User className={`w-4 h-4 absolute left-3.5 top-3 ${fieldErrors.name ? 'text-red-500' : 'text-gray-400'}`} />
            </div>
            <FieldError error={fieldErrors.name} />
            {!fieldErrors.name && <p className="text-[11px] text-[#6E676A] mt-1">Your first and last name</p>}
          </div>

          <div>
            <label htmlFor="register-input-email" className="block text-xs font-medium uppercase tracking-wider text-[#1A1315] mb-1.5">
              Email Address <span className="text-[#6B0D2F]">*</span>
            </label>
            <div className="relative">
              <input
                id="register-input-email"
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearFieldError('email');
                }}
                placeholder="priya@example.com"
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
            {!fieldErrors.email && <p className="text-[11px] text-[#6E676A] mt-1">We will send your order confirmations here</p>}
          </div>

          <div>
            <label htmlFor="register-input-phone" className="block text-xs font-medium uppercase tracking-wider text-[#1A1315] mb-1.5">
              Phone Number <span className="text-[10px] text-gray-400 normal-case">(Optional)</span>
            </label>
            <div className="relative">
              <input
                id="register-input-phone"
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  clearFieldError('phone');
                }}
                placeholder="e.g. 98765 43210"
                aria-invalid={Boolean(fieldErrors.phone)}
                className={`w-full bg-[#FAF7F2] rounded-xl px-3.5 py-2.5 pl-10 text-sm text-[#1A1315] placeholder-gray-400 focus:outline-none transition-all ${
                  fieldErrors.phone
                    ? 'border-2 border-red-500 focus:border-red-600 focus:ring-1 focus:ring-red-500'
                    : 'border border-[#D4AF37]/30 focus:border-[#6B0D2F] focus:ring-1 focus:ring-[#6B0D2F]'
                }`}
              />
              <Phone className={`w-4 h-4 absolute left-3.5 top-3 ${fieldErrors.phone ? 'text-red-500' : 'text-gray-400'}`} />
            </div>
            <FieldError error={fieldErrors.phone} />
            {!fieldErrors.phone && <p className="text-[11px] text-[#6E676A] mt-1">Used for WhatsApp order updates. No spam.</p>}
          </div>

          <div>
            <label htmlFor="register-input-password" className="block text-xs font-medium uppercase tracking-wider text-[#1A1315] mb-1.5">
              Password <span className="text-[#6B0D2F]">*</span>
            </label>
            <div className="relative">
              <input
                id="register-input-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearFieldError('password');
                }}
                placeholder="At least 8 characters (letters &amp; numbers)"
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
            {/* Live password requirements indicators */}
            <div className="mt-2">
              <PasswordRequirementsLive password={password} />
            </div>
          </div>

          <div>
            <label htmlFor="register-input-confirmPassword" className="block text-xs font-medium uppercase tracking-wider text-[#1A1315] mb-1.5">
              Confirm Password <span className="text-[#6B0D2F]">*</span>
            </label>
            <div className="relative">
              <input
                id="register-input-confirmPassword"
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  clearFieldError('confirmPassword');
                }}
                placeholder="Re-enter password"
                aria-invalid={Boolean(fieldErrors.confirmPassword)}
                className={`w-full bg-[#FAF7F2] rounded-xl px-3.5 py-2.5 pl-10 pr-10 text-sm text-[#1A1315] placeholder-gray-400 focus:outline-none transition-all ${
                  fieldErrors.confirmPassword
                    ? 'border-2 border-red-500 focus:border-red-600 focus:ring-1 focus:ring-red-500'
                    : 'border border-[#D4AF37]/30 focus:border-[#6B0D2F] focus:ring-1 focus:ring-[#6B0D2F]'
                }`}
              />
              <Lock className={`w-4 h-4 absolute left-3.5 top-3 ${fieldErrors.confirmPassword ? 'text-red-500' : 'text-gray-400'}`} />
            </div>
            <FieldError error={fieldErrors.confirmPassword} />
          </div>

          {/* Prominent Action Error Box right above Submit Button */}
          {error && (
            <FormErrorBox
              id="register-error-box"
              error={error}
              actionLink={errorLink}
              className="mt-3"
            />
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-3 bg-[#6B0D2F] hover:bg-[#540924] text-white py-3.5 px-4 rounded-xl font-medium text-xs uppercase tracking-widest transition-all shadow-md hover:shadow-lg disabled:opacity-60 flex items-center justify-center gap-2 group cursor-pointer"
          >
            {isLoading ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Creating Your Account...</span>
              </>
            ) : (
              <>
                <span>Complete Registration</span>
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
            Already Registered?
          </span>
        </div>

        {/* Sign In Callout */}
        <div className="text-center">
          <Link
            href={callbackUrl !== '/account' ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}` : '/login'}
            className="inline-flex items-center justify-center w-full py-2.5 px-4 rounded-xl border border-[#D4AF37]/40 text-[#6B0D2F] hover:bg-[#FAF7F2] font-medium text-xs uppercase tracking-wider transition-colors"
          >
            Sign In with Existing Account
          </Link>
        </div>

        {/* Trust Badge */}
        <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-center gap-4 text-[11px] text-[#6E676A]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Encrypted Registration</span>
          </div>
          <span className="text-gray-300">•</span>
          <Link href="/" className="hover:text-[#6B0D2F] flex items-center gap-1">
            <ShoppingBag className="w-3 h-3" />
            <span>Return to Store</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CustomerRegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center text-xs text-[#6E676A]">Loading...</div>}>
      <RegisterForm />
    </Suspense>
  );
}

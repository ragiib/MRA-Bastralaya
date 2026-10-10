'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import FormErrorBox from '@/components/ui/FormErrorBox';
import FieldError from '@/components/ui/FieldError';
import { focusAndScrollTo } from '@/lib/utils/scrollHelper';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/admin';
  const urlError = searchParams.get('error');

  // Step state: 'credentials' -> 'otp'
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');

  // Step 1: Credentials
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Step 2: 2FA OTP
  const [challengeToken, setChallengeToken] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [infoMessage, setInfoMessage] = useState('');

  // UI state
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
    otp?: string;
  }>({});
  const [error, setError] = useState(
    urlError === 'unauthorized'
      ? 'Access denied. You must be an authenticated Administrator to enter this area.'
      : ''
  );
  const [isLoading, setIsLoading] = useState(false);

  const otpInputRef = useRef<HTMLInputElement>(null);

  const clearFieldError = (field: keyof typeof fieldErrors) => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    if (error) setError('');
  };

  // Focus OTP input and start cooldown timer when entering OTP step
  useEffect(() => {
    if (step === 'otp') {
      otpInputRef.current?.focus();
    }
  }, [step]);

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Handle Step 1: Submit Credentials
  const handleCredentialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');
    setFieldErrors({});

    const errors: typeof fieldErrors = {};
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      errors.email = 'Please enter a valid administrator email address.';
    }
    if (!password) {
      errors.password = 'Please enter your administrator password.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('Please provide your admin email and password.');
      const firstField = Object.keys(errors)[0];
      focusAndScrollTo(`admin-input-${firstField}`);
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password, requiredRole: 'ADMIN' }),
      });

      const data = await res.json();

      if (!res.ok) {
        const serverErr = data.error || 'Authentication failed. Please verify administrator credentials.';
        setError(serverErr);
        if (serverErr.toLowerCase().includes('password') || serverErr.toLowerCase().includes('credential')) {
          setFieldErrors({ password: 'Administrator credentials do not match our records.' });
          focusAndScrollTo('admin-input-password');
        } else {
          focusAndScrollTo('admin-step1-error-box');
        }
        setIsLoading(false);
        return;
      }

      // Transition to Step 2 (OTP Verification)
      if (data.requires2FA && data.challengeToken) {
        setChallengeToken(data.challengeToken);
        setMaskedEmail(data.maskedEmail || email);
        setPassword(''); // Clear password from state for security
        setStep('otp');
        setResendCooldown(60); // 60-second initial cooldown
        setFieldErrors({});
        setIsLoading(false);
        return;
      }

      // If requires2FA was not returned, report an error rather than bypassing 2FA
      setError(data.error || 'Two-factor verification could not be initiated. Please try again.');
      focusAndScrollTo('admin-step1-error-box');
      setIsLoading(false);
    } catch {
      setError("We couldn't connect to the admin service. Please check your internet connection and try again.");
      focusAndScrollTo('admin-step1-error-box');
      setIsLoading(false);
    }
  };

  // Handle Step 2: Verify 6-digit OTP
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');
    setFieldErrors({});

    const cleanCode = otpCode.trim().replace(/\s+/g, '');
    if (cleanCode.length !== 6 || !/^\d{6}$/.test(cleanCode)) {
      const msg = cleanCode.length === 0
        ? 'Please enter the 6-digit verification code.'
        : `Please enter all 6 digits (${cleanCode.length} of 6 entered).`;
      setFieldErrors({ otp: msg });
      setError(msg);
      focusAndScrollTo('admin-otp-input');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeToken,
          code: cleanCode,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const serverErr = data.error || 'Incorrect verification code. Please try again.';
        setError(serverErr);
        setFieldErrors({ otp: 'Code is incorrect or expired. Please check your email or resend code.' });
        focusAndScrollTo('admin-otp-input');
        setIsLoading(false);
        return;
      }

      // OTP verified successfully -> Redirect to Admin Dashboard
      window.location.href = callbackUrl;
    } catch {
      setError('A network error occurred while verifying the code. Please try again.');
      focusAndScrollTo('admin-step2-error-box');
      setIsLoading(false);
    }
  };

  // Handle Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isResending) return;

    setError('');
    setInfoMessage('');
    setFieldErrors({});
    setIsResending(true);

    try {
      const res = await fetch('/api/auth/2fa/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeToken }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to resend code. Please try again.');
        if (data.retryAfter) {
          setResendCooldown(data.retryAfter);
        }
        focusAndScrollTo('admin-step2-error-box');
        setIsResending(false);
        return;
      }

      if (data.challengeToken) {
        setChallengeToken(data.challengeToken);
      }
      setInfoMessage('A new verification code has been sent to your email.');
      setResendCooldown(60);
      setOtpCode('');
      otpInputRef.current?.focus();
    } catch {
      setError('Network error while requesting a new code. Please try again.');
      focusAndScrollTo('admin-step2-error-box');
    } finally {
      setIsResending(false);
    }
  };

  // Switch back to Step 1 (change credentials)
  const handleBackToCredentials = () => {
    setStep('credentials');
    setOtpCode('');
    setChallengeToken('');
    setError('');
    setFieldErrors({});
    setInfoMessage('');
  };

  return (
    <div className="w-full max-w-md bg-[#1E181A] text-[#FAF7F2] rounded-2xl shadow-2xl border border-[#D4AF37]/30 p-8 sm:p-10 relative">
      {/* Decorative Gold Border Glow */}
      <div className="absolute -top-px left-8 right-8 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />

      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#2A1F23] border border-[#D4AF37]/40 text-[#D4AF37] mb-3 shadow-inner">
          {step === 'otp' ? <KeyRound className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
        </div>
        <h1 className="font-serif text-2xl tracking-widest text-[#FAF7F2] uppercase font-normal">
          MRA BASTRALAYA
        </h1>
        <div className="mt-1 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#D4AF37]">
            {step === 'otp' ? 'Two-Factor Verification' : 'Staff & Administration Portal'}
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          {step === 'otp'
            ? 'For added security, enter the one-time code sent to your registered email.'
            : 'Secure, server-restricted console for store administrators only.'}
        </p>
      </div>

      {infoMessage && (
        <div className="mb-6 p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-700 text-emerald-200 text-xs flex items-start gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{infoMessage}</span>
        </div>
      )}

      {/* STEP 1: Email + Password */}
      {step === 'credentials' && (
        <form onSubmit={handleCredentialSubmit} noValidate className="space-y-4">
          <div>
            <label htmlFor="admin-input-email" className="block text-xs font-medium uppercase tracking-wider text-gray-300 mb-1.5">
              Admin Email Address <span className="text-[#D4AF37]">*</span>
            </label>
            <div className="relative">
              <input
                id="admin-input-email"
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearFieldError('email');
                }}
                placeholder="admin@example.com"
                aria-invalid={Boolean(fieldErrors.email)}
                className={`w-full bg-[#140F11] rounded-xl px-3.5 py-2.5 pl-10 text-sm text-[#FAF7F2] placeholder-gray-500 focus:outline-none transition-all ${
                  fieldErrors.email
                    ? 'border-2 border-red-500 focus:border-red-500'
                    : 'border border-[#D4AF37]/30 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]'
                }`}
              />
              <Mail className={`w-4 h-4 absolute left-3.5 top-3 ${fieldErrors.email ? 'text-red-400' : 'text-gray-400'}`} />
            </div>
            <FieldError error={fieldErrors.email} />
          </div>

          <div>
            <label htmlFor="admin-input-password" className="block text-xs font-medium uppercase tracking-wider text-gray-300 mb-1.5">
              Administrator Password <span className="text-[#D4AF37]">*</span>
            </label>
            <div className="relative">
              <input
                id="admin-input-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearFieldError('password');
                }}
                placeholder="••••••••••••"
                aria-invalid={Boolean(fieldErrors.password)}
                className={`w-full bg-[#140F11] rounded-xl px-3.5 py-2.5 pl-10 pr-10 text-sm text-[#FAF7F2] placeholder-gray-500 focus:outline-none transition-all ${
                  fieldErrors.password
                    ? 'border-2 border-red-500 focus:border-red-500'
                    : 'border border-[#D4AF37]/30 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]'
                }`}
              />
              <Lock className={`w-4 h-4 absolute left-3.5 top-3 ${fieldErrors.password ? 'text-red-400' : 'text-gray-400'}`} />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-200 transition-colors cursor-pointer"
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
              id="admin-step1-error-box"
              error={error}
              variant="dark"
              className="mt-3"
            />
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-3 bg-[#D4AF37] hover:bg-[#B8952B] text-[#1A1315] py-3 px-4 rounded-xl font-semibold text-xs uppercase tracking-widest transition-all shadow-lg hover:shadow-xl disabled:opacity-60 flex items-center justify-center gap-2 group cursor-pointer"
          >
            {isLoading ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-[#1A1315]/30 border-t-[#1A1315] rounded-full animate-spin" />
                <span>Signing In With Credentials...</span>
              </>
            ) : (
              <>
                <span>Sign In With Credentials</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>
        </form>
      )}

      {/* STEP 2: 6-Digit Email OTP Verification */}
      {step === 'otp' && (
        <form onSubmit={handleOtpSubmit} noValidate className="space-y-5">
          <div className="text-center bg-[#140F11] p-3.5 rounded-xl border border-white/5">
            <p className="text-xs text-gray-300">
              Security code sent to:
            </p>
            <p className="text-sm font-semibold text-[#D4AF37] mt-0.5 tracking-wider font-mono">
              {maskedEmail}
            </p>
          </div>

          <div>
            <label htmlFor="admin-otp-input" className="block text-xs font-medium uppercase tracking-wider text-gray-300 mb-2 text-center">
              Enter 6-Digit Verification Code <span className="text-[#D4AF37]">*</span>
            </label>
            <div className="relative">
              <input
                id="admin-otp-input"
                ref={otpInputRef}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                required
                autoComplete="one-time-code"
                value={otpCode}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  if (val.length <= 6) setOtpCode(val);
                  clearFieldError('otp');
                }}
                placeholder="000000"
                aria-invalid={Boolean(fieldErrors.otp)}
                className={`w-full bg-[#140F11] rounded-xl py-3.5 px-4 text-center text-2xl font-mono tracking-[0.4em] text-[#FAF7F2] placeholder-gray-600 focus:outline-none transition-all font-bold ${
                  fieldErrors.otp
                    ? 'border-2 border-red-500 focus:border-red-500'
                    : 'border-2 border-[#D4AF37]/50 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30'
                }`}
              />
            </div>
            <FieldError error={fieldErrors.otp} className="justify-center" />
            {!fieldErrors.otp && (
              <p className="text-[11px] text-gray-400 text-center mt-2">
                Code is valid for 5 minutes.
              </p>
            )}
          </div>

          {/* Prominent Action Error Box right above Submit Button */}
          {error && (
            <FormErrorBox
              id="admin-step2-error-box"
              error={error}
              variant="dark"
              className="mt-3"
            />
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#D4AF37] hover:bg-[#B8952B] text-[#1A1315] py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2 group cursor-pointer"
          >
            {isLoading ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-[#1A1315]/30 border-t-[#1A1315] rounded-full animate-spin" />
                <span>Verifying Code &amp; Entering Admin...</span>
              </>
            ) : (
              <>
                <span>Verify Code &amp; Enter Admin</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>

          {/* Resend & Back Actions */}
          <div className="pt-2 flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resendCooldown > 0 || isResending}
              className="inline-flex items-center gap-1.5 text-xs text-[#D4AF37] hover:text-[#B8952B] disabled:text-gray-500 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
              <span>
                {resendCooldown > 0
                  ? `Resend code in ${resendCooldown}s`
                  : isResending
                  ? 'Sending new code...'
                  : 'Resend verification code'}
              </span>
            </button>

            <button
              type="button"
              onClick={handleBackToCredentials}
              className="text-xs text-gray-400 hover:text-gray-200 transition-colors cursor-pointer inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Sign in with different credentials</span>
            </button>
          </div>
        </form>
      )}

      {/* Security Notice Note */}
      <div className="mt-8 pt-6 border-t border-white/10 text-center space-y-2 text-[11px] text-gray-400">
        <p className="leading-relaxed">
          Public registration is disabled. Admin accounts are provisioned solely through secure server-side management.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2 text-xs">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[#D4AF37] hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Public Storefront</span>
          </Link>
          <span className="text-white/20">•</span>
          <Link
            href="/login"
            className="text-gray-400 hover:text-gray-200 transition-colors"
          >
            Customer? Sign in here
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

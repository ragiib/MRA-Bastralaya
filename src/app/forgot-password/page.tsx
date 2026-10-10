'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, KeyRound, CheckCircle2, RotateCcw } from 'lucide-react';
import FormErrorBox from '@/components/ui/FormErrorBox';
import FieldError from '@/components/ui/FieldError';
import PasswordRequirementsLive from '@/components/ui/PasswordRequirementsLive';
import { validatePasswordStrength } from '@/lib/utils/validation';
import { focusAndScrollTo } from '@/lib/utils/scrollHelper';

export default function ForgotPasswordPage() {
  const router = useRouter();

  // Step 1: Request Code | Step 2: Enter Code & New Password | Step 3: Success
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    code?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});
  const [error, setError] = useState('');
  const [successNotice, setSuccessNotice] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Resend countdown
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

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

  // Step 1: Submit Email to send 6-digit OTP code
  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      setFieldErrors({ email: 'Please enter a valid registered email address.' });
      setError('Please provide a valid email address to receive your reset code.');
      focusAndScrollTo('forgot-input-email');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to send reset code. Please try again.');
        focusAndScrollTo('forgot-error-box');
        setIsLoading(false);
        return;
      }

      setSuccessNotice(data.message || 'If an account exists, a 6-digit reset code has been sent.');
      setStep(2);
      setCountdown(60);
      setFieldErrors({});
    } catch {
      setError("We couldn't dispatch the code. Please check your internet connection and try again, or call 8391097995 if it keeps happening.");
      focusAndScrollTo('forgot-error-box');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Resend Code
  const handleResendCode = async () => {
    if (countdown > 0 || isLoading) return;
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessNotice('A new 6-digit verification code has been dispatched to your email.');
        setCountdown(60);
      } else {
        setError(data.error || 'Failed to resend reset code.');
        focusAndScrollTo('forgot-step2-error-box');
      }
    } catch {
      setError("Network error resending code. Please check your connection or call 8391097995.");
      focusAndScrollTo('forgot-step2-error-box');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Submit Code and New Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    const errors: typeof fieldErrors = {};

    if (code.trim().length !== 6) {
      errors.code = 'Please enter the 6-digit code sent to your email.';
    }

    const strength = validatePasswordStrength(newPassword);
    if (!strength.valid) {
      errors.newPassword = strength.error || 'Password must be at least 8 characters and include a letter and a number.';
    }

    if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match. Please verify and re-enter.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('Please resolve the highlighted field issues before saving your new password.');
      const firstField = Object.keys(errors)[0];
      focusAndScrollTo(`forgot-input-${firstField}`);
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          code: code.trim(),
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const serverErr = data.error || 'Failed to update password. Please check your verification code.';
        setError(serverErr);
        if (serverErr.toLowerCase().includes('code') || serverErr.toLowerCase().includes('otp') || serverErr.toLowerCase().includes('expired')) {
          setFieldErrors({ code: serverErr });
          focusAndScrollTo('forgot-input-code');
        } else {
          focusAndScrollTo('forgot-step2-error-box');
        }
        setIsLoading(false);
        return;
      }

      setStep(3);
      // Auto-redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch {
      setError("We couldn't save this. Please check your internet connection and try again, or call 8391097995 if it keeps happening.");
      focusAndScrollTo('forgot-step2-error-box');
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

          {step === 1 && (
            <>
              <h1 className="font-serif text-2xl text-[#1A1315] font-normal">Forgot Password</h1>
              <p className="text-xs text-[#6E676A] mt-1.5 leading-relaxed">
                Enter your registered email address and we will send you a 6-digit code to reset your password.
              </p>
            </>
          )}

          {step === 2 && (
            <>
              <h1 className="font-serif text-2xl text-[#1A1315] font-normal">Set New Password</h1>
              <p className="text-xs text-[#6E676A] mt-1.5 leading-relaxed">
                Enter the 6-digit code sent to <strong className="text-[#1A1315]">{email}</strong> and choose your new password.
              </p>
            </>
          )}

          {step === 3 && (
            <>
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 border border-emerald-200">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h1 className="font-serif text-2xl text-[#1A1315] font-normal">Password Reset Complete</h1>
              <p className="text-xs text-[#6E676A] mt-1.5 leading-relaxed">
                Your password has been securely updated. Redirecting you to sign in...
              </p>
            </>
          )}
        </div>

        {/* Success Notice */}
        {successNotice && step === 2 && !error && (
          <div className="mb-6 p-3.5 rounded-xl bg-amber-50/80 border border-[#D4AF37]/40 text-[#6B0D2F] text-xs flex items-center gap-2.5 animate-fadeIn">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] shrink-0" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* STEP 1: Enter Email Form */}
        {step === 1 && (
          <form onSubmit={handleRequestCode} noValidate className="space-y-4">
            <div>
              <label htmlFor="forgot-input-email" className="block text-xs font-medium uppercase tracking-wider text-[#1A1315] mb-1.5">
                Registered Email Address <span className="text-[#6B0D2F]">*</span>
              </label>
              <div className="relative">
                <input
                  id="forgot-input-email"
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
                  autoFocus
                />
                <Mail className={`w-4 h-4 absolute left-3.5 top-3 ${fieldErrors.email ? 'text-red-500' : 'text-gray-400'}`} />
              </div>
              <FieldError error={fieldErrors.email} />
            </div>

            {/* Prominent Action Error Box right above Submit Button */}
            {error && (
              <FormErrorBox
                id="forgot-error-box"
                error={error}
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
                  <span>Sending Reset Code...</span>
                </>
              ) : (
                <>
                  <span>Send Reset Code</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: Enter OTP & New Password */}
        {step === 2 && (
          <form onSubmit={handleResetPassword} noValidate className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="forgot-input-code" className="block text-xs font-medium uppercase tracking-wider text-[#1A1315]">
                  6-Digit Verification Code <span className="text-[#6B0D2F]">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={countdown > 0 || isLoading}
                  className="text-[11px] text-[#6B0D2F] hover:underline disabled:text-gray-400 flex items-center gap-1 cursor-pointer font-medium"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{countdown > 0 ? `Resend code in ${countdown}s` : 'Resend Code'}</span>
                </button>
              </div>
              <div className="relative">
                <input
                  id="forgot-input-code"
                  type="text"
                  required
                  maxLength={6}
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.replace(/\D/g, ''));
                    clearFieldError('code');
                  }}
                  placeholder="123456"
                  aria-invalid={Boolean(fieldErrors.code)}
                  className={`w-full bg-[#FAF7F2] rounded-xl px-3.5 py-2.5 text-center text-lg font-mono tracking-[0.3em] font-bold text-[#1A1315] placeholder-gray-300 focus:outline-none transition-all ${
                    fieldErrors.code
                      ? 'border-2 border-red-500 focus:border-red-600 focus:ring-1 focus:ring-red-500'
                      : 'border border-[#D4AF37]/40 focus:border-[#6B0D2F] focus:ring-1 focus:ring-[#6B0D2F]'
                  }`}
                  autoFocus
                />
              </div>
              <FieldError error={fieldErrors.code} />
              {!fieldErrors.code && (
                <p className="text-[10px] text-gray-500 mt-1 text-center">
                  Valid for 15 minutes. Check spam/junk if not received.
                </p>
              )}
            </div>

            <div>
              <label htmlFor="forgot-input-newPassword" className="block text-xs font-medium uppercase tracking-wider text-[#1A1315] mb-1.5">
                New Password <span className="text-[#6B0D2F]">*</span>
              </label>
              <div className="relative">
                <input
                  id="forgot-input-newPassword"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    clearFieldError('newPassword');
                  }}
                  placeholder="At least 8 characters (letters &amp; numbers)"
                  aria-invalid={Boolean(fieldErrors.newPassword)}
                  className={`w-full bg-[#FAF7F2] rounded-xl px-3.5 py-2.5 pl-10 pr-10 text-sm text-[#1A1315] placeholder-gray-400 focus:outline-none transition-all ${
                    fieldErrors.newPassword
                      ? 'border-2 border-red-500 focus:border-red-600 focus:ring-1 focus:ring-red-500'
                      : 'border border-[#D4AF37]/30 focus:border-[#6B0D2F] focus:ring-1 focus:ring-[#6B0D2F]'
                  }`}
                />
                <Lock className={`w-4 h-4 absolute left-3.5 top-3 ${fieldErrors.newPassword ? 'text-red-500' : 'text-gray-400'}`} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <FieldError error={fieldErrors.newPassword} />
              {/* Live password requirements indicators */}
              <div className="mt-2">
                <PasswordRequirementsLive password={newPassword} />
              </div>
            </div>

            <div>
              <label htmlFor="forgot-input-confirmPassword" className="block text-xs font-medium uppercase tracking-wider text-[#1A1315] mb-1.5">
                Confirm New Password <span className="text-[#6B0D2F]">*</span>
              </label>
              <div className="relative">
                <input
                  id="forgot-input-confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    clearFieldError('confirmPassword');
                  }}
                  placeholder="Re-enter new password"
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
                id="forgot-step2-error-box"
                error={error}
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
                  <span>Saving New Password...</span>
                </>
              ) : (
                <>
                  <span>Save New Password</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setError('');
                  setFieldErrors({});
                }}
                className="text-xs text-[#6E676A] hover:text-[#6B0D2F] underline cursor-pointer"
              >
                ← Use a different email address
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Success Actions */}
        {step === 3 && (
          <div className="text-center space-y-4 pt-2">
            <Link
              href="/login"
              className="inline-flex items-center justify-center w-full py-3.5 px-4 bg-[#6B0D2F] hover:bg-[#540924] text-white rounded-xl text-xs uppercase tracking-widest font-semibold transition-all shadow-md"
            >
              Sign In to Your Account
            </Link>
          </div>
        )}

        {/* Account Recovery Link & Back to Sign In */}
        {step !== 3 && (
          <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col items-center gap-3 text-xs text-[#6E676A]">
            <Link
              href="/account/recover"
              className="text-[#6B0D2F] hover:underline font-medium"
            >
              Can&apos;t remember your registered email?
            </Link>

            <div className="flex items-center justify-center gap-4 text-[11px]">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Encrypted Recovery</span>
              </div>
              <span className="text-gray-300">•</span>
              <Link href="/login" className="hover:text-[#6B0D2F] flex items-center gap-1">
                <KeyRound className="w-3 h-3" />
                <span>Return to Sign In</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, CheckCircle2, ArrowRight, RotateCcw, ShieldCheck, ShoppingBag } from 'lucide-react';
import { useShop } from '@/context/ShopContext';

function getSafeReturnUrl(rawUrl: string | null): string {
  if (!rawUrl) return '/';
  let decoded = rawUrl;
  try {
    decoded = decodeURIComponent(rawUrl);
  } catch {
    // ignore decoding error
  }

  // Repeatedly unwrap if verify-email was nested in query parameter
  while (decoded.includes('/account/verify-email')) {
    const match = decoded.match(/callbackUrl=([^&]+)/);
    if (match) {
      try {
        decoded = decodeURIComponent(match[1]);
      } catch {
        decoded = '/';
        break;
      }
    } else {
      decoded = '/';
      break;
    }
  }

  // Prevent external open redirects and self-redirect loops
  if (
    !decoded.startsWith('/') ||
    decoded.startsWith('//') ||
    decoded.startsWith('/login') ||
    decoded.startsWith('/register') ||
    decoded.startsWith('/forgot-password') ||
    decoded.startsWith('/account/verify-email') ||
    decoded.startsWith('/account/recover')
  ) {
    return '/';
  }

  return decoded;
}

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const safeTargetUrl = getSafeReturnUrl(searchParams.get('callbackUrl'));
  const isFreshRegistration = searchParams.get('registered') === 'true';

  const { user, refreshUser, isAuthenticated } = useShop();

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [infoNotice, setInfoNotice] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingInitialOtp, setIsSendingInitialOtp] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const autoSendAttempted = useRef(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // If already verified, show immediate success
  useEffect(() => {
    if (user?.emailVerified) {
      setSuccess(true);
    }
  }, [user]);

  // Automatically dispatch a fresh OTP on page load for existing unverified accounts
  useEffect(() => {
    let isMounted = true;

    async function checkAndAutoSend() {
      if (autoSendAttempted.current) return;

      // Determine target user either from context or directly from /api/auth/me
      let currentUser = user;
      if (!currentUser) {
        try {
          const res = await fetch(`/api/auth/me?t=${Date.now()}`, { cache: 'no-store' });
          if (res.ok) {
            const data = await res.json();
            currentUser = data.user || null;
          }
        } catch {
          // ignore
        }
      }

      if (!isMounted) return;

      if (!currentUser) {
        // Fallback: check ?email= query param if present
        const emailParam = searchParams.get('email');
        if (emailParam && !autoSendAttempted.current && !isFreshRegistration) {
          autoSendAttempted.current = true;
          setIsSendingInitialOtp(true);
          try {
            const res = await fetch('/api/auth/verify-email/resend', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: emailParam }),
            });
            const data = await res.json();
            if (!isMounted) return;
            if (data.alreadyVerified) {
              setSuccess(true);
            } else if (data.success) {
              setInfoNotice('A fresh verification code has been dispatched to your email.');
              setCountdown(60);
            } else {
              setError(data.error || 'Failed to dispatch verification code.');
            }
          } catch {
            if (isMounted) {
              setError('Failed to contact verification service. Please tap Resend.');
            }
          } finally {
            if (isMounted) setIsSendingInitialOtp(false);
          }
        }
        return;
      }

      if (currentUser.emailVerified) {
        setSuccess(true);
        return;
      }

      if (isFreshRegistration) {
        // Brand-new registration: initial code was already dispatched by registration API
        setInfoNotice('A verification code has been dispatched to your email.');
        return;
      }

      // Existing unverified account: auto-dispatch fresh OTP on first load
      if (!autoSendAttempted.current) {
        autoSendAttempted.current = true;
        setIsSendingInitialOtp(true);
        try {
          const res = await fetch('/api/auth/verify-email/resend', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: currentUser.email }),
          });
          const data = await res.json();
          if (!isMounted) return;
          if (data.alreadyVerified) {
            setSuccess(true);
          } else if (data.success) {
            setInfoNotice('A fresh verification code has been dispatched to your email.');
            setCountdown(60);
          } else {
            setError(data.error || 'Failed to dispatch verification code.');
          }
        } catch {
          if (isMounted) {
            setError('Failed to contact verification service. Please tap Resend.');
          }
        } finally {
          if (isMounted) setIsSendingInitialOtp(false);
        }
      }
    }

    checkAndAutoSend();

    return () => {
      isMounted = false;
    };
  }, [user, isFreshRegistration, searchParams]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (code.trim().length !== 6) {
      setError('Please enter the 6-digit code sent to your email.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim(), email: user?.email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to verify email code.');
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      await refreshUser();

      setTimeout(() => {
        window.location.href = safeTargetUrl;
      }, 2000);
    } catch {
      setError('Network error during verification. Please try again.');
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || isLoading || isSendingInitialOtp) return;
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/verify-email/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user?.email }),
      });

      const data = await res.json();
      if (res.ok) {
        setInfoNotice('A fresh verification code has been dispatched to your email.');
        setCountdown(60);
      } else {
        setError(data.error || 'Failed to resend verification code.');
      }
    } catch {
      setError('Failed to contact verification service.');
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

          {!success ? (
            <>
              <div className="w-12 h-12 bg-[#FAF7F2] text-[#6B0D2F] rounded-full flex items-center justify-center mx-auto mb-3 border border-[#D4AF37]/40">
                <Mail className="w-6 h-6 text-[#6B0D2F]" />
              </div>
              <h1 className="font-serif text-2xl text-[#1A1315] font-normal">Verify Your Email</h1>
              <p className="text-xs text-[#6E676A] mt-1.5 leading-relaxed">
                Please enter the 6-digit confirmation code sent to{' '}
                <strong className="text-[#1A1315]">{user?.email || 'your email'}</strong> to enable WhatsApp ordering.
              </p>
            </>
          ) : (
            <>
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 border border-emerald-200">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h1 className="font-serif text-2xl text-[#1A1315] font-normal">Email Verified Successfully!</h1>
              <p className="text-xs text-[#6E676A] mt-1.5 leading-relaxed">
                Thank you! Your email has been confirmed. Proceed to complete your order or continue shopping.
              </p>
            </>
          )}
        </div>

        {/* Error Notice */}
        {error && (
          <div className="mb-6 p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5 animate-fadeIn">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Initial Sending Notice */}
        {isSendingInitialOtp && (
          <div className="mb-6 p-3.5 rounded-lg bg-amber-50/80 border border-[#D4AF37]/40 text-[#6B0D2F] text-xs flex items-center gap-2.5 animate-fadeIn">
            <span className="w-3.5 h-3.5 border-2 border-[#6B0D2F]/30 border-t-[#6B0D2F] rounded-full animate-spin shrink-0" />
            <span>Sending a fresh verification code to your email...</span>
          </div>
        )}

        {/* Info Notice */}
        {infoNotice && !error && !isSendingInitialOtp && (
          <div className="mb-6 p-3.5 rounded-lg bg-amber-50/80 border border-[#D4AF37]/40 text-[#6B0D2F] text-xs flex items-center gap-2.5 animate-fadeIn">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] shrink-0" />
            <span>{infoNotice}</span>
          </div>
        )}

        {!success ? (
          <form onSubmit={handleVerify} className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium uppercase tracking-wider text-[#1A1315]">
                  6-Digit Verification Code
                </label>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={countdown > 0 || isLoading || isSendingInitialOtp}
                  className="text-[11px] text-[#6B0D2F] hover:underline disabled:text-gray-400 flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}</span>
                </button>
              </div>

              <div className="relative">
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full bg-[#FAF7F2] border border-[#D4AF37]/40 rounded-xl px-3.5 py-3 text-center text-xl font-mono tracking-[0.3em] font-bold text-[#1A1315] placeholder-gray-300 focus:outline-none focus:border-[#6B0D2F] focus:ring-1 focus:ring-[#6B0D2F] transition-all"
                  autoFocus
                />
              </div>
              <p className="text-[10px] text-gray-500 mt-1.5 text-center">
                Check your inbox and spam/junk folder. Codes are valid for 24 hours.
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading || code.length !== 6}
              className="w-full mt-2 bg-[#6B0D2F] hover:bg-[#540924] text-white py-3 px-4 rounded-xl font-medium text-xs uppercase tracking-widest transition-all shadow-md hover:shadow-lg disabled:opacity-60 flex items-center justify-center gap-2 group cursor-pointer"
            >
              {isLoading ? (
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Verify Email Address</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="pt-2 text-center space-y-2.5">
            <button
              type="button"
              id="continue-after-verify-btn"
              onClick={() => {
                window.location.href = safeTargetUrl;
              }}
              className="inline-flex items-center justify-center w-full py-3 px-4 bg-[#6B0D2F] hover:bg-[#540924] text-white rounded-xl text-xs uppercase tracking-widest font-semibold transition-all shadow-md cursor-pointer"
            >
              {safeTargetUrl === '/cart'
                ? 'Continue to Cart & Ordering'
                : safeTargetUrl.startsWith('/account/complete-profile')
                ? 'Complete Delivery Address'
                : safeTargetUrl === '/account'
                ? 'Continue to Your Account'
                : 'Continue to Shopping'}
            </button>
            {safeTargetUrl !== '/' && (
              <button
                type="button"
                id="continue-to-shopping-btn"
                onClick={() => {
                  window.location.href = '/';
                }}
                className="inline-flex items-center justify-center w-full py-2 px-3 text-xs text-[#6B0D2F] hover:text-[#540924] hover:underline cursor-pointer transition-colors"
              >
                Continue to Shopping
              </button>
            )}
          </div>
        )}

        {/* Footer info */}
        <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between text-[11px] text-[#6E676A]">
          <Link href="/" className="hover:text-[#6B0D2F] flex items-center gap-1">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Store Home</span>
          </Link>
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Encrypted Verification</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center text-xs text-[#6E676A]">Loading...</div>}>
      <VerifyEmailForm />
    </Suspense>
  );
}

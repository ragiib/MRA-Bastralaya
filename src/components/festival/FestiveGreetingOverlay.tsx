'use client';

import React, { useState, useEffect, useRef, useId } from 'react';
import Link from 'next/link';
import { Noto_Serif_Bengali, Noto_Serif_Devanagari } from 'next/font/google';
import { FESTIVAL_CONFIG, isFestivalActive, getOfferHeadline, getOfferSubline } from '@/config/festival';
import { AlponaMotif, DiyaLamp, ConchShell, MarigoldPetal } from './FestiveIcons';
import { X, ArrowRight } from 'lucide-react';

// Google Fonts loaded specifically with needed subsets and display swap
const notoSerifBengali = Noto_Serif_Bengali({
  subsets: ['bengali'],
  weight: ['600', '700'],
  display: 'swap',
  fallback: ['serif'],
});

const notoSerifDevanagari = Noto_Serif_Devanagari({
  subsets: ['devanagari'],
  weight: ['600', '700'],
  display: 'swap',
  fallback: ['serif'],
});

interface PetalSpec {
  id: number;
  startX: number;
  duration: number;
  delay: number;
  scale: number;
}

export default function FestiveGreetingOverlay() {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [petals, setPetals] = useState<PetalSpec[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const previousFocusRef = useRef<HTMLElement | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const primaryCtaRef = useRef<HTMLAnchorElement>(null);
  const skipBtnRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  // Check 24-hour display rule and client environment
  useEffect(() => {
    if (!isFestivalActive()) return;

    // Strict rule: Homepage only ('/')
    if (window.location.pathname !== '/') return;

    try {
      const lastSeen = localStorage.getItem('mra_festive_greeting_seen');
      if (lastSeen) {
        const lastSeenTime = parseInt(lastSeen, 10);
        // Only show once per 24 hours
        if (!isNaN(lastSeenTime) && Date.now() - lastSeenTime < 24 * 60 * 60 * 1000) {
          return;
        }
      }
    } catch {
      // Storage access may be blocked; proceed safely
    }

    // Save previous focus before opening
    previousFocusRef.current = document.activeElement as HTMLElement | null;

    // Check motion preference and device constraints
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setReducedMotion(prefersReducedMotion);

    const nav = navigator as unknown as { connection?: { saveData?: boolean }; hardwareConcurrency?: number };
    const isSaveData = nav.connection?.saveData === true;
    const isLowPower = typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency <= 4;
    const shouldDisableParticles = prefersReducedMotion || isSaveData || isLowPower;

    // Generate lightweight CSS particles if device allows
    if (!shouldDisableParticles) {
      const isMobile = window.innerWidth < 640;
      const count = isMobile ? 12 : 24;
      const generatedPetals: PetalSpec[] = Array.from({ length: count }, (_, i) => ({
        id: i,
        startX: Math.floor(Math.random() * 94) + 3,
        duration: 4.5 + Math.random() * 3,
        delay: Math.random() * 2,
        scale: 0.6 + Math.random() * 0.5,
      }));
      setPetals(generatedPetals);
    }

    // Open overlay cleanly
    setIsVisible(true);

    // Lock body scroll while modal is active without layout shift
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Auto-dismiss sequence after ~6 seconds (full sequence finishes around 3.5s)
    const autoDismissTimer = setTimeout(() => {
      dismissOverlay();
    }, 6000);

    return () => {
      clearTimeout(autoDismissTimer);
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Listen for tab visibility changes to pause animations
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPaused(document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Listen for Escape key
  useEffect(() => {
    if (!isVisible) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        dismissOverlay();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible]);

  // Focus the primary CTA on mount for accessibility
  useEffect(() => {
    if (isVisible) {
      if (primaryCtaRef.current) {
        primaryCtaRef.current.focus();
      } else if (skipBtnRef.current) {
        skipBtnRef.current.focus();
      }
    }
  }, [isVisible]);

  const dismissOverlay = () => {
    if (isClosing) return;
    setIsClosing(true);

    try {
      localStorage.setItem('mra_festive_greeting_seen', String(Date.now()));
    } catch {
      // Storage access may be blocked
    }

    // Restore scroll lock immediately
    document.body.style.overflow = '';

    // Smooth exit transition
    setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
      // Restore focus to previously active element
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        previousFocusRef.current.focus();
      }
    }, 350);
  };

  if (!isVisible) return null;

  const offerHeadline = getOfferHeadline();
  const offerSubline = getOfferSubline();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-label="Mahalaya and Durga Puja Festive Greeting"
      className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 transition-opacity duration-350 ${
        isClosing ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        backgroundColor: 'rgba(26, 19, 21, 0.88)',
        backdropFilter: 'blur(6px)',
      }}
      onClick={(e) => {
        // Dismiss if clicking backdrop outside the dialog box
        if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
          dismissOverlay();
        }
      }}
    >
      {/* Falling Marigold Petals Particle Layer (Pure CSS Transforms) */}
      {petals.length > 0 && !isPaused && !reducedMotion && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          {petals.map((p) => (
            <div
              key={p.id}
              className="absolute text-[#E06D10] will-change-transform"
              style={{
                left: `${p.startX}%`,
                top: '-30px',
                animation: `petalFall ${p.duration}s linear ${p.delay}s infinite`,
                transform: `scale(${p.scale})`,
              }}
            >
              <MarigoldPetal className="w-4 h-4 sm:w-5 sm:h-5 drop-shadow-xs" />
            </div>
          ))}
        </div>
      )}

      {/* Main Festive Greeting Card: Designed to fit comfortably without scrolling on 320px screens */}
      <div
        ref={dialogRef}
        className="relative w-full max-w-lg max-h-[94vh] bg-[#500A23] text-[#FAF7F2] rounded-2xl sm:rounded-3xl border-2 border-[#D4AF37] shadow-2xl p-4 sm:p-7 text-center overflow-y-auto sm:overflow-hidden animate-festiveCardEnter"
        style={{
          boxShadow: '0 25px 60px -15px rgba(107, 13, 47, 0.5), 0 0 35px rgba(212, 175, 55, 0.25)',
        }}
      >
        {/* Soft Diya Glow Backdrop in Center */}
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 sm:w-80 h-64 sm:h-80 rounded-full pointer-events-none ${
            reducedMotion ? 'opacity-70' : 'animate-diyaPulse'
          }`}
          style={{
            background: 'radial-gradient(circle, rgba(212, 175, 55, 0.22) 0%, rgba(224, 109, 16, 0.08) 50%, transparent 75%)',
          }}
          aria-hidden="true"
        />

        {/* Top Header Utilities: Conch Motif & Always Visible Skip Button (>= 44px tall) from the first frame */}
        <div className="flex items-center justify-between mb-2.5 sm:mb-4 relative z-10">
          <div className="flex items-center">
            <ConchShell className="w-5 h-5 sm:w-6 sm:h-6 text-[#D4AF37]" />
          </div>

          <button
            ref={skipBtnRef}
            type="button"
            onClick={dismissOverlay}
            className="min-h-[44px] min-w-[44px] px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-[#FAF7F2] text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 border border-[#D4AF37]/40 cursor-pointer"
            aria-label="Skip festival greeting"
          >
            <span>Skip</span>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Alpona Mandala Line Drawing Animation (SVG stroke-dashoffset) */}
        <div className="flex justify-center mb-2.5 sm:mb-3.5 relative z-10" aria-hidden="true">
          <AlponaMotif
            className="w-14 h-14 sm:w-18 sm:h-18 text-[#D4AF37]"
            style={{
              strokeDasharray: 300,
              strokeDashoffset: reducedMotion ? 0 : undefined,
              animation: reducedMotion ? 'none' : 'alponaDraw 1.6s ease-out forwards',
            }}
          />
        </div>

        {/* Stacked Multilingual Greetings Block:
            Sequence: Bengali first, then Hindi, then English.
            All three stay visible together at sequence end with distinct visual sizes. */}
        <div className="relative z-10 space-y-1 sm:space-y-1.5 mb-3 sm:mb-4">
          {/* Bengali Greeting (Primary Hero Greeting) */}
          <h2
            id={titleId}
            lang="bn"
            className={`${notoSerifBengali.className} text-xl sm:text-2xl md:text-3xl text-[#F3E5AB] font-bold tracking-wide leading-tight transition-all ${
              reducedMotion ? '' : 'animate-seqBengali'
            }`}
            style={{
              textShadow: '0 2px 10px rgba(212, 175, 55, 0.35)',
            }}
          >
            {FESTIVAL_CONFIG.greetingBengali}
          </h2>

          {/* Hindi Greeting (Secondary Greeting) */}
          <p
            lang="hi"
            className={`${notoSerifDevanagari.className} text-sm sm:text-base md:text-lg text-[#FDE68A] font-semibold tracking-wide leading-tight ${
              reducedMotion ? '' : 'animate-seqHindi'
            }`}
          >
            {FESTIVAL_CONFIG.greetingHindi}
          </p>

          {/* English Greeting (Tertiary Greeting) */}
          <p
            lang="en"
            className={`font-serif text-xs sm:text-sm text-[#FAF7F2]/90 italic font-medium tracking-wide leading-snug ${
              reducedMotion ? '' : 'animate-seqEnglish'
            }`}
          >
            {FESTIVAL_CONFIG.greetingEnglish}
          </p>
        </div>

        {/* Traditional Diya Accent */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 my-2 sm:my-3 relative z-10" aria-hidden="true">
          <div className="h-px w-8 sm:w-12 bg-gradient-to-r from-transparent to-[#D4AF37]" />
          <DiyaLamp className="w-5 h-5 sm:w-6 sm:h-6" />
          <div className="h-px w-8 sm:w-12 bg-gradient-to-l from-transparent to-[#D4AF37]" />
        </div>

        {/* Offer Headline & Subline: Rendered only if valid, strictly guarding against placeholders */}
        {(offerHeadline || offerSubline) && (
          <div
            className={`relative z-10 space-y-0.5 sm:space-y-1 mb-4 sm:mb-6 px-2 ${
              reducedMotion ? '' : 'animate-seqOffer'
            }`}
          >
            {offerHeadline && (
              <p className="text-xs sm:text-sm uppercase tracking-wider font-bold text-[#FBBF24]">
                {offerHeadline}
              </p>
            )}
            {offerSubline && (
              <p className="text-[11px] sm:text-xs text-[#FAF7F2]/80 font-normal">
                {offerSubline}
              </p>
            )}
          </div>
        )}

        {/* Primary CTA and Secondary Dismiss Button */}
        <div
          className={`relative z-10 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 ${
            reducedMotion ? '' : 'animate-seqCta'
          }`}
        >
          <Link
            ref={primaryCtaRef}
            href={FESTIVAL_CONFIG.ctaHref}
            onClick={dismissOverlay}
            className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 sm:py-3 rounded-full bg-[#D4AF37] hover:bg-[#E5C158] active:scale-95 text-[#500A23] font-serif text-xs sm:text-sm font-bold uppercase tracking-wider shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer group"
          >
            <span>{FESTIVAL_CONFIG.ctaLabel}</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>

          <button
            type="button"
            onClick={dismissOverlay}
            className="min-h-[44px] px-4 py-2 text-xs text-[#FAF7F2]/75 hover:text-[#FAF7F2] transition-colors cursor-pointer"
          >
            Continue to Store
          </button>
        </div>
      </div>

      {/* Scoped CSS Keyframes & Sequencing */}
      <style jsx>{`
        @keyframes alponaDraw {
          from {
            stroke-dashoffset: 300;
            opacity: 0.3;
          }
          to {
            stroke-dashoffset: 0;
            opacity: 1;
          }
        }
        @keyframes petalFall {
          0% {
            transform: translateY(-20px) rotate(0deg);
            opacity: 0;
          }
          15% {
            opacity: 0.9;
          }
          85% {
            opacity: 0.9;
          }
          100% {
            transform: translateY(105vh) rotate(360deg);
            opacity: 0;
          }
        }
        @keyframes diyaPulse {
          0%, 100% {
            transform: translate(-50%, -50%) scale(0.96);
            opacity: 0.7;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.08);
            opacity: 0.95;
          }
        }
        @keyframes festiveCardEnter {
          from {
            opacity: 0;
            transform: scale(0.96) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes sequenceFadeUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-festiveCardEnter {
          animation: festiveCardEnter 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-diyaPulse {
          animation: diyaPulse 3s ease-in-out infinite;
        }
        .animate-seqBengali {
          opacity: 0;
          animation: sequenceFadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.6s forwards;
        }
        .animate-seqHindi {
          opacity: 0;
          animation: sequenceFadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 1.3s forwards;
        }
        .animate-seqEnglish {
          opacity: 0;
          animation: sequenceFadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 2.0s forwards;
        }
        .animate-seqOffer {
          opacity: 0;
          animation: sequenceFadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) 2.7s forwards;
        }
        .animate-seqCta {
          opacity: 0;
          animation: sequenceFadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) 3.1s forwards;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-festiveCardEnter,
          .animate-diyaPulse,
          .animate-seqBengali,
          .animate-seqHindi,
          .animate-seqEnglish,
          .animate-seqOffer,
          .animate-seqCta {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>
    </div>
  );
}

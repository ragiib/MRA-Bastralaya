'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FESTIVAL_CONFIG, isFestivalActive, getOfferHeadline } from '@/config/festival';
import { DiyaLamp } from './FestiveIcons';
import { X } from 'lucide-react';

interface GreetingItem {
  text: string;
  lang: string;
}

const GREETINGS: GreetingItem[] = [
  { text: FESTIVAL_CONFIG.greetingBengali, lang: 'bn' },
  { text: FESTIVAL_CONFIG.greetingHindi, lang: 'hi' },
  { text: FESTIVAL_CONFIG.greetingEnglish, lang: 'en' },
];

export default function FestiveTopStrip() {
  const [isActive, setIsActive] = useState(false);
  const [isDismissed, setIsDismissed] = useState(true); // Default true to prevent SSR hydration flash
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fadeState, setFadeState] = useState<'in' | 'out'>('in');

  useEffect(() => {
    if (!isFestivalActive()) {
      setIsActive(false);
      return;
    }

    // Check if dismissed for today (within 24 hours)
    try {
      const dismissedUntil = localStorage.getItem('mra_festive_strip_dismissed_until');
      if (dismissedUntil) {
        const untilTime = parseInt(dismissedUntil, 10);
        if (!isNaN(untilTime) && Date.now() < untilTime) {
          setIsDismissed(true);
          return;
        }
      }
    } catch {
      // Storage access may be blocked
    }

    setIsDismissed(false);
    setIsActive(true);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Gentle language rotation every 3.5 seconds
    const interval = setInterval(() => {
      if (document.hidden) return; // Pause when tab is not visible

      if (prefersReducedMotion) {
        setCurrentIndex((prev) => (prev + 1) % GREETINGS.length);
      } else {
        setFadeState('out');
        setTimeout(() => {
          setCurrentIndex((prev) => (prev + 1) % GREETINGS.length);
          setFadeState('in');
        }, 250);
      }
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      localStorage.setItem(
        'mra_festive_strip_dismissed_until',
        String(Date.now() + 24 * 60 * 60 * 1000)
      );
    } catch {
      // Storage access may be blocked
    }
  };

  if (!isActive || isDismissed) {
    return null;
  }

  const currentGreeting = GREETINGS[currentIndex];
  const offerHeadline = getOfferHeadline();

  return (
    <div
      role="region"
      aria-label="Festive announcement"
      className="bg-gradient-to-r from-[#500A23] via-[#6B0D2F] to-[#500A23] text-white border-b border-[#D4AF37]/40 text-[11px] sm:text-xs py-1 px-2 sm:px-4 select-none relative z-40"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-1.5 sm:gap-3 min-w-0">
        {/* Left/Center Content: Slim single-row layout protecting mobile header geometry */}
        <div className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2.5 min-w-0 text-center py-0.5">
          {/* Traditional Diya Accent */}
          <DiyaLamp className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#D4AF37] shrink-0" />

          {/* Rotating Multilingual Greeting */}
          <span
            lang={currentGreeting.lang}
            className={`font-serif font-bold text-[#F3E5AB] tracking-wide truncate max-w-[140px] xs:max-w-[200px] sm:max-w-none transition-all duration-250 ${
              fadeState === 'in' ? 'opacity-100 transform-none' : 'opacity-0 -translate-y-1'
            }`}
          >
            {currentGreeting.text}
          </span>

          {offerHeadline && (
            <>
              <span className="text-[#D4AF37]/60 hidden xs:inline shrink-0">&bull;</span>
              {/* Offer Headline rendered once with no subline */}
              <span className="font-semibold text-white tracking-wider truncate max-w-[160px] sm:max-w-none">
                {offerHeadline}
              </span>
            </>
          )}

          {/* Call to Action Link */}
          <Link
            href={FESTIVAL_CONFIG.ctaHref}
            className="underline underline-offset-2 decoration-[#D4AF37] hover:text-[#F3E5AB] font-semibold transition-colors shrink-0 whitespace-nowrap ml-1"
          >
            Shop &rarr;
          </Link>
        </div>

        {/* Small Close Button hiding strip for 24 hours */}
        <button
          type="button"
          onClick={handleDismiss}
          className="min-h-[28px] min-w-[28px] p-1 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors shrink-0 flex items-center justify-center cursor-pointer active:scale-95"
          aria-label="Dismiss festive announcement for today"
          title="Dismiss for today"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

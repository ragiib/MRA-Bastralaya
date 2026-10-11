'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Noto_Serif_Bengali, Noto_Serif_Devanagari } from 'next/font/google';
import { FESTIVAL_CONFIG, isFestivalActive, getOfferHeadline, getOfferSubline } from '@/config/festival';
import { AlponaMotif, MarigoldFlower, AlponaBorder } from './FestiveIcons';
import Container from '../ui/Container';
import { ArrowRight } from 'lucide-react';

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

export default function FestiveHomepageBanner() {
  // Initialize with SSR value to avoid initial opacity 0 or client pop-in
  const [active, setActive] = useState<boolean>(() => isFestivalActive());

  useEffect(() => {
    setActive(isFestivalActive());
  }, []);

  if (!active) {
    return null;
  }

  const offerHeadline = getOfferHeadline();
  const offerSubline = getOfferSubline();

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#42081C] via-[#5A0C26] to-[#42081C] text-[#FAF7F2] border-b-2 border-[#D4AF37]/50 py-3.5 sm:py-5 shadow-md">
      {/* Background Alpona Watermark Motifs */}
      <div className="absolute -left-12 -bottom-12 opacity-15 pointer-events-none" aria-hidden="true">
        <AlponaMotif className="w-40 h-40 text-[#D4AF37]" />
      </div>
      <div className="absolute -right-12 -top-12 opacity-15 pointer-events-none" aria-hidden="true">
        <AlponaMotif className="w-40 h-40 text-[#D4AF37]" />
      </div>

      {/* Floating Marigold SVGs (Gentle CSS Floating Motion) */}
      <div
        className="absolute top-2.5 left-4 sm:left-10 opacity-80 pointer-events-none animate-festiveFloatSlow hidden xs:block"
        aria-hidden="true"
      >
        <MarigoldFlower className="w-5 h-5 sm:w-6 sm:h-6 drop-shadow-md" />
      </div>
      <div
        className="absolute bottom-2.5 right-4 sm:right-10 opacity-80 pointer-events-none animate-festiveFloatDelayed hidden xs:block"
        aria-hidden="true"
      >
        <MarigoldFlower className="w-5 h-5 sm:w-6 sm:h-6 drop-shadow-md" />
      </div>

      <Container className="relative z-10 text-center">
        {/* Compact Stacked Multilingual Greetings: Bengali, Hindi, English */}
        <div className="space-y-0.5 sm:space-y-1 mb-2">
          {/* Bengali Greeting */}
          <h2
            lang="bn"
            className={`${notoSerifBengali.className} text-lg sm:text-2xl font-bold text-[#FDF8EE] tracking-wide leading-tight`}
            style={{ textShadow: '0 2px 10px rgba(212, 175, 55, 0.3)' }}
          >
            {FESTIVAL_CONFIG.greetingBengali}
          </h2>

          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-0.5">
            {/* Hindi Greeting */}
            <span
              lang="hi"
              className={`${notoSerifDevanagari.className} text-xs sm:text-sm font-semibold text-[#FDE68A] tracking-wide`}
            >
              {FESTIVAL_CONFIG.greetingHindi}
            </span>
            <span className="hidden sm:inline text-[#D4AF37]/50 text-xs">&bull;</span>
            {/* English Greeting */}
            <span
              lang="en"
              className="font-serif text-[11px] sm:text-xs text-[#FAF7F2]/90 italic font-medium tracking-wide"
            >
              {FESTIVAL_CONFIG.greetingEnglish}
            </span>
          </div>
        </div>

        {/* Traditional Alpona Line Divider */}
        <div className="max-w-xs mx-auto mb-2 opacity-60" aria-hidden="true">
          <AlponaBorder className="w-full h-2.5" />
        </div>

        {/* Campaign Offer Headline & Subline */}
        {(offerHeadline || offerSubline) && (
          <div className="space-y-0.5 mb-3 max-w-xl mx-auto px-2">
            {offerHeadline && (
              <div className="inline-block px-3 py-0.5 rounded-md bg-black/35 border border-[#D4AF37]/50">
                <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#FBBF24]">
                  {offerHeadline}
                </p>
              </div>
            )}
            {offerSubline && (
              <p className="text-[11px] sm:text-xs text-[#FAF7F2]/85">
                {offerSubline}
              </p>
            )}
          </div>
        )}

        {/* Department Quick-Links: Sarees, Ladies Suits, Bed Sheets */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
          {/* Primary CTA (Sarees) with gold light-sweep */}
          <Link
            href="/sarees"
            className="relative overflow-hidden min-h-[38px] px-4.5 py-1.5 sm:py-2 rounded-full bg-[#D4AF37] hover:bg-[#E5C158] text-[#500A23] font-serif text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer group"
          >
            {/* Shimmer Light Sweep Effect */}
            <span
              className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 animate-lightSweep pointer-events-none"
              aria-hidden="true"
            />
            <span className="relative z-10">Sarees</span>
            <ArrowRight className="w-3.5 h-3.5 relative z-10 transition-transform group-hover:translate-x-1" />
          </Link>

          {/* Secondary CTA (Ladies Suits) */}
          <Link
            href="/ladies-suits"
            className="min-h-[38px] px-4 py-1.5 sm:py-2 rounded-full bg-white/10 hover:bg-white/20 text-[#FAF7F2] border border-[#D4AF37]/50 font-serif text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
          >
            <span>Ladies Suits</span>
          </Link>

          {/* Tertiary CTA (Bed Sheets) */}
          <Link
            href="/bed-sheets"
            className="min-h-[38px] px-4 py-1.5 sm:py-2 rounded-full bg-white/10 hover:bg-white/20 text-[#FAF7F2] border border-[#D4AF37]/50 font-serif text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
          >
            <span>Bed Sheets</span>
          </Link>
        </div>
      </Container>

      {/* Scoped Shimmer and Floating Keyframes */}
      <style jsx>{`
        @keyframes lightSweep {
          0% {
            transform: translateX(-150%) skewX(-20deg);
          }
          35%, 100% {
            transform: translateX(250%) skewX(-20deg);
          }
        }
        @keyframes festiveFloatSlow {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-5px) rotate(4deg);
          }
        }
        @keyframes festiveFloatDelayed {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(4px) rotate(-4deg);
          }
        }
        .animate-lightSweep {
          animation: lightSweep 4s ease-in-out infinite;
        }
        .animate-festiveFloatSlow {
          animation: festiveFloatSlow 6s ease-in-out infinite;
        }
        .animate-festiveFloatDelayed {
          animation: festiveFloatDelayed 5.5s ease-in-out 1.5s infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-lightSweep,
          .animate-festiveFloatSlow,
          .animate-festiveFloatDelayed {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
}

/**
 * Central Festive Launch Configuration - Mahalaya & Durga Puja
 * 
 * Controls all festive visual layers across MRA Bastralaya:
 * - Opening multilingual greeting overlay on homepage
 * - Slim festive top strip with rotating greetings above header
 * - Homepage festive banner and Puja Special showcase
 * - "Puja Sale" badges on products with active discounts
 * 
 * To disable everything instantly:
 * - Set enabled: false below, OR
 * - Set NEXT_PUBLIC_FESTIVE_ENABLED=false in environment variables (Vercel / .env.local).
 * 
 * IMPORTANT: startDate and endDate are used ONLY internally for automated campaign activation.
 * End dates and countdowns are NEVER exposed to customers in the UI.
 */

export interface FestivalConfig {
  enabled: boolean;
  festivalName: string;
  greetingBengali: string;
  greetingHindi: string;
  greetingEnglish: string;
  offerHeadline: string;
  offerSubline: string;
  ctaLabel: string;
  ctaHref: string;
  startDate: string;
  endDate: string;
}

export const FESTIVAL_CONFIG: FestivalConfig = {
  // Master toggle: set to false to immediately deactivate all festive UI
  enabled: true,

  festivalName: 'Mahalaya & Durga Puja',
  greetingBengali: 'শুভ মহালয়া ও শারদীয়ার শুভেচ্ছা',
  greetingHindi: 'शुभ महालया और दुर्गा पूजा की हार्दिक शुभकामनाएँ',
  greetingEnglish: 'Shubho Mahalaya and Happy Durga Puja',

  // Real campaign offer copy (Nearly 40% OFF on selected products)
  offerHeadline: 'Puja Sale: Nearly 40% OFF',
  offerSubline: 'On Sarees, Ladies Suits and Bed Sheets',

  ctaLabel: 'Explore Puja Collection',
  ctaHref: '/sarees',

  // Festive window with IST offset (+05:30) used internally only
  startDate: '2026-10-01T00:00:00+05:30',
  endDate: '2026-10-26T23:59:59+05:30',
};

/**
 * Validates festive copy strings to prevent rendering placeholders or developer notes to customers.
 * Returns false if text is missing, empty, or contains known placeholder patterns.
 */
export function isValidFestiveText(text: string | null | undefined): boolean {
  if (!text) return false;
  const trimmed = text.trim();
  if (trimmed.length === 0) return false;
  const upper = trimmed.toUpperCase();
  if (
    upper.includes('SET OFFER') ||
    upper.includes('PLACEHOLDER') ||
    upper.includes('TODO') ||
    upper.includes('INSERT ') ||
    upper.includes('TBD')
  ) {
    return false;
  }
  return true;
}

/**
 * Returns validated offer headline or null if invalid or placeholder.
 */
export function getOfferHeadline(): string | null {
  return isValidFestiveText(FESTIVAL_CONFIG.offerHeadline)
    ? FESTIVAL_CONFIG.offerHeadline.trim()
    : null;
}

/**
 * Returns validated offer subline or null if invalid or placeholder.
 */
export function getOfferSubline(): string | null {
  return isValidFestiveText(FESTIVAL_CONFIG.offerSubline)
    ? FESTIVAL_CONFIG.offerSubline.trim()
    : null;
}

/**
 * Checks whether the festive campaign is currently active.
 * Returns false if:
 * 1. Environment variable NEXT_PUBLIC_FESTIVE_ENABLED is set to 'false'
 * 2. FESTIVAL_CONFIG.enabled is false
 * 3. The current time is before startDate or after endDate
 */
export function isFestivalActive(): boolean {
  if (process.env.NEXT_PUBLIC_FESTIVE_ENABLED === 'false') {
    return false;
  }

  if (!FESTIVAL_CONFIG.enabled) {
    return false;
  }

  const now = Date.now();
  const start = new Date(FESTIVAL_CONFIG.startDate).getTime();
  const end = new Date(FESTIVAL_CONFIG.endDate).getTime();

  if (isNaN(start) || isNaN(end)) {
    return false;
  }

  return now >= start && now <= end;
}

/**
 * Clears festive local storage keys once the festival has expired or disabled.
 */
export function cleanupFestiveStorage(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('mra_festive_greeting_seen');
    localStorage.removeItem('mra_festive_strip_dismissed_until');
  } catch {
    // Ignore storage errors in restricted iframe/private mode
  }
}

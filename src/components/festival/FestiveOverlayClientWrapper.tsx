'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Next.js dynamic import with ssr: false inside a client component
// Guarantees zero blocking of initial server render or first paint
const FestiveGreetingOverlay = dynamic(
  () => import('./FestiveGreetingOverlay'),
  { ssr: false }
);

export default function FestiveOverlayClientWrapper() {
  return <FestiveGreetingOverlay />;
}

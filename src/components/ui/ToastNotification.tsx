'use client';

import React from 'react';
import { useShop } from '@/context/ShopContext';
import { CheckCircle2 } from 'lucide-react';

export default function ToastNotification() {
  const { toastMessage } = useShop();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce">
      <div className="flex items-center gap-3 bg-[#1A1315] text-white px-5 py-3.5 rounded-xl shadow-2xl border border-[#D4AF37]/40">
        <CheckCircle2 className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
        <span className="text-xs sm:text-sm font-medium tracking-wide">{toastMessage}</span>
      </div>
    </div>
  );
}

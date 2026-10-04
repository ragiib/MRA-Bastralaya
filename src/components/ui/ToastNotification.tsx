'use client';

import React from 'react';
import { useShop } from '@/context/ShopContext';
import { CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ToastNotification() {
  const { toastMessage } = useShop();

  return (
    <AnimatePresence>
      {toastMessage && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 15, scale: 0.95 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-6 right-6 z-50 pointer-events-none"
        >
          <div className="flex items-center gap-3 bg-[#1A1315] text-white px-5 py-3.5 rounded-xl shadow-2xl border border-[#D4AF37]/40 pointer-events-auto">
            <CheckCircle2 className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
            <span className="text-xs sm:text-sm font-medium tracking-wide">{toastMessage}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

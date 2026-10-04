'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronDown,
  ChevronRight,
  Heart,
  ShoppingBag,
  User,
  Layers,
  Phone,
  Mail,
  Store,
  ExternalLink,
} from 'lucide-react';
import { SAREE_CATEGORIES } from '@/data/sareesData';
import { LADIES_SUIT_CATEGORIES } from '@/data/ladiesSuitsData';
import { BED_SHEET_CATEGORIES } from '@/data/bedSheetsData';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistCount: number;
  cartCount?: number;
  isAuthenticated?: boolean;
}

export default function MobileNav({
  isOpen,
  onClose,
  wishlistCount,
  cartCount = 0,
  isAuthenticated = false,
}: MobileNavProps) {
  const [openDept, setOpenDept] = useState<'sarees' | 'suits' | 'bedsheets' | null>('sarees');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!mounted) return null;

  const toggleDept = (dept: 'sarees' | 'suits' | 'bedsheets') => {
    setOpenDept((prev) => (prev === dept ? null : dept));
  };

  const navContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] overflow-hidden lg:hidden">
          {/* Backdrop with Smooth Fade */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed inset-0 bg-black/65 backdrop-blur-xs z-10"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer Panel Container with Smooth Slide-In / Slide-Out */}
          <div className="fixed inset-y-0 left-0 max-w-full flex z-20 pointer-events-none">
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="w-[85vw] max-w-xs sm:max-w-sm h-full h-[100dvh] bg-[#FAF7F2] shadow-2xl flex flex-col justify-between overflow-hidden pointer-events-auto"
            >
              {/* Drawer Header */}
              <div className="p-4 sm:p-5 bg-[#6B0D2F] text-white flex items-center justify-between border-b border-[#D4AF37]/30 shrink-0">
                <Link href="/" onClick={onClose} className="flex flex-col">
                  <span className="font-serif text-base tracking-[0.2em] font-bold text-[#D4AF37] uppercase">
                    MRA BASTRALAYA
                  </span>
                  <span className="text-[8px] text-white/80 uppercase tracking-[0.25em] font-medium mt-0.5">
                    Textiles &amp; Apparel
                  </span>
                </Link>
                <motion.button
                  whileTap={{ scale: 0.88 }}
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto divide-y divide-[#D4AF37]/15">
                {/* Section 1: Departments & Categories */}
                <div className="py-3">
                  <div className="px-4 pb-2 text-[10px] font-bold uppercase tracking-widest text-[#6E676A] flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Departments &amp; Categories</span>
                  </div>

                  {/* Sarees Accordion */}
                  <div className="border-b border-[#D4AF37]/10">
                    <button
                      type="button"
                      onClick={() => toggleDept('sarees')}
                      className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-[#1A1315] hover:bg-[#6B0D2F]/5 transition-colors text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span>🥻 Sarees</span>
                        <span className="text-[9px] px-2 py-0.5 bg-[#D4AF37]/20 text-[#6B0D2F] rounded-full font-bold">
                          14 Categories
                        </span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                          openDept === 'sarees' ? 'rotate-180 text-[#6B0D2F]' : ''
                        }`}
                      />
                    </button>

                    <AnimatePresence initial={false}>
                      {openDept === 'sarees' && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.22, ease: 'easeInOut' }}
                          className="overflow-hidden bg-white/60 py-1.5 pl-6 pr-4 space-y-1 text-xs"
                        >
                          <Link
                            href="/sarees"
                            onClick={onClose}
                            className="block py-1.5 text-xs font-bold text-[#6B0D2F] hover:underline"
                          >
                            All Sarees (View Complete Collection)
                          </Link>
                          {SAREE_CATEGORIES.map((cat, idx) => (
                            <Link
                              key={cat.id}
                              href={`/sarees/${cat.slug}`}
                              onClick={onClose}
                              className="flex items-center justify-between py-1.5 text-xs text-gray-700 hover:text-[#6B0D2F] transition-colors"
                            >
                              <span className="truncate pr-2">
                                <span className="text-[10px] font-mono text-gray-400 mr-2">
                                  {idx < 9 ? `0${idx + 1}` : idx + 1}
                                </span>
                                {cat.name}
                              </span>
                              <ChevronRight className="w-3 h-3 text-gray-300 shrink-0" />
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Ladies Suits Accordion */}
                  <div className="border-b border-[#D4AF37]/10">
                    <button
                      type="button"
                      onClick={() => toggleDept('suits')}
                      className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-[#1A1315] hover:bg-[#6B0D2F]/5 transition-colors text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span>👗 Ladies Suits &amp; Sets</span>
                        <span className="text-[9px] px-2 py-0.5 bg-[#D4AF37]/20 text-[#6B0D2F] rounded-full font-bold">
                          3 Categories
                        </span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                          openDept === 'suits' ? 'rotate-180 text-[#6B0D2F]' : ''
                        }`}
                      />
                    </button>

                    <AnimatePresence initial={false}>
                      {openDept === 'suits' && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.22, ease: 'easeInOut' }}
                          className="overflow-hidden bg-white/60 py-1.5 pl-6 pr-4 space-y-1 text-xs"
                        >
                          <Link
                            href="/ladies-suits"
                            onClick={onClose}
                            className="block py-1.5 text-xs font-bold text-[#6B0D2F] hover:underline"
                          >
                            All Ladies Suits (View All)
                          </Link>
                          {LADIES_SUIT_CATEGORIES.map((cat, idx) => (
                            <Link
                              key={cat.id}
                              href={`/ladies-suits/${cat.slug}`}
                              onClick={onClose}
                              className="flex items-center justify-between py-1.5 text-xs text-gray-700 hover:text-[#6B0D2F] transition-colors"
                            >
                              <span className="truncate pr-2">
                                <span className="text-[10px] font-mono text-gray-400 mr-2">0{idx + 1}</span>
                                {cat.name}
                              </span>
                              <ChevronRight className="w-3 h-3 text-gray-300 shrink-0" />
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Bed Sheets Accordion */}
                  <div>
                    <button
                      type="button"
                      onClick={() => toggleDept('bedsheets')}
                      className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-[#1A1315] hover:bg-[#6B0D2F]/5 transition-colors text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span>🛏️ Pure Cotton Bed Sheets</span>
                        <span className="text-[9px] px-2 py-0.5 bg-[#D4AF37]/20 text-[#6B0D2F] rounded-full font-bold">
                          Phulkari Work
                        </span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                          openDept === 'bedsheets' ? 'rotate-180 text-[#6B0D2F]' : ''
                        }`}
                      />
                    </button>

                    <AnimatePresence initial={false}>
                      {openDept === 'bedsheets' && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.22, ease: 'easeInOut' }}
                          className="overflow-hidden bg-white/60 py-1.5 pl-6 pr-4 space-y-1 text-xs"
                        >
                          <Link
                            href="/bed-sheets"
                            onClick={onClose}
                            className="block py-1.5 text-xs font-bold text-[#6B0D2F] hover:underline"
                          >
                            All Bed Sheets (View All)
                          </Link>
                          {BED_SHEET_CATEGORIES.map((cat, idx) => (
                            <Link
                              key={cat.id}
                              href={`/bed-sheets/${cat.slug}`}
                              onClick={onClose}
                              className="flex items-center justify-between py-1.5 text-xs text-gray-700 hover:text-[#6B0D2F] transition-colors"
                            >
                              <span className="truncate pr-2">
                                <span className="text-[10px] font-mono text-gray-400 mr-2">0{idx + 1}</span>
                                {cat.name}
                              </span>
                              <ChevronRight className="w-3 h-3 text-gray-300 shrink-0" />
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Section 2: Shopping Bag & Wishlist */}
                <div className="py-3">
                  <div className="px-4 pb-2 text-[10px] font-bold uppercase tracking-widest text-[#6E676A] flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>My Shopping &amp; Bag</span>
                  </div>
                  <div className="space-y-0.5">
                    <Link
                      href="/cart"
                      onClick={onClose}
                      className="flex items-center justify-between px-4 py-2.5 text-xs font-medium text-[#1A1315] hover:bg-[#6B0D2F]/5 hover:text-[#6B0D2F] transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <ShoppingBag className="w-4 h-4 text-[#6B0D2F]" />
                        <div>
                          <span className="text-xs font-semibold block">Shopping Bag</span>
                          <span className="text-[10px] text-gray-500">Review items &amp; order via WhatsApp</span>
                        </div>
                      </div>
                      {cartCount > 0 ? (
                        <span className="text-[11px] px-2 py-0.5 bg-[#D4AF37] text-[#1A1315] rounded-full font-bold">
                          {cartCount} {cartCount === 1 ? 'item' : 'items'}
                        </span>
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      )}
                    </Link>

                    <Link
                      href="/wishlist"
                      onClick={onClose}
                      className="flex items-center justify-between px-4 py-2.5 text-xs font-medium text-[#1A1315] hover:bg-[#6B0D2F]/5 hover:text-[#6B0D2F] transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Heart className="w-4 h-4 text-[#6B0D2F]" />
                        <div>
                          <span className="text-xs font-semibold block">Saved Wishlist</span>
                          <span className="text-[10px] text-gray-500">Items saved for later</span>
                        </div>
                      </div>
                      {wishlistCount > 0 ? (
                        <span className="text-[11px] px-2 py-0.5 bg-[#6B0D2F] text-white rounded-full font-bold">
                          {wishlistCount}
                        </span>
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      )}
                    </Link>
                  </div>
                </div>

                {/* Section 3: My Account / Login */}
                <div className="py-3">
                  <div className="px-4 pb-2 text-[10px] font-bold uppercase tracking-widest text-[#6E676A] flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Account &amp; Orders</span>
                  </div>
                  <div className="space-y-0.5">
                    <Link
                      href={isAuthenticated ? '/account' : '/login'}
                      onClick={onClose}
                      className="flex items-center justify-between px-4 py-2.5 text-xs font-medium text-[#1A1315] hover:bg-[#6B0D2F]/5 hover:text-[#6B0D2F] transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <User className="w-4 h-4 text-[#6B0D2F]" />
                        <div>
                          <span className="text-xs font-semibold block">
                            {isAuthenticated ? 'My Account & Order History' : 'Sign In / Register'}
                          </span>
                          <span className="text-[10px] text-gray-500">
                            {isAuthenticated
                              ? 'Manage delivery address and order requests'
                              : 'Save wishlist and speed up checkout'}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </Link>
                  </div>
                </div>

                {/* Section 4: Support & Customer Care (Real Contact Info) */}
                <div className="p-4 bg-white/70">
                  <div className="p-3.5 rounded-xl bg-[#6B0D2F]/10 border border-[#D4AF37]/40 space-y-2.5">
                    <div className="flex items-center gap-2 text-[#6B0D2F]">
                      <Phone className="w-4 h-4 text-[#D4AF37]" />
                      <span className="text-xs font-bold uppercase tracking-wider">
                        Customer Care &amp; Support
                      </span>
                    </div>
                    <p className="text-[11px] text-[#6E676A] leading-relaxed">
                      Have questions about products, orders, or website issues? Contact our store team directly:
                    </p>
                    <div className="space-y-1.5 pt-1 text-xs">
                      <a
                        href="tel:8391097995"
                        className="flex items-center gap-2 p-2 rounded-lg bg-white border border-[#D4AF37]/30 text-[#1A1315] hover:text-[#6B0D2F] font-semibold transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5 text-[#6B0D2F] shrink-0" />
                        <span>Call / WhatsApp: 8391097995</span>
                      </a>
                      <a
                        href="mailto:mrabastrlaya@gmail.com"
                        className="flex items-center gap-2 p-2 rounded-lg bg-white border border-[#D4AF37]/30 text-[#1A1315] hover:text-[#6B0D2F] font-semibold transition-colors"
                      >
                        <Mail className="w-3.5 h-3.5 text-[#6B0D2F] shrink-0" />
                        <span className="truncate">Email: mrabastrlaya@gmail.com</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Drawer Footer: Admin Link */}
              <div className="p-3 bg-white border-t border-[#D4AF37]/20 shrink-0">
                <Link
                  href="/admin/login"
                  onClick={onClose}
                  className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs text-gray-500 hover:text-[#6B0D2F] hover:bg-gray-50 transition-colors"
                >
                  <Store className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Store Owner Portal</span>
                  <ExternalLink className="w-3 h-3 text-gray-400" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(navContent, document.body);
}

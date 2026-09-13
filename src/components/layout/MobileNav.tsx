'use client';

import React from 'react';
import Link from 'next/link';
import {
  X,
  ChevronRight,
  Heart,
  ShoppingBag,
  User,
  Sparkles,
  Info,
  Layers,
  Store,
  ExternalLink,
} from 'lucide-react';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistCount: number;
  cartCount?: number;
}

export default function MobileNav({
  isOpen,
  onClose,
  wishlistCount,
  cartCount = 0,
}: MobileNavProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden lg:hidden animate-fadeIn">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/65 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 left-0 max-w-full flex">
        <div className="w-screen max-w-xs bg-[#FAF7F2] shadow-2xl flex flex-col justify-between overflow-y-auto">
          {/* Drawer Header */}
          <div className="p-5 bg-[#6B0D2F] text-white flex items-center justify-between border-b border-[#D4AF37]/30">
            <Link href="/" onClick={onClose} className="flex flex-col">
              <span className="font-serif text-base tracking-[0.2em] font-bold text-[#D4AF37] uppercase">
                MRA BASTRALAYA
              </span>
              <span className="text-[8px] text-white/80 uppercase tracking-[0.25em] font-medium mt-0.5">
                Heritage Textiles &amp; Apparel
              </span>
            </Link>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#D4AF37]/15">
            {/* Section 1: Department Collections */}
            <div className="py-4">
              <div className="px-5 pb-2 text-[10px] font-bold uppercase tracking-widest text-[#6E676A] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Shop By Department</span>
              </div>
              <div className="space-y-0.5">
                <Link
                  href="/sarees"
                  onClick={onClose}
                  className="flex items-center justify-between px-5 py-2.5 text-xs font-medium text-[#1A1315] hover:bg-[#6B0D2F]/5 hover:text-[#6B0D2F] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">Sarees</span>
                    <span className="text-[9px] px-2 py-0.5 bg-[#D4AF37]/20 text-[#6B0D2F] rounded-full font-semibold">
                      14 Categories
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>

                <Link
                  href="/ladies-suits"
                  onClick={onClose}
                  className="flex items-center justify-between px-5 py-2.5 text-xs font-medium text-[#1A1315] hover:bg-[#6B0D2F]/5 hover:text-[#6B0D2F] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">Ladies Suits &amp; Sets</span>
                    <span className="text-[9px] px-2 py-0.5 bg-[#D4AF37]/20 text-[#6B0D2F] rounded-full font-semibold">
                      3 Collections
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>

                <Link
                  href="/bed-sheets"
                  onClick={onClose}
                  className="flex items-center justify-between px-5 py-2.5 text-xs font-medium text-[#1A1315] hover:bg-[#6B0D2F]/5 hover:text-[#6B0D2F] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">Pure Cotton Bed Sheets</span>
                    <span className="text-[9px] px-2 py-0.5 bg-[#D4AF37]/20 text-[#6B0D2F] rounded-full font-semibold">
                      Phulkari Work
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>

                <Link
                  href="/#departments"
                  onClick={onClose}
                  className="flex items-center justify-between px-5 py-2 text-xs text-gray-600 hover:text-[#6B0D2F] transition-colors pl-8"
                >
                  <span>Browse All Categories</span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                </Link>
              </div>
            </div>

            {/* Section 2: Account & Bag */}
            <div className="py-4">
              <div className="px-5 pb-2 text-[10px] font-bold uppercase tracking-widest text-[#6E676A] flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>My Account &amp; Bag</span>
              </div>
              <div className="space-y-0.5">
                <Link
                  href="/account"
                  onClick={onClose}
                  className="flex items-center justify-between px-5 py-2.5 text-xs font-medium text-[#1A1315] hover:bg-[#6B0D2F]/5 hover:text-[#6B0D2F] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <User className="w-4 h-4 text-[#6B0D2F]" />
                    <span className="text-sm">Account &amp; Orders</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>

                <Link
                  href="/wishlist"
                  onClick={onClose}
                  className="flex items-center justify-between px-5 py-2.5 text-xs font-medium text-[#1A1315] hover:bg-[#6B0D2F]/5 hover:text-[#6B0D2F] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Heart className="w-4 h-4 text-[#6B0D2F]" />
                    <span className="text-sm">Saved Wishlist</span>
                  </div>
                  {wishlistCount > 0 && (
                    <span className="text-[10px] px-2 py-0.5 bg-[#6B0D2F] text-white rounded-full font-bold">
                      {wishlistCount}
                    </span>
                  )}
                </Link>

                <Link
                  href="/cart"
                  onClick={onClose}
                  className="flex items-center justify-between px-5 py-2.5 text-xs font-medium text-[#1A1315] hover:bg-[#6B0D2F]/5 hover:text-[#6B0D2F] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <ShoppingBag className="w-4 h-4 text-[#6B0D2F]" />
                    <span className="text-sm">Shopping Bag</span>
                  </div>
                  {cartCount > 0 && (
                    <span className="text-[10px] px-2 py-0.5 bg-[#D4AF37] text-[#1A1315] rounded-full font-bold">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </div>
            </div>

            {/* Section 3: Store Information */}
            <div className="py-4">
              <div className="px-5 pb-2 text-[10px] font-bold uppercase tracking-widest text-[#6E676A] flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Store Information</span>
              </div>
              <div className="space-y-0.5">
                <Link
                  href="/#about"
                  onClick={onClose}
                  className="flex items-center justify-between px-5 py-2 text-xs text-gray-700 hover:text-[#6B0D2F] transition-colors"
                >
                  <span>About Our Heritage</span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                </Link>
                <Link
                  href="/#services"
                  onClick={onClose}
                  className="flex items-center justify-between px-5 py-2 text-xs text-gray-700 hover:text-[#6B0D2F] transition-colors"
                >
                  <span>Showroom Services</span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                </Link>
                <Link
                  href="/#contact"
                  onClick={onClose}
                  className="flex items-center justify-between px-5 py-2 text-xs text-gray-700 hover:text-[#6B0D2F] transition-colors"
                >
                  <span>Store Location &amp; Contact</span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                </Link>
              </div>
            </div>
          </div>

          {/* Drawer Footer: Admin Link */}
          <div className="p-4 bg-white border-t border-[#D4AF37]/20 space-y-2">
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
        </div>
      </div>
    </div>
  );
}

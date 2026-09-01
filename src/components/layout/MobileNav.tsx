'use client';

import React from 'react';
import { X, Search, Phone, ChevronRight, Heart, Sparkles } from 'lucide-react';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistCount: number;
}

export default function MobileNav({ isOpen, onClose, wishlistCount }: MobileNavProps) {
  if (!isOpen) return null;

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Sarees', href: '/sarees', tag: '14 Categories' },
    { label: 'Ladies Suits', href: '/ladies-suits', tag: '3 Categories' },
    { label: 'Bed Sheets', href: '/#bed-sheets', tag: 'Department 03' },
    { label: 'About Store', href: '/#about' },
    { label: 'Our Services', href: '/#services' },
  ];


  return (
    <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />

      <div className="fixed inset-y-0 left-0 max-w-full flex">
        <div className="w-screen max-w-xs bg-[#FAF7F2] shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-5 bg-[#6B0D2F] text-white flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg tracking-widest text-[#D4AF37]">MRA BASTRALAYA</h2>
              <p className="text-[10px] text-white/70 uppercase tracking-wider">Textiles & Apparel</p>
            </div>
            <button onClick={onClose} className="p-2 text-white/80 hover:text-white" aria-label="Close menu">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search bar inside drawer */}
          <div className="p-4 bg-white border-b border-[#D4AF37]/20">
            <div className="relative">
              <input
                type="text"
                placeholder="Search Sarees, Suits, Bed Sheets..."
                className="w-full bg-[#FAF7F2] text-xs py-2.5 pl-3 pr-9 rounded-full border border-[#D4AF37]/30 focus:outline-none focus:border-[#6B0D2F]"
              />
              <Search className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
            </div>
          </div>

          {/* Nav Links */}
          <div className="flex-1 overflow-y-auto py-2 divide-y divide-[#D4AF37]/10">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={onClose}
                className="flex items-center justify-between px-5 py-4 text-xs font-medium text-[#1A1315] hover:bg-[#6B0D2F]/5 hover:text-[#6B0D2F] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{link.label}</span>
                  {link.tag && (
                    <span className="text-[9px] px-2 py-0.5 bg-[#D4AF37]/20 text-[#6B0D2F] rounded-full font-semibold uppercase tracking-wider">
                      {link.tag}
                    </span>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </a>
            ))}
          </div>

          {/* Drawer Footer */}
          <div className="p-5 bg-white border-t border-[#D4AF37]/20 space-y-3">
            <div className="flex items-center justify-between text-xs text-[#6E676A]">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-[#6B0D2F]" />
                <span>Saved Wishlist</span>
              </div>
              <span className="font-bold text-[#6B0D2F]">{wishlistCount} Items</span>
            </div>

            <div className="pt-2 border-t border-gray-100 flex items-center gap-3 text-xs text-[#1A1315]">
              <Phone className="w-4 h-4 text-[#D4AF37]" />
              <div>
                <p className="font-semibold">Store Inquiries & Support</p>
                <p className="text-[11px] text-gray-500">Contact Us Directly In-Store</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


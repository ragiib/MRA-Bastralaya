'use client';

import React, { useState } from 'react';
import Container from '../ui/Container';
import Link from 'next/link';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Sparkles,
  ShieldCheck,
  Truck,
  ChevronDown,
} from 'lucide-react';

export default function Footer() {
  const [openSection, setOpenSection] = useState<'departments' | 'care' | 'location' | null>(null);

  const toggleSection = (section: 'departments' | 'care' | 'location') => {
    setOpenSection((prev) => (prev === section ? null : section));
  };

  return (
    <footer id="contact" className="bg-[#1A1315] text-[#FAF7F2] pt-10 sm:pt-14 pb-8 border-t-2 border-[#D4AF37]">
      <Container>
        {/* Top Trust Strip - Compact on Mobile */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 pb-8 sm:pb-10 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#6B0D2F] text-[#D4AF37] flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-white">Quality Selection</h4>
              <p className="text-[10px] sm:text-xs text-gray-400">Handloom &amp; Artisan</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#6B0D2F] text-[#D4AF37] flex items-center justify-center shrink-0">
              <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-white">Careful Dispatch</h4>
              <p className="text-[10px] sm:text-xs text-gray-400">Secure Packaging</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#6B0D2F] text-[#D4AF37] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-white">Honest Pricing</h4>
              <p className="text-[10px] sm:text-xs text-gray-400">Direct Value</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#6B0D2F] text-[#D4AF37] flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-white">Store Support</h4>
              <p className="text-[10px] sm:text-xs text-gray-400">WhatsApp Assistance</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links - Desktop Grid & Mobile Collapsible Accordions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-10 py-8 sm:py-10 border-b border-white/10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-3 pb-2 md:pb-0">
            <Link href="/" className="inline-block">
              <h3 className="text-lg sm:text-xl font-bold tracking-[0.2em] text-[#D4AF37] font-serif uppercase">
                MRA BASTRALAYA
              </h3>
              <p className="text-[9px] uppercase tracking-[0.25em] text-gray-400 font-medium mt-0.5">
                Heritage Textiles &amp; Apparel
              </p>
            </Link>
            <p className="text-xs text-gray-300 leading-relaxed max-w-sm">
              Your trusted destination for handloom sarees, unstitched ladies dress materials, and premium cotton home textiles.
            </p>
          </div>

          {/* Departments - Accordion on Mobile */}
          <div className="border-t border-white/10 md:border-t-0 pt-3 md:pt-0">
            <button
              onClick={() => toggleSection('departments')}
              className="w-full flex items-center justify-between py-1 md:py-0 md:cursor-default text-left group"
            >
              <h4 className="text-xs sm:text-sm uppercase tracking-wider text-[#D4AF37] font-semibold">
                Departments
              </h4>
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 md:hidden ${
                  openSection === 'departments' ? 'rotate-180 text-[#D4AF37]' : ''
                }`}
              />
            </button>

            <ul
              className={`space-y-2 text-xs text-gray-300 pt-2.5 md:pt-3.5 ${
                openSection === 'departments' ? 'block' : 'hidden md:block'
              }`}
            >
              <li>
                <Link href="/sarees" className="hover:text-[#D4AF37] transition-colors">
                  Sarees (14 Categories)
                </Link>
              </li>
              <li>
                <Link href="/ladies-suits" className="hover:text-[#D4AF37] transition-colors">
                  Ladies Suits &amp; Sets
                </Link>
              </li>
              <li>
                <Link href="/bed-sheets" className="hover:text-[#D4AF37] transition-colors">
                  Pure Cotton Bed Sheets
                </Link>
              </li>
              <li>
                <Link href="/#departments" className="hover:text-[#D4AF37] transition-colors">
                  All Collections
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care - Accordion on Mobile */}
          <div className="border-t border-white/10 md:border-t-0 pt-3 md:pt-0">
            <button
              onClick={() => toggleSection('care')}
              className="w-full flex items-center justify-between py-1 md:py-0 md:cursor-default text-left group"
            >
              <h4 className="text-xs sm:text-sm uppercase tracking-wider text-[#D4AF37] font-semibold">
                Customer Care
              </h4>
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 md:hidden ${
                  openSection === 'care' ? 'rotate-180 text-[#D4AF37]' : ''
                }`}
              />
            </button>

            <ul
              className={`space-y-2 text-xs text-gray-300 pt-2.5 md:pt-3.5 ${
                openSection === 'care' ? 'block' : 'hidden md:block'
              }`}
            >
              <li>
                <Link href="/#about" className="hover:text-[#D4AF37] transition-colors">
                  About Our Store
                </Link>
              </li>
              <li>
                <Link href="/#services" className="hover:text-[#D4AF37] transition-colors">
                  Services &amp; Custom Orders
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="hover:text-[#D4AF37] transition-colors">
                  Saved Wishlist
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-[#D4AF37] transition-colors">
                  My Account &amp; Orders
                </Link>
              </li>
            </ul>
          </div>

          {/* Store Location - Accordion on Mobile */}
          <div className="border-t border-white/10 md:border-t-0 pt-3 md:pt-0">
            <button
              onClick={() => toggleSection('location')}
              className="w-full flex items-center justify-between py-1 md:py-0 md:cursor-default text-left group"
            >
              <h4 className="text-xs sm:text-sm uppercase tracking-wider text-[#D4AF37] font-semibold">
                Store Showroom
              </h4>
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 md:hidden ${
                  openSection === 'location' ? 'rotate-180 text-[#D4AF37]' : ''
                }`}
              />
            </button>

            <ul
              className={`space-y-2.5 text-xs text-gray-300 pt-2.5 md:pt-3.5 ${
                openSection === 'location' ? 'block' : 'hidden md:block'
              }`}
            >
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#D4AF37] shrink-0 mt-0.5" />
                <span>MRA Bastralaya Showroom, India</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                <span>Order Inquiries &amp; WhatsApp</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                <span>mrabastrlaya@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
          <p>© 2026 MRA Bastralaya. All rights reserved.</p>

          <div className="flex items-center gap-3 text-[11px] uppercase tracking-wider text-gray-400">
            <span>Sarees</span>
            <span>·</span>
            <span>Ladies Suits</span>
            <span>·</span>
            <span>Bed Sheets</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}

'use client';

import React, { useState } from 'react';
import Container from '../ui/Container';
import Link from 'next/link';
import {
  Phone,
  Mail,
  Clock,
  ShieldCheck,
  Truck,
  ChevronDown,
} from 'lucide-react';

export default function Footer() {
  const [openDepartments, setOpenDepartments] = useState(false);

  return (
    <footer id="contact" className="bg-[#1A1315] text-[#FAF7F2] pt-10 sm:pt-14 pb-8 border-t-2 border-[#D4AF37]">
      <Container>
        {/* Top Trust Strip - Clean layout without sparkle decoration */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 pb-8 sm:pb-10 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-white">Quality Selection</h4>
              <p className="text-[10px] sm:text-xs text-gray-400">Handloom &amp; Artisan Weaves</p>
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

        {/* Main Footer Links - Structured Desktop Grid & Mobile View */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 py-8 sm:py-10 border-b border-white/10">
          {/* Brand Info */}
          <div className="lg:col-span-4 space-y-3 pb-2 md:pb-0">
            <Link href="/" className="inline-block">
              <h3 className="text-lg sm:text-xl font-bold tracking-[0.2em] text-[#D4AF37] font-serif uppercase">
                MRA BASTRALAYA
              </h3>
              <p className="text-[9px] uppercase tracking-[0.25em] text-gray-400 font-medium mt-0.5">
                Textiles &amp; Apparel
              </p>
            </Link>
            <p className="text-xs text-gray-300 leading-relaxed max-w-sm">
              Your trusted destination for handloom sarees, unstitched ladies dress materials, and pure cotton home textiles.
            </p>
            <div className="pt-2 text-xs text-gray-400">
              <p>Direct sourcing from traditional weavers across India.</p>
            </div>
          </div>

          {/* Departments - Accordion on Mobile */}
          <div className="lg:col-span-3 border-t border-white/10 md:border-t-0 pt-3 md:pt-0">
            <button
              onClick={() => setOpenDepartments(!openDepartments)}
              className="w-full flex items-center justify-between py-1 md:py-0 md:cursor-default text-left group"
            >
              <h4 className="text-xs sm:text-sm uppercase tracking-wider text-[#D4AF37] font-semibold">
                Departments
              </h4>
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 md:hidden ${openDepartments ? 'rotate-180 text-[#D4AF37]' : ''
                  }`}
              />
            </button>

            <ul
              className={`space-y-2 text-xs text-gray-300 pt-2.5 md:pt-3.5 ${openDepartments ? 'block' : 'hidden md:block'
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

          {/* Prominently Highlighted Customer Care Section */}
          <div className="lg:col-span-5 border-t border-white/10 md:border-t-0 pt-4 md:pt-0">
            <div className="bg-[#6B0D2F]/25 border border-[#D4AF37]/40 rounded-2xl p-5 sm:p-6 space-y-3.5 shadow-sm">
              <div>
                <h4 className="text-xs sm:text-sm uppercase tracking-wider text-[#D4AF37] font-bold">
                  Customer Care &amp; Support
                </h4>
                <p className="text-xs text-gray-300 leading-relaxed mt-1">
                  Contact us directly for website issues/bugs, and product, order, or service-related questions.
                </p>
              </div>

              <div className="space-y-2 pt-1 text-xs">
                <a
                  href="tel:8391097995"
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#D4AF37]/50 text-white transition-all group"
                  aria-label="Call Customer Care at 8391097995"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#6B0D2F] text-[#D4AF37] flex items-center justify-center shrink-0 border border-[#D4AF37]/40">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block uppercase tracking-wider">Phone &amp; WhatsApp Support</span>
                    <span className="font-semibold text-sm text-[#FAF7F2] group-hover:text-[#D4AF37] transition-colors">
                      8391097995
                    </span>
                  </div>
                </a>

                <a
                  href="mailto:mrabastrlaya@gmail.com"
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#D4AF37]/50 text-white transition-all group"
                  aria-label="Email Customer Care at mrabastrlaya@gmail.com"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#6B0D2F] text-[#D4AF37] flex items-center justify-center shrink-0 border border-[#D4AF37]/40">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-gray-400 block uppercase tracking-wider">Email Assistance</span>
                    <span className="font-semibold text-xs sm:text-sm text-[#FAF7F2] group-hover:text-[#D4AF37] transition-colors truncate block">
                      mrabastrlaya@gmail.com
                    </span>
                  </div>
                </a>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center gap-4 text-xs text-gray-300">
                <Link href="/wishlist" className="hover:text-[#D4AF37] transition-colors">
                  Saved Wishlist
                </Link>
                <span>•</span>
                <Link href="/account" className="hover:text-[#D4AF37] transition-colors">
                  My Account &amp; Orders
                </Link>
              </div>
            </div>
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

import React from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Container from '@/components/ui/Container';
import { ArrowLeft, Search, Sparkles } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FAF7F2]">
      <Header />

      <main className="flex-1 flex items-center justify-center py-16 sm:py-24">
        <Container>
          <div className="max-w-xl mx-auto text-center space-y-6 bg-white rounded-3xl border border-[#D4AF37]/30 p-8 sm:p-12 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-[#FAF7F2] border border-[#D4AF37]/40 text-[#6B0D2F] flex items-center justify-center mx-auto text-3xl shadow-xs">
              ✨
            </div>

            <div className="space-y-2">
              <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-bold">
                404 • Heritage Piece Not Found
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl text-[#1A1315]">
                Product Not Available
              </h1>
              <p className="text-xs sm:text-sm text-[#6E676A] leading-relaxed max-w-md mx-auto">
                The handcrafted saree, suit, or bed sheet you are looking for may have been moved, is currently being updated, or does not exist in our active catalogue.
              </p>
            </div>

            {/* Department Quick Navigation Links */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
              <Link
                href="/sarees"
                className="px-4 py-2 rounded-full bg-[#FAF7F2] hover:bg-[#F3ECE2] text-[#6B0D2F] border border-[#D4AF37]/30 text-xs font-semibold transition-colors"
              >
                Explore Sarees
              </Link>
              <Link
                href="/ladies-suits"
                className="px-4 py-2 rounded-full bg-[#FAF7F2] hover:bg-[#F3ECE2] text-[#6B0D2F] border border-[#D4AF37]/30 text-xs font-semibold transition-colors"
              >
                Explore Ladies Suits
              </Link>
              <Link
                href="/bed-sheets"
                className="px-4 py-2 rounded-full bg-[#FAF7F2] hover:bg-[#F3ECE2] text-[#6B0D2F] border border-[#D4AF37]/30 text-xs font-semibold transition-colors"
              >
                Explore Bed Sheets
              </Link>
            </div>

            <div className="pt-4 border-t border-[#D4AF37]/20">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-xs font-bold text-[#6B0D2F] hover:underline uppercase tracking-wider"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to MRA Bastralaya Homepage</span>
              </Link>
            </div>
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  );
}

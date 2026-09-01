'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/ui/CartDrawer';
import QuickViewModal from '@/components/ui/QuickViewModal';
import ToastNotification from '@/components/ui/ToastNotification';
import Container from '@/components/ui/Container';
import ProductCard from '@/components/product/ProductCard';
import { BED_SHEET_CATEGORIES, BED_SHEET_PRODUCTS, BedSheetCategory } from '@/data/bedSheetsData';
import { Sparkles, ChevronRight, Check, ArrowRight, ShieldCheck, Feather, HeartHandshake, Eye } from 'lucide-react';
import Link from 'next/link';

interface BedSheetsCatalogueProps {
  initialCategorySlug?: string;
}

export default function BedSheetsCatalogue({ initialCategorySlug }: BedSheetsCatalogueProps) {
  const category: BedSheetCategory = BED_SHEET_CATEGORIES[0];
  const isFilteredCategory = initialCategorySlug === category.slug;

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FAF7F2]">
      {/* Global Header */}
      <Header />

      <main className="flex-1">
        {/* Breadcrumbs & Header Banner */}
        <section className="bg-gradient-to-b from-[#FAF7F2] to-[#F3ECE2] border-b border-[#D4AF37]/30 py-8 sm:py-12">
          <Container>
            {/* Breadcrumbs */}
            <nav
              className="flex items-center space-x-2 text-xs text-[#6E676A] mb-4 overflow-x-auto whitespace-nowrap scrollbar-none"
              aria-label="Breadcrumb"
            >
              <Link href="/" className="hover:text-[#6B0D2F] transition-colors">
                Home
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <Link
                href="/bed-sheets"
                className={`hover:text-[#6B0D2F] transition-colors ${
                  !isFilteredCategory ? 'text-[#6B0D2F] font-semibold' : ''
                }`}
              >
                Bed Sheets Department
              </Link>
              {isFilteredCategory && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <span className="text-[#6B0D2F] font-semibold truncate">
                    {category.name}
                  </span>
                </>
              )}
            </nav>

            {/* Department Title & Intro */}
            <div className="max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#6B0D2F]/10 border border-[#6B0D2F]/20 text-[#6B0D2F]">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span className="text-[11px] uppercase tracking-widest font-semibold">
                  Department 03 &bull; Home Textiles & Bedding
                </span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#1A1315] font-normal leading-tight">
                {isFilteredCategory ? category.name : 'Bed Sheets Collection'}
              </h1>

              <p className="text-xs sm:text-sm text-[#6E676A] leading-relaxed">
                Experience everyday luxury with our artisan handwork bedding collection. Handcrafted on breathable high-count cotton fabrics, featuring authentic Punjabi Phulkari silk embroidery paired with matching pillow covers.
              </p>
            </div>
          </Container>
        </section>

        {/* Featured Category Card — Phulkari Handwork Bed Sheet */}
        <section className="py-8 sm:py-12 bg-white border-b border-[#D4AF37]/20">
          <Container>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-serif text-xl sm:text-2xl text-[#1A1315]">
                  Featured Bed Sheet Craft
                </h2>
                <p className="text-xs text-[#6E676A] mt-0.5">
                  Exclusive artisan category handcrafted for MRA Bastralaya
                </p>
              </div>

              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-[#6B0D2F] bg-[#FAF7F2] border border-[#D4AF37]/40">
                <span className="w-2 h-2 rounded-full bg-[#6B0D2F]" />
                1 Dedicated Craft Category
              </span>
            </div>

            {/* Large Spotlight Category Card */}
            <div className="relative rounded-3xl overflow-hidden bg-[#FAF7F2] border border-[#D4AF37]/40 shadow-lg hover:shadow-2xl transition-all duration-500 grid grid-cols-1 lg:grid-cols-12">
              {/* Left Image Section */}
              <div className="lg:col-span-7 relative h-72 sm:h-96 lg:h-[420px] overflow-hidden bg-gray-100 group">
                <img
                  src={category.image}
                  alt={category.imageAlt || category.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent lg:hidden" />

                {/* Badge Overlay */}
                <div className="absolute top-4 left-4 z-10">
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#6B0D2F] text-[#D4AF37] border border-[#D4AF37]/50 shadow-md">
                    01 &bull; {category.itemCountLabel}
                  </span>
                </div>

                {/* Mobile Title Overlay */}
                <div className="absolute bottom-4 left-4 right-4 text-white lg:hidden">
                  <span className="text-[10px] uppercase tracking-wider text-[#D4AF37] font-semibold">
                    {category.fabric}
                  </span>
                  <h3 className="font-serif text-xl font-medium text-white">
                    {category.name}
                  </h3>
                </div>
              </div>

              {/* Right Content Section */}
              <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6 bg-gradient-to-br from-white to-[#FAF7F2]">
                <div className="space-y-4">
                  <div className="hidden lg:block">
                    <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-bold">
                      {category.fabric}
                    </span>
                    <h3 className="font-serif text-2xl sm:text-3xl text-[#1A1315] font-normal mt-1 leading-tight">
                      {category.name}
                    </h3>
                  </div>

                  <p className="text-xs sm:text-sm text-[#6E676A] leading-relaxed">
                    {category.shortDescription}
                  </p>

                  {/* Highlights Bullet List */}
                  <div className="space-y-2.5 pt-2 border-t border-[#D4AF37]/20">
                    <div className="flex items-center gap-2.5 text-xs text-[#1A1315]">
                      <span className="w-5 h-5 rounded-full bg-[#6B0D2F]/10 text-[#6B0D2F] flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                      <span>100% Breathable Combed Cotton Base</span>
                    </div>

                    <div className="flex items-center gap-2.5 text-xs text-[#1A1315]">
                      <span className="w-5 h-5 rounded-full bg-[#6B0D2F]/10 text-[#6B0D2F] flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                      <span>Authentic Punjabi Phulkari Silk Floss Needlework</span>
                    </div>

                    <div className="flex items-center gap-2.5 text-xs text-[#1A1315]">
                      <span className="w-5 h-5 rounded-full bg-[#6B0D2F]/10 text-[#6B0D2F] flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                      <span>2 Matching Embroidered Pillow Covers Included</span>
                    </div>

                    <div className="flex items-center gap-2.5 text-xs text-[#1A1315]">
                      <span className="w-5 h-5 rounded-full bg-[#6B0D2F]/10 text-[#6B0D2F] flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                      <span>King, Queen & Double Bed Sizes Available</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action / Slug link */}
                <div className="pt-4 border-t border-[#D4AF37]/20 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[11px] text-[#6E676A] block">Available Options</span>
                    <span className="font-serif text-sm font-semibold text-[#6B0D2F]">
                      {BED_SHEET_PRODUCTS.length} Handcrafted Designs
                    </span>
                  </div>

                  <Link
                    href="/bed-sheets/phulkari-handwork-bed-sheet"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#6B0D2F] hover:bg-[#540924] text-white text-xs uppercase tracking-wider font-medium shadow-md transition-all active:scale-[0.98]"
                  >
                    <span>View Category</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#D4AF37]" />
                  </Link>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* Product Showcase */}
        <section className="py-10 sm:py-16">
          <Container>
            {/* Status Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#D4AF37]/30 mb-8">
              <div className="flex items-center gap-3">
                <span className="font-serif text-lg sm:text-xl text-[#1A1315]">
                  Phulkari Handwork Bed Sheet Sets
                </span>
                <span className="text-xs text-[#6E676A] bg-white px-2.5 py-1 rounded-full border border-[#D4AF37]/30 font-medium">
                  {BED_SHEET_PRODUCTS.length} Designs in Stock
                </span>
              </div>

              <div className="text-xs text-[#6E676A] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                <span>Authentic Hand Embroidery &bull; Pure Cotton</span>
              </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 sm:gap-8">
              {BED_SHEET_PRODUCTS.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Department Navigation Backlinks */}
            <div className="mt-16 p-8 rounded-3xl bg-white border border-[#D4AF37]/30 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-1 text-center md:text-left">
                <h3 className="font-serif text-lg text-[#1A1315]">
                  Explore Other Departments at MRA Bastralaya
                </h3>
                <p className="text-xs text-[#6E676A]">
                  Discover our 14 Saree weaving crafts and 3 Ladies Suits categories
                </p>
              </div>

              <div className="flex items-center gap-3 flex-wrap justify-center">
                <Link
                  href="/sarees"
                  className="px-5 py-2.5 rounded-full bg-[#FAF7F2] hover:bg-[#6B0D2F] text-[#1A1315] hover:text-white border border-[#D4AF37]/40 text-xs font-medium uppercase tracking-wider transition-all"
                >
                  Sarees (14 Categories)
                </Link>

                <Link
                  href="/ladies-suits"
                  className="px-5 py-2.5 rounded-full bg-[#FAF7F2] hover:bg-[#6B0D2F] text-[#1A1315] hover:text-white border border-[#D4AF37]/40 text-xs font-medium uppercase tracking-wider transition-all"
                >
                  Ladies Suits (3 Categories)
                </Link>

                <Link
                  href="/"
                  className="px-5 py-2.5 rounded-full bg-[#6B0D2F] text-white text-xs font-medium uppercase tracking-wider hover:bg-[#540924] transition-all"
                >
                  Store Homepage
                </Link>
              </div>
            </div>
          </Container>
        </section>
      </main>

      {/* Global Modals & Drawers */}
      <CartDrawer />
      <QuickViewModal />
      <ToastNotification />

      {/* Global Footer */}
      <Footer />
    </div>
  );
}

'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/ui/CartDrawer';
import ToastNotification from '@/components/ui/ToastNotification';
import Container from '@/components/ui/Container';
import ProductCard from '@/components/product/ProductCard';
import { BED_SHEET_CATEGORIES, BedSheetCategory } from '@/data/bedSheetsData';
import { ChevronRight, Check, ArrowRight, ShieldCheck, RotateCcw, LayoutGrid } from 'lucide-react';
import Link from 'next/link';

import { ProductItem } from '@/types/product';
import { StaggerGrid, StaggerCard } from '@/components/ui/motion';

interface BedSheetsCatalogueProps {
  initialCategorySlug?: string;
  initialProducts?: ProductItem[];
}

export default function BedSheetsCatalogue({
  initialCategorySlug,
  initialProducts = [],
}: BedSheetsCatalogueProps) {
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>(
    initialCategorySlug || 'all'
  );
  const [showSpotlight, setShowSpotlight] = useState<boolean>(false);

  const PAGE_SIZE = 12;
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);

  // Auto-scroll to product section if landing via dedicated category route
  useEffect(() => {
    if (initialCategorySlug) {
      setSelectedCategorySlug(initialCategorySlug);
      if (initialCategorySlug !== 'all') {
        const timer = setTimeout(() => {
          const el = document.getElementById('products-section');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 150);
        return () => clearTimeout(timer);
      }
    }
  }, [initialCategorySlug]);

  const handleCategorySelect = (slug: string, shouldScroll = true) => {
    setSelectedCategorySlug(slug);
    const newUrl = slug === 'all' ? '/bed-sheets' : `/bed-sheets/${slug}`;
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', newUrl);
      if (shouldScroll) {
        setTimeout(() => {
          const el = document.getElementById('products-section');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 60);
      }
    }
  };

  const activeCategory: BedSheetCategory | undefined = useMemo(() => {
    if (selectedCategorySlug === 'all') return undefined;
    return BED_SHEET_CATEGORIES.find((cat) => cat.slug === selectedCategorySlug);
  }, [selectedCategorySlug]);

  const filteredProducts = useMemo(() => {
    if (selectedCategorySlug === 'all') {
      return initialProducts;
    }
    return initialProducts.filter((p) => p.categorySlug === selectedCategorySlug);
  }, [selectedCategorySlug, initialProducts]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [selectedCategorySlug]);

  const visibleProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount);
  }, [filteredProducts, visibleCount]);

  const featuredCategory = BED_SHEET_CATEGORIES[0];

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
              <button
                onClick={() => handleCategorySelect('all')}
                className={`hover:text-[#6B0D2F] transition-colors ${
                  selectedCategorySlug === 'all' ? 'text-[#6B0D2F] font-semibold' : ''
                }`}
              >
                Bed Sheets Department
              </button>
              {activeCategory && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <span className="text-[#6B0D2F] font-semibold truncate">
                    {activeCategory.name}
                  </span>
                </>
              )}
            </nav>

            {/* Department Title & Intro */}
            <div className="max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#6B0D2F]/10 border border-[#6B0D2F]/20 text-[#6B0D2F]">
                <span className="text-[11px] uppercase tracking-widest font-semibold">
                  Department 03 &bull; Home Textiles &amp; Bedding
                </span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#1A1315] font-normal leading-tight">
                {activeCategory ? activeCategory.name : 'Bed Sheets Collection'}
              </h1>

              <p className="text-xs sm:text-sm text-[#6E676A] leading-relaxed">
                {activeCategory
                  ? activeCategory.shortDescription
                  : '100% pure combed cotton bed sheets with authentic Punjabi Phulkari silk-thread embroidery. Each set includes 2 matching embroidered pillow covers for double, queen, and king beds.'}
              </p>
            </div>
          </Container>
        </section>

        {/* Category Filter Chips Bar (Sticky) */}
        <section className="sticky top-20 z-30 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#D4AF37]/30 py-3 shadow-xs">
          <Container>
            <div className="flex items-center justify-between gap-4">
              {/* Category Pills (Horizontal Scrollable) */}
              <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none w-full">
                {/* "All Bed Sheets" Pill */}
                <button
                  onClick={() => handleCategorySelect('all')}
                  className={`px-4 py-2 rounded-full text-xs font-medium uppercase tracking-wider whitespace-nowrap transition-all duration-200 flex-shrink-0 flex items-center gap-1.5 cursor-pointer ${
                    selectedCategorySlug === 'all'
                      ? 'bg-[#6B0D2F] text-white shadow-sm border border-[#D4AF37]'
                      : 'bg-white text-[#1A1315] hover:bg-[#F3ECE2] border border-[#D4AF37]/30'
                  }`}
                >
                  <span>All Bed Sheets</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      selectedCategorySlug === 'all'
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {initialProducts.length}
                  </span>
                </button>

                {/* Specific Category Pills */}
                {BED_SHEET_CATEGORIES.map((cat, idx) => {
                  const isSelected = selectedCategorySlug === cat.slug;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleCategorySelect(cat.slug)}
                      className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0 flex items-center gap-2 cursor-pointer ${
                        isSelected
                          ? 'bg-[#6B0D2F] text-white shadow-sm border border-[#D4AF37]'
                          : 'bg-white text-[#1A1315] hover:bg-[#F3ECE2] border border-[#D4AF37]/30'
                      }`}
                    >
                      <span className="text-[10px] font-mono opacity-70">0{idx + 1}</span>
                      <span>{cat.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Toggle Spotlight Craft Info */}
              <button
                onClick={() => setShowSpotlight(!showSpotlight)}
                className="hidden lg:flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#6B0D2F] bg-white border border-[#D4AF37]/40 rounded-full hover:bg-[#F3ECE2] transition-colors whitespace-nowrap flex-shrink-0 cursor-pointer"
                title="Toggle Featured Craft Card"
              >
                <LayoutGrid className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>{showSpotlight ? 'Hide Spotlight' : 'Craft Spotlight'}</span>
              </button>
            </div>
          </Container>
        </section>

        {/* Optional Collapsible Spotlight Card */}
        {showSpotlight && featuredCategory && (
          <section className="py-8 bg-white border-b border-[#D4AF37]/20 animate-fadeIn">
            <Container>
              <div className="relative rounded-3xl overflow-hidden bg-[#FAF7F2] border border-[#D4AF37]/40 shadow-lg grid grid-cols-1 lg:grid-cols-12">
                <div className="lg:col-span-6 relative h-64 sm:h-80 overflow-hidden bg-gray-100">
                  <img
                    src={featuredCategory.image}
                    alt={featuredCategory.imageAlt || featuredCategory.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-contain p-4"
                  />
                </div>
                <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-bold">
                      {featuredCategory.fabric}
                    </span>
                    <h3 className="font-serif text-2xl text-[#1A1315] font-normal mt-1">
                      {featuredCategory.name}
                    </h3>
                    <p className="text-xs text-[#6E676A] mt-2 leading-relaxed">
                      {featuredCategory.shortDescription}
                    </p>
                  </div>
                  <div className="space-y-2 text-xs text-[#1A1315] pt-2 border-t border-[#D4AF37]/20">
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-[#6B0D2F]/10 text-[#6B0D2F] flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                      <span>100% Breathable Combed Cotton Base</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-[#6B0D2F]/10 text-[#6B0D2F] flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                      <span>2 Matching Embroidered Pillow Covers Included</span>
                    </div>
                  </div>
                </div>
              </div>
            </Container>
          </section>
        )}

        {/* Product Showcase (Appears directly below the category chips!) */}
        <section id="products-section" className="py-10 sm:py-16 scroll-mt-36">
          <Container>
            {/* Status Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#D4AF37]/30 mb-8">
              <div className="flex items-center gap-3">
                <span className="font-serif text-lg sm:text-xl text-[#1A1315]">
                  {activeCategory ? activeCategory.name : 'All Bed Sheets'}
                </span>
                <span className="text-xs text-[#6E676A] bg-white px-2.5 py-1 rounded-full border border-[#D4AF37]/30 font-medium">
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'Design' : 'Designs'} Available
                </span>
              </div>

              <div className="flex items-center gap-4">
                {selectedCategorySlug !== 'all' && (
                  <button
                    onClick={() => handleCategorySelect('all')}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B0D2F] hover:text-[#540924] transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Filter</span>
                  </button>
                )}
                <div className="text-xs text-[#6E676A] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                  <span>Authentic Hand Embroidery &bull; Pure Cotton</span>
                </div>
              </div>
            </div>

            {/* Product Grid */}
            {filteredProducts.length > 0 ? (
              <>
                <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 sm:gap-8">
                  {visibleProducts.map((product, index) => (
                    <StaggerCard key={product.id}>
                      <ProductCard product={product} priority={index < 4} />
                    </StaggerCard>
                  ))}
                </StaggerGrid>

                {filteredProducts.length > visibleCount && (
                  <div className="mt-12 text-center">
                    <button
                      type="button"
                      onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                      className="px-8 py-3.5 rounded-full bg-white hover:bg-[#FAF7F2] text-[#6B0D2F] border-2 border-[#D4AF37]/50 font-serif text-xs font-semibold uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95"
                    >
                      Load More Products (Showing {visibleProducts.length} of {filteredProducts.length})
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="py-16 text-center bg-white rounded-3xl border border-[#D4AF37]/30 p-8 sm:p-12 space-y-4 max-w-lg mx-auto shadow-xs">
                <div className="w-14 h-14 rounded-2xl bg-[#FAF7F2] border border-[#D4AF37]/40 text-[#6B0D2F] flex items-center justify-center mx-auto text-2xl shadow-xs">
                  🛏️
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif text-xl sm:text-2xl text-[#1A1315]">
                    No products available yet
                  </h3>
                  <p className="text-xs sm:text-sm text-[#6E676A] leading-relaxed">
                    Our handcrafted Phulkari bed sheet sets are currently being prepared with fresh arrivals. Please check back soon or explore our other departments.
                  </p>
                </div>
                {selectedCategorySlug !== 'all' && (
                  <button
                    onClick={() => handleCategorySelect('all')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#6B0D2F] text-white text-xs font-semibold rounded-full hover:bg-[#540924] transition-colors cursor-pointer shadow-sm"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>View All Bed Sheets</span>
                  </button>
                )}
              </div>
            )}

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
      <ToastNotification />

      {/* Global Footer */}
      <Footer />
    </div>
  );
}

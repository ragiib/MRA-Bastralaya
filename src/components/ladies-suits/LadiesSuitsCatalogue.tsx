'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/ui/CartDrawer';
import QuickViewModal from '@/components/ui/QuickViewModal';
import ToastNotification from '@/components/ui/ToastNotification';
import Container from '@/components/ui/Container';
import ProductCard from '@/components/product/ProductCard';
import { LADIES_SUIT_CATEGORIES, LADIES_SUIT_PRODUCTS, LadiesSuitCategory } from '@/data/ladiesSuitsData';
import { Sparkles, ChevronRight, Check, ArrowRight, RotateCcw, LayoutGrid, ShieldCheck, Sparkle } from 'lucide-react';
import Link from 'next/link';

interface LadiesSuitsCatalogueProps {
  initialCategorySlug?: string;
}

export default function LadiesSuitsCatalogue({ initialCategorySlug }: LadiesSuitsCatalogueProps) {
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>(initialCategorySlug || 'all');
  const [showVisualGrid, setShowVisualGrid] = useState<boolean>(true);

  // Sync state if initialCategorySlug prop changes (e.g. via route navigation)
  useEffect(() => {
    if (initialCategorySlug) {
      setSelectedCategorySlug(initialCategorySlug);
    }
  }, [initialCategorySlug]);

  const handleCategorySelect = (slug: string) => {
    setSelectedCategorySlug(slug);
    const newUrl = slug === 'all' ? '/ladies-suits' : `/ladies-suits/${slug}`;
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', newUrl);
    }
  };

  // Active category metadata if filtered
  const activeCategory: LadiesSuitCategory | undefined = useMemo(() => {
    if (selectedCategorySlug === 'all') return undefined;
    return LADIES_SUIT_CATEGORIES.find((cat) => cat.slug === selectedCategorySlug);
  }, [selectedCategorySlug]);

  // Filter products based on selected category
  const filteredProducts = useMemo(() => {
    if (selectedCategorySlug === 'all') {
      return LADIES_SUIT_PRODUCTS;
    }
    return LADIES_SUIT_PRODUCTS.filter((prod) => prod.categorySlug === selectedCategorySlug);
  }, [selectedCategorySlug]);

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
                Ladies Suits Department
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
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span className="text-[11px] uppercase tracking-widest font-semibold">
                  Department 02 &bull; Ethnic Suits & Sets
                </span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#1A1315] font-normal leading-tight">
                {activeCategory ? activeCategory.name : 'Ladies Suits Collection'}
              </h1>

              <p className="text-xs sm:text-sm text-[#6E676A] leading-relaxed">
                {activeCategory
                  ? activeCategory.shortDescription
                  : 'Discover our handpicked collection of ladies salwar suits, dress materials, and ethnic sets. Featuring authentic handcrafted Cotton Batik, vibrant Punjabi Phulkari needlework, and refreshing everyday Printed Cottons.'}
              </p>
            </div>
          </Container>
        </section>

        {/* 3 Categories Horizontal Sticky Filter Bar */}
        <section className="sticky top-20 z-30 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#D4AF37]/30 py-3 shadow-xs">
          <Container>
            <div className="flex items-center justify-between gap-4">
              {/* Category Pills (Horizontal Scrollable) */}
              <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none w-full">
                {/* "All Suits" Pill */}
                <button
                  onClick={() => handleCategorySelect('all')}
                  className={`px-4 py-2 rounded-full text-xs font-medium uppercase tracking-wider whitespace-nowrap transition-all duration-200 flex-shrink-0 flex items-center gap-1.5 ${
                    selectedCategorySlug === 'all'
                      ? 'bg-[#6B0D2F] text-white shadow-sm border border-[#D4AF37]'
                      : 'bg-white text-[#1A1315] hover:bg-[#F3ECE2] border border-[#D4AF37]/30'
                  }`}
                >
                  <span>All Suits</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      selectedCategorySlug === 'all'
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {LADIES_SUIT_CATEGORIES.length}
                  </span>
                </button>

                {/* 3 Specific Category Pills */}
                {LADIES_SUIT_CATEGORIES.map((cat, idx) => {
                  const isSelected = selectedCategorySlug === cat.slug;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleCategorySelect(cat.slug)}
                      className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0 flex items-center gap-2 ${
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

              {/* Toggle Visual Grid on/off */}
              <button
                onClick={() => setShowVisualGrid(!showVisualGrid)}
                className="hidden lg:flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#6B0D2F] bg-white border border-[#D4AF37]/40 rounded-full hover:bg-[#F3ECE2] transition-colors whitespace-nowrap flex-shrink-0"
                title="Toggle Category Cards View"
              >
                <LayoutGrid className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>{showVisualGrid ? 'Hide Cards' : 'Show 3 Cards'}</span>
              </button>
            </div>
          </Container>
        </section>

        {/* Visual 3 Category Cards Grid */}
        {showVisualGrid && (
          <section className="py-8 sm:py-12 bg-white border-b border-[#D4AF37]/20">
            <Container>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-serif text-xl sm:text-2xl text-[#1A1315]">
                    Explore 3 Ladies Suits Categories
                  </h2>
                  <p className="text-xs text-[#6E676A] mt-0.5">
                    Select a category card to view its curated collection and fabrics
                  </p>
                </div>
                {selectedCategorySlug !== 'all' && (
                  <button
                    onClick={() => handleCategorySelect('all')}
                    className="inline-flex items-center gap-1 text-xs text-[#6B0D2F] font-semibold hover:underline"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Show All 3 Categories
                  </button>
                )}
              </div>

              {/* Responsive Grid of 3 Category Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
                {LADIES_SUIT_CATEGORIES.map((cat, idx) => {
                  const isSelected = selectedCategorySlug === cat.slug;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleCategorySelect(cat.slug)}
                      className={`group relative rounded-3xl overflow-hidden text-left flex flex-col justify-between transition-all duration-300 border ${
                        isSelected
                          ? 'ring-3 ring-[#6B0D2F] border-[#D4AF37] shadow-xl scale-[1.02]'
                          : 'border-[#D4AF37]/30 hover:border-[#D4AF37] hover:shadow-xl'
                      } bg-[#FAF7F2] h-80 sm:h-96`}
                    >
                      {/* Image container */}
                      <div className="relative w-full h-full overflow-hidden bg-gray-100">
                        <img
                          src={cat.image}
                          alt={cat.imageAlt || cat.name}
                          className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-700 ease-out"
                          loading="lazy"
                        />
                        {/* Gradient Overlay for text readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/15" />

                        {/* Top Category Badge and Index */}
                        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-black/50 backdrop-blur-md text-[#D4AF37] border border-[#D4AF37]/40 shadow-sm">
                            0{idx + 1} &bull; {cat.itemCountLabel}
                          </span>

                          {/* Active Indicator */}
                          {isSelected && (
                            <span className="w-7 h-7 rounded-full bg-[#6B0D2F] text-white flex items-center justify-center shadow-lg border border-[#D4AF37]">
                              <Check className="w-4 h-4 stroke-[3]" />
                            </span>
                          )}
                        </div>

                        {/* Bottom Content Area */}
                        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 text-white space-y-2 z-10">
                          <span className="text-[10px] uppercase tracking-wider text-[#D4AF37] font-semibold block">
                            {cat.fabric}
                          </span>
                          <h3 className="font-serif text-xl sm:text-2xl font-normal text-white group-hover:text-[#FFF3B0] transition-colors leading-tight">
                            {cat.name}
                          </h3>
                          <p className="text-xs text-gray-200 line-clamp-2 leading-relaxed opacity-90">
                            {cat.shortDescription}
                          </p>
                          <div className="pt-2 flex items-center text-xs text-[#FFF3B0] font-medium group-hover:translate-x-1 transition-transform">
                            <span>{isSelected ? 'Currently Viewing' : 'View Collection'}</span>
                            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Container>
          </section>
        )}

        {/* Active Filter Status & Product Showcase */}
        <section className="py-10 sm:py-16">
          <Container>
            {/* Filter Status Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#D4AF37]/30 mb-8">
              <div className="flex items-center gap-3">
                <span className="font-serif text-lg sm:text-xl text-[#1A1315]">
                  {activeCategory ? activeCategory.name : 'All Ladies Suits Categories'}
                </span>
                <span className="text-xs text-[#6E676A] bg-white px-2.5 py-1 rounded-full border border-[#D4AF37]/30 font-medium">
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'Design' : 'Designs'} Available
                </span>
              </div>

              {selectedCategorySlug !== 'all' && (
                <button
                  onClick={() => handleCategorySelect('all')}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-[#6B0D2F] hover:text-[#540924] transition-colors self-start sm:self-auto"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Filter (Show All 3 Categories)</span>
                </button>
              )}
            </div>

            {/* Active Category Information Card when filtered */}
            {activeCategory && (
              <div className="mb-8 p-5 sm:p-6 rounded-2xl bg-white border border-[#D4AF37]/40 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#6B0D2F] text-[#D4AF37] flex items-center justify-center flex-shrink-0 font-serif font-bold text-lg">
                    ✨
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-serif text-base font-semibold text-[#1A1315]">
                        About {activeCategory.name} Suits
                      </h3>
                      <span className="text-[10px] px-2 py-0.5 bg-[#D4AF37]/20 text-[#6B0D2F] rounded-full font-semibold">
                        {activeCategory.fabric}
                      </span>
                    </div>
                    <p className="text-xs text-[#6E676A] mt-1 leading-relaxed max-w-2xl">
                      {activeCategory.shortDescription}
                    </p>
                  </div>
                </div>

                <div className="text-xs text-[#6E676A] sm:text-right flex-shrink-0">
                  <span className="text-[11px] uppercase tracking-wider text-[#D4AF37] font-bold block">
                    Authentic Craft
                  </span>
                  <span>{activeCategory.itemCountLabel}</span>
                </div>
              </div>
            )}

            {/* Product Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 sm:gap-8">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="py-16 text-center bg-white rounded-3xl border border-[#D4AF37]/30 p-8">
                <p className="font-serif text-lg text-[#1A1315] mb-2">
                  No products currently displayed for this category
                </p>
                <p className="text-xs text-[#6E676A] mb-6 max-w-md mx-auto">
                  New collections for this suit craft are being updated in the catalogue.
                </p>
                <button
                  onClick={() => handleCategorySelect('all')}
                  className="px-6 py-2.5 bg-[#6B0D2F] text-white rounded-full text-xs uppercase tracking-wider font-medium hover:bg-[#540924] transition-colors"
                >
                  View All Suits
                </button>
              </div>
            )}
          </Container>
        </section>
      </main>

      {/* Global Drawers & Modals */}
      <CartDrawer />
      <QuickViewModal />
      <ToastNotification />

      {/* Global Footer */}
      <Footer />
    </div>
  );
}

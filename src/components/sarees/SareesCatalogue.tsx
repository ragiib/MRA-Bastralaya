'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/ui/CartDrawer';
import QuickViewModal from '@/components/ui/QuickViewModal';
import ToastNotification from '@/components/ui/ToastNotification';
import Container from '@/components/ui/Container';
import ProductCard from '@/components/product/ProductCard';
import Badge from '@/components/ui/Badge';
import { SAREE_CATEGORIES, SAREE_PRODUCTS, SareeCategory } from '@/data/sareesData';
import { Sparkles, ChevronRight, Filter, LayoutGrid, Check, ArrowRight, RotateCcw, Info } from 'lucide-react';
import Link from 'next/link';

interface SareesCatalogueProps {
  initialCategorySlug?: string;
}

export default function SareesCatalogue({ initialCategorySlug }: SareesCatalogueProps) {
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>(initialCategorySlug || 'all');
  const [showVisualGrid, setShowVisualGrid] = useState<boolean>(true);

  // Sync state if initialCategorySlug prop changes
  useEffect(() => {
    if (initialCategorySlug) {
      setSelectedCategorySlug(initialCategorySlug);
    }
  }, [initialCategorySlug]);

  // Find active category metadata if one is selected
  const activeCategory: SareeCategory | undefined = useMemo(() => {
    if (selectedCategorySlug === 'all') return undefined;
    return SAREE_CATEGORIES.find((cat) => cat.slug === selectedCategorySlug);
  }, [selectedCategorySlug]);

  // Filter products based on selected category
  const filteredProducts = useMemo(() => {
    if (selectedCategorySlug === 'all') {
      return SAREE_PRODUCTS;
    }
    return SAREE_PRODUCTS.filter((prod) => prod.categorySlug === selectedCategorySlug);
  }, [selectedCategorySlug]);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FAF7F2]">
      {/* Top Header & Announcement */}
      <Header />

      <main className="flex-1">
        {/* Breadcrumbs & Header Banner */}
        <section className="bg-gradient-to-b from-[#FAF7F2] to-[#F3ECE2] border-b border-[#D4AF37]/30 py-8 sm:py-12">
          <Container>
            {/* Breadcrumbs */}
            <nav className="flex items-center space-x-2 text-xs text-[#6E676A] mb-4 overflow-x-auto whitespace-nowrap scrollbar-none" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-[#6B0D2F] transition-colors">
                Home
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <button
                onClick={() => setSelectedCategorySlug('all')}
                className={`hover:text-[#6B0D2F] transition-colors ${selectedCategorySlug === 'all' ? 'text-[#6B0D2F] font-semibold' : ''}`}
              >
                Sarees Department
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
                  Department Catalogue
                </span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#1A1315] font-normal leading-tight">
                {activeCategory ? activeCategory.name : 'Sarees Collection'}
              </h1>

              <p className="text-xs sm:text-sm text-[#6E676A] leading-relaxed">
                {activeCategory
                  ? activeCategory.shortDescription
                  : 'Explore our 14 dedicated handloom and artisan saree categories. From daily breathable cottons and classic Bengal Tants to luxurious Tassar, Baluchari, and intricate applique weaves.'}
              </p>
            </div>
          </Container>
        </section>

        {/* 14 Categories Horizontal Sticky Filter Bar */}
        <section className="sticky top-20 z-30 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#D4AF37]/30 py-3 shadow-xs">
          <Container>
            <div className="flex items-center justify-between gap-4">
              {/* Category Pills (Horizontal Scrollable) */}
              <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none w-full">
                {/* "All Sarees" Pill */}
                <button
                  onClick={() => setSelectedCategorySlug('all')}
                  className={`px-4 py-2 rounded-full text-xs font-medium uppercase tracking-wider whitespace-nowrap transition-all duration-200 flex-shrink-0 flex items-center gap-1.5 ${
                    selectedCategorySlug === 'all'
                      ? 'bg-[#6B0D2F] text-white shadow-sm border border-[#D4AF37]'
                      : 'bg-white text-[#1A1315] hover:bg-[#F3ECE2] border border-[#D4AF37]/30'
                  }`}
                >
                  <span>All Sarees</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedCategorySlug === 'all' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>
                    14
                  </span>
                </button>

                {/* 14 Specific Category Pills */}
                {SAREE_CATEGORIES.map((cat, idx) => {
                  const isSelected = selectedCategorySlug === cat.slug;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategorySlug(cat.slug)}
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
                <span>{showVisualGrid ? 'Hide Cards' : 'Show 14 Cards'}</span>
              </button>
            </div>
          </Container>
        </section>

        {/* Visual 14 Category Cards Grid (Collapsible/Toggleable) */}
        {showVisualGrid && (
          <section className="py-8 sm:py-12 bg-white border-b border-[#D4AF37]/20">
            <Container>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-serif text-xl sm:text-2xl text-[#1A1315]">
                    Browse 14 Saree Departments
                  </h2>
                  <p className="text-xs text-[#6E676A] mt-0.5">
                    Click any category tile below to filter the collection
                  </p>
                </div>
                {selectedCategorySlug !== 'all' && (
                  <button
                    onClick={() => setSelectedCategorySlug('all')}
                    className="inline-flex items-center gap-1 text-xs text-[#6B0D2F] font-semibold hover:underline"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Show All 14 Categories
                  </button>
                )}
              </div>

              {/* Responsive Grid of 14 Category Tiles */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
                {SAREE_CATEGORIES.map((cat, idx) => {
                  const isSelected = selectedCategorySlug === cat.slug;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategorySlug(cat.slug)}
                      className={`group relative rounded-2xl overflow-hidden text-left flex flex-col justify-between transition-all duration-300 border ${
                        isSelected
                          ? 'ring-2 ring-[#6B0D2F] border-[#D4AF37] shadow-lg scale-[1.02]'
                          : 'border-[#D4AF37]/30 hover:border-[#D4AF37] hover:shadow-md'
                      } bg-[#FAF7F2] h-48 sm:h-56`}
                    >
                      {/* Image */}
                      <div className="relative w-full h-full overflow-hidden bg-gray-100">
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                        />
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />

                        {/* Category Number Tag */}
                        <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-black/40 backdrop-blur-md text-[#D4AF37] border border-[#D4AF37]/30">
                          0{idx + 1}
                        </span>

                        {/* Active Selection Indicator */}
                        {isSelected && (
                          <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#6B0D2F] text-white flex items-center justify-center shadow-md border border-[#D4AF37]">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                        )}

                        {/* Content text at bottom of card */}
                        <div className="absolute bottom-0 left-0 right-0 p-2.5 sm:p-3 text-white">
                          <span className="text-[9px] uppercase tracking-wider text-[#D4AF37] font-semibold block truncate">
                            {cat.fabric}
                          </span>
                          <h3 className="font-serif text-xs sm:text-sm font-medium text-white group-hover:text-[#FFF3B0] transition-colors leading-tight line-clamp-2 mt-0.5">
                            {cat.name}
                          </h3>
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
                  {activeCategory ? activeCategory.name : 'All Saree Categories'}
                </span>
                <span className="text-xs text-[#6E676A] bg-white px-2.5 py-1 rounded-full border border-[#D4AF37]/30 font-medium">
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'Design' : 'Designs'} Available
                </span>
              </div>

              {selectedCategorySlug !== 'all' && (
                <button
                  onClick={() => setSelectedCategorySlug('all')}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-[#6B0D2F] hover:text-[#540924] transition-colors self-start sm:self-auto"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Filter (Show All 14 Categories)</span>
                </button>
              )}
            </div>

            {/* Active Category Information Card when filtered */}
            {activeCategory && (
              <div className="mb-8 p-5 sm:p-6 rounded-2xl bg-white border border-[#D4AF37]/40 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#6B0D2F] text-[#D4AF37] flex items-center justify-center flex-shrink-0 font-serif font-bold text-lg">
                    🥻
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif text-base font-semibold text-[#1A1315]">
                        About {activeCategory.name}
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
                    Authentic Weave
                  </span>
                  <span>{activeCategory.itemCountLabel}</span>
                </div>
              </div>
            )}

            {/* Product Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
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
                  New collections for this saree craft are being updated in the catalogue.
                </p>
                <button
                  onClick={() => setSelectedCategorySlug('all')}
                  className="px-5 py-2.5 bg-[#6B0D2F] text-white text-xs font-semibold rounded-full hover:bg-[#540924] transition-colors"
                >
                  View All Saree Categories
                </button>
              </div>
            )}
          </Container>
        </section>

        {/* Store Trust / Assistance Info Banner */}
        <section className="py-12 bg-white border-t border-[#D4AF37]/30">
          <Container>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
              <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#D4AF37]/20 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#6B0D2F]/10 text-[#6B0D2F] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif text-sm font-semibold text-[#1A1315]">
                    14 Saree Weaving Categories
                  </h4>
                  <p className="text-xs text-[#6E676A] mt-0.5">
                    Carefully curated regional weaves from Bengal Tants to pure Tassar & Baluchari silks.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#D4AF37]/20 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#6B0D2F]/10 text-[#6B0D2F] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif text-sm font-semibold text-[#1A1315]">
                    Authentic Fabric Quality
                  </h4>
                  <p className="text-xs text-[#6E676A] mt-0.5">
                    Tested texture, genuine craftsmanship, and exact fabric descriptions for each piece.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#D4AF37]/20 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#6B0D2F]/10 text-[#6B0D2F] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <ArrowRight className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif text-sm font-semibold text-[#1A1315]">
                    In-Store & Online Enquiries
                  </h4>
                  <p className="text-xs text-[#6E676A] mt-0.5">
                    Visit our main store or contact us directly for specific saree requests and draping advice.
                  </p>
                </div>
              </div>
            </div>
          </Container>
        </section>
      </main>

      {/* Footer */}
      <Footer />

      {/* Global Interactive Drawers */}
      <CartDrawer />
      <QuickViewModal />
      <ToastNotification />
    </div>
  );
}

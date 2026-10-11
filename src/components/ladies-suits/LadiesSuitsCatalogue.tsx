'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/ui/CartDrawer';
import ToastNotification from '@/components/ui/ToastNotification';
import Container from '@/components/ui/Container';
import ProductCard from '@/components/product/ProductCard';
import { LADIES_SUIT_CATEGORIES, LADIES_SUIT_PRODUCTS, LadiesSuitCategory } from '@/data/ladiesSuitsData';
import { ChevronRight, Check, ArrowRight, RotateCcw, LayoutGrid, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

import CategoryChips from '@/components/common/CategoryChips';
import { ProductItem } from '@/types/product';
import { StaggerGrid, StaggerCard } from '@/components/ui/motion';

interface LadiesSuitsCatalogueProps {
  initialCategorySlug?: string;
  initialProducts?: ProductItem[];
}

export default function LadiesSuitsCatalogue({ initialCategorySlug, initialProducts = [] }: LadiesSuitsCatalogueProps) {
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>(initialCategorySlug || 'all');

  const PAGE_SIZE = 12;
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);

  // Sync state if initialCategorySlug prop changes and smoothly scroll to products
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
    const newUrl = slug === 'all' ? '/ladies-suits' : `/ladies-suits/${slug}`;
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

  // Active category metadata if filtered
  const activeCategory: LadiesSuitCategory | undefined = useMemo(() => {
    if (selectedCategorySlug === 'all') return undefined;
    return LADIES_SUIT_CATEGORIES.find((cat) => cat.slug === selectedCategorySlug);
  }, [selectedCategorySlug]);

  // Filter products based on selected category from real database records
  const filteredProducts = useMemo(() => {
    if (selectedCategorySlug === 'all') {
      return initialProducts;
    }
    return initialProducts.filter((prod) => prod.categorySlug === selectedCategorySlug);
  }, [selectedCategorySlug, initialProducts]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [selectedCategorySlug]);

  const visibleProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount);
  }, [filteredProducts, visibleCount]);

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
                className={`hover:text-[#6B0D2F] transition-colors ${selectedCategorySlug === 'all' ? 'text-[#6B0D2F] font-semibold' : ''
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
                <span className="text-[11px] uppercase tracking-widest font-semibold">
                  Department 02 &bull; Ethnic Suits &amp; Sets
                </span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#1A1315] font-normal leading-tight">
                {activeCategory ? activeCategory.name : 'Ladies Suits Collection'}
              </h1>

              <p className="text-xs sm:text-sm text-[#6E676A] leading-relaxed">
                {activeCategory
                  ? activeCategory.shortDescription
                  : 'Explore unstitched suit materials and salwar sets in pure cotton batik, authentic Punjabi Phulkari silk embroidery, and daily printed cotton fabrics.'}
              </p>
            </div>
          </Container>
        </section>

        {/* Highlighted Category Navigation Block (CategoryChips) */}
        <CategoryChips
          departmentTitle="Ladies Suits"
          departmentBasePath="/ladies-suits"
          categories={LADIES_SUIT_CATEGORIES}
          activeCategorySlug={selectedCategorySlug}
          allLabel="All Suits"
          allCount={initialProducts.length}
          onSelectCategory={handleCategorySelect}
        />

        {/* Active Filter Status & Product Showcase */}
        <section id="products-section" className="py-10 sm:py-16 scroll-mt-36">
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
                  className="inline-flex items-center gap-2 text-xs font-semibold text-[#6B0D2F] hover:text-[#540924] transition-colors self-start sm:self-auto cursor-pointer"
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
                    👗
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
                  👗
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif text-xl sm:text-2xl text-[#1A1315]">
                    No products available yet
                  </h3>
                  <p className="text-xs sm:text-sm text-[#6E676A] leading-relaxed">
                    {activeCategory
                      ? `We are currently preparing fresh unstitched sets and fabrics for ${activeCategory.name}. Please check back soon or explore our other suit collections.`
                      : 'Our ladies suits collection is currently being prepared with fresh designs. Please check back shortly.'}
                  </p>
                </div>
                {selectedCategorySlug !== 'all' && (
                  <button
                    onClick={() => handleCategorySelect('all')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#6B0D2F] text-white text-xs font-semibold rounded-full hover:bg-[#540924] transition-colors cursor-pointer shadow-sm"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>View All Ladies Suits</span>
                  </button>
                )}
              </div>
            )}
          </Container>
        </section>
      </main>

      {/* Global Drawers & Modals */}
      <CartDrawer />
      <ToastNotification />

      {/* Global Footer */}
      <Footer />
    </div>
  );
}

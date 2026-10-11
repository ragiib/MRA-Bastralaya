'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Container from '@/components/ui/Container';
import { LayoutGrid, ChevronRight } from 'lucide-react';

export interface CategoryChipItem {
  id: string;
  name: string;
  slug: string;
  fabric?: string;
  itemCountLabel?: string;
}

export interface CategoryChipsProps {
  departmentTitle: string;
  departmentBasePath: string;
  categories: CategoryChipItem[];
  activeCategorySlug: string;
  allLabel?: string;
  allCount?: number;
  onSelectCategory?: (slug: string) => void;
  className?: string;
}

export default function CategoryChips({
  departmentTitle,
  departmentBasePath,
  categories,
  activeCategorySlug,
  allLabel,
  allCount,
  onSelectCategory,
  className = '',
}: CategoryChipsProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeChipRef = useRef<HTMLAnchorElement>(null);

  // Auto-scroll the active chip into horizontal center view on load/change
  useEffect(() => {
    // Delay slightly so layout and DOM have computed
    const timer = setTimeout(() => {
      try {
        if (activeChipRef.current && scrollContainerRef.current) {
          activeChipRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center',
          });
        }
      } catch {
        // Safe fallback in environments where scrollIntoView is not supported
      }
    }, 60);

    return () => clearTimeout(timer);
  }, [activeCategorySlug]);

  const handleChipClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    slug: string
  ) => {
    // Allow default browser behavior for modifier keys (Ctrl/Cmd/middle-click)
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
      return;
    }

    if (onSelectCategory) {
      e.preventDefault();
      onSelectCategory(slug);
    }
  };

  const isAllActive = activeCategorySlug === 'all';
  const computedAllLabel = allLabel || `All ${departmentTitle}`;
  const totalCount = allCount !== undefined ? allCount : categories.length;

  return (
    <section
      id="shop-by-category-block"
      aria-label={`${departmentTitle} Category Navigation`}
      className={`relative bg-[#FAF7F2] border-y border-[#D4AF37]/35 py-6 sm:py-7 shadow-xs ${className}`}
    >
      <Container>
        {/* Header Block: Title, Subline and Mobile Expand Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-4 sm:mb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-[#6B0D2F] mb-1">
              <span>Shop by Category</span>
              <ChevronRight className="w-3 h-3 text-[#D4AF37]" />
              <span className="text-[#8C827A]">{departmentTitle}</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#1A1315] font-normal leading-tight">
              {departmentTitle} Categories
            </h2>
            <p className="text-xs sm:text-sm text-[#6E676A] mt-1">
              Tap a category to see its products
            </p>
          </div>

          {/* Mobile "View all categories" toggle (shown only on mobile when > 1 category) */}
          {categories.length > 1 && (
            <div className="md:hidden flex items-center self-start sm:self-auto pt-1">
              <button
                type="button"
                onClick={() => setIsExpanded((prev) => !prev)}
                aria-expanded={isExpanded}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold text-[#6B0D2F] bg-white border border-[#D4AF37]/60 shadow-xs hover:bg-[#6B0D2F]/5 active:scale-95 transition-all cursor-pointer"
              >
                <LayoutGrid className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>
                  {isExpanded
                    ? 'Show scroll row'
                    : `View all ${categories.length} categories`}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Desktop View: Wrapped Grid of Pills (all visible without scrolling sideways) */}
        <div className="hidden md:flex flex-wrap gap-2.5 lg:gap-3 items-center">
          {/* "All" Department Chip */}
          <Link
            href={departmentBasePath}
            onClick={(e) => handleChipClick(e, 'all')}
            aria-current={isAllActive ? 'page' : undefined}
            className={`min-h-[44px] h-[44px] px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium uppercase tracking-wider inline-flex items-center gap-2 transition-all duration-200 cursor-pointer active:scale-95 shrink-0 ${
              isAllActive
                ? 'bg-[#6B0D2F] text-white border-2 border-[#D4AF37] shadow-md ring-2 ring-[#6B0D2F]/20'
                : 'bg-white text-[#6B0D2F] border border-[#D4AF37]/60 hover:bg-[#6B0D2F] hover:text-white hover:border-[#6B0D2F] shadow-xs'
            }`}
          >
            <span>{computedAllLabel}</span>
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                isAllActive
                  ? 'bg-white/20 text-white'
                  : 'bg-[#FAF7F2] text-[#6B0D2F] border border-[#D4AF37]/40'
              }`}
            >
              {totalCount}
            </span>
          </Link>

          {/* Specific Category Chips */}
          {categories.map((cat, idx) => {
            const isSelected = activeCategorySlug === cat.slug;
            return (
              <Link
                key={cat.id || cat.slug}
                href={`${departmentBasePath}/${cat.slug}`}
                onClick={(e) => handleChipClick(e, cat.slug)}
                aria-current={isSelected ? 'page' : undefined}
                className={`min-h-[44px] h-[44px] px-4.5 py-2.5 rounded-full text-xs sm:text-sm font-medium inline-flex items-center gap-2 transition-all duration-200 cursor-pointer active:scale-95 shrink-0 ${
                  isSelected
                    ? 'bg-[#6B0D2F] text-white border-2 border-[#D4AF37] shadow-md ring-2 ring-[#6B0D2F]/20 font-semibold'
                    : 'bg-white text-[#6B0D2F] border border-[#D4AF37]/60 hover:bg-[#6B0D2F] hover:text-white hover:border-[#6B0D2F] shadow-xs'
                }`}
              >
                <span
                  className={`text-[10px] font-mono opacity-70 ${
                    isSelected ? 'text-[#FFF3B0]' : 'text-[#8C827A]'
                  }`}
                >
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <span>{cat.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Mobile View: Either Horizontally Scrollable Row OR Expanded Wrapped Grid */}
        <div className="md:hidden">
          {isExpanded ? (
            /* Mobile Expanded Wrapped Grid (all categories visible without hunting) */
            <div className="flex flex-wrap gap-2 pt-1 animate-fadeIn">
              {/* "All" Chip */}
              <Link
                href={departmentBasePath}
                onClick={(e) => handleChipClick(e, 'all')}
                aria-current={isAllActive ? 'page' : undefined}
                className={`min-h-[44px] h-[44px] px-4 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-1.5 transition-all duration-200 cursor-pointer active:scale-95 ${
                  isAllActive
                    ? 'bg-[#6B0D2F] text-white border-2 border-[#D4AF37] shadow-md'
                    : 'bg-white text-[#6B0D2F] border border-[#D4AF37]/60 shadow-xs'
                }`}
              >
                <span>{computedAllLabel}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    isAllActive
                      ? 'bg-white/20 text-white'
                      : 'bg-[#FAF7F2] text-[#6B0D2F]'
                  }`}
                >
                  {totalCount}
                </span>
              </Link>

              {/* Specific Category Chips */}
              {categories.map((cat, idx) => {
                const isSelected = activeCategorySlug === cat.slug;
                return (
                  <Link
                    key={`exp-${cat.id || cat.slug}`}
                    href={`${departmentBasePath}/${cat.slug}`}
                    onClick={(e) => handleChipClick(e, cat.slug)}
                    aria-current={isSelected ? 'page' : undefined}
                    className={`min-h-[44px] h-[44px] px-3.5 py-2.5 rounded-full text-xs font-medium inline-flex items-center gap-1.5 transition-all duration-200 cursor-pointer active:scale-95 ${
                      isSelected
                        ? 'bg-[#6B0D2F] text-white border-2 border-[#D4AF37] shadow-md font-semibold'
                        : 'bg-white text-[#6B0D2F] border border-[#D4AF37]/60 shadow-xs'
                    }`}
                  >
                    <span
                      className={`text-[9px] font-mono opacity-70 ${
                        isSelected ? 'text-[#FFF3B0]' : 'text-[#8C827A]'
                      }`}
                    >
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span>{cat.name}</span>
                  </Link>
                );
              })}
            </div>
          ) : (
            /* Mobile Horizontally Scrollable Row with Visible Edge Fade & Partial Chip Peek */
            <div className="relative max-w-full">
              <div
                ref={scrollContainerRef}
                className="flex items-center gap-2.5 overflow-x-auto scrollbar-none py-1.5 pr-10 pe-12 scroll-smooth"
                style={{ WebkitOverflowScrolling: 'touch' }}
              >
                {/* "All" Chip */}
                <Link
                  ref={isAllActive ? activeChipRef : undefined}
                  href={departmentBasePath}
                  onClick={(e) => handleChipClick(e, 'all')}
                  aria-current={isAllActive ? 'page' : undefined}
                  className={`min-h-[44px] h-[44px] px-4.5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-1.5 transition-all duration-200 cursor-pointer active:scale-95 shrink-0 ${
                    isAllActive
                      ? 'bg-[#6B0D2F] text-white border-2 border-[#D4AF37] shadow-md ring-1 ring-[#6B0D2F]/20'
                      : 'bg-white text-[#6B0D2F] border border-[#D4AF37]/60 hover:bg-[#6B0D2F] hover:text-white shadow-xs'
                  }`}
                >
                  <span>{computedAllLabel}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      isAllActive
                        ? 'bg-white/20 text-white'
                        : 'bg-[#FAF7F2] text-[#6B0D2F] border border-[#D4AF37]/30'
                    }`}
                  >
                    {totalCount}
                  </span>
                </Link>

                {/* Specific Category Chips */}
                {categories.map((cat, idx) => {
                  const isSelected = activeCategorySlug === cat.slug;
                  return (
                    <Link
                      key={`scroll-${cat.id || cat.slug}`}
                      ref={isSelected ? activeChipRef : undefined}
                      href={`${departmentBasePath}/${cat.slug}`}
                      onClick={(e) => handleChipClick(e, cat.slug)}
                      aria-current={isSelected ? 'page' : undefined}
                      className={`min-h-[44px] h-[44px] px-4 py-2.5 rounded-full text-xs font-medium whitespace-nowrap inline-flex items-center gap-2 transition-all duration-200 cursor-pointer active:scale-95 shrink-0 ${
                        isSelected
                          ? 'bg-[#6B0D2F] text-white border-2 border-[#D4AF37] shadow-md ring-1 ring-[#6B0D2F]/20 font-semibold'
                          : 'bg-white text-[#6B0D2F] border border-[#D4AF37]/60 hover:bg-[#6B0D2F] hover:text-white shadow-xs'
                      }`}
                    >
                      <span
                        className={`text-[10px] font-mono opacity-70 ${
                          isSelected ? 'text-[#FFF3B0]' : 'text-[#8C827A]'
                        }`}
                      >
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <span>{cat.name}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Visual Edge Fade indicating horizontal scroll availability */}
              <div
                className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#FAF7F2] to-transparent"
                aria-hidden="true"
              />
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}

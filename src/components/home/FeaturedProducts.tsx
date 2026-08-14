'use client';

import React, { useState } from 'react';
import Container from '../ui/Container';
import SectionHeading from '../ui/SectionHeading';
import ProductCard from '../product/ProductCard';
import { PRODUCTS } from '@/data/mockData';
import Button from '../ui/Button';
import { ArrowRight } from 'lucide-react';

export default function FeaturedProducts() {
  const [selectedFilter, setSelectedFilter] = useState('All');

  const filterOptions = [
    'All',
    'Kanjeevaram Silk',
    'Banarasi Brocade',
    'Pure Silk Collection',
    'Chanderi & Cotton',
    'Wedding Bridal Suite',
  ];

  const filteredProducts = selectedFilter === 'All'
    ? PRODUCTS
    : PRODUCTS.filter(p => p.category === selectedFilter);

  return (
    <section id="featured" className="py-16 md:py-24 bg-white border-y border-[#D4AF37]/30">
      <Container>
        <SectionHeading
          subtitle="Artisan Showcase"
          title="Featured Handloom Creations"
        />

        {/* Filter Pill Buttons */}
        <div className="flex items-center justify-start md:justify-center gap-2 overflow-x-auto pb-4 mb-10 scrollbar-none">
          {filterOptions.map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-5 py-2.5 rounded-full text-xs font-medium uppercase tracking-wider whitespace-nowrap transition-all duration-300 ${
                selectedFilter === filter
                  ? 'bg-[#6B0D2F] text-white shadow-md shadow-[#6B0D2F]/20'
                  : 'bg-[#FAF7F2] text-[#1A1315] hover:bg-[#F3ECE2] border border-[#D4AF37]/30'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <Button variant="outline" size="lg">
            View Complete 2026 Catalogue <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </Container>
    </section>
  );
}

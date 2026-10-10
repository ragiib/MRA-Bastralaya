import React from 'react';
import { ProductItem } from '@/types/product';
import ProductCard from '../product/ProductCard';
import Container from '../ui/Container';
import { AlponaBorder } from './FestiveIcons';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { FESTIVAL_CONFIG } from '@/config/festival';

interface PujaSpecialSectionProps {
  products: ProductItem[];
}

export default function PujaSpecialSection({ products }: PujaSpecialSectionProps) {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="py-12 md:py-16 bg-white border-b border-[#D4AF37]/30 relative overflow-hidden">
      {/* Decorative Alpona Line */}
      <div className="max-w-xl mx-auto mb-6 opacity-60" aria-hidden="true">
        <AlponaBorder className="w-full h-3" />
      </div>

      <Container>
        {/* Clean Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-[#1A1315] font-normal tracking-wide">
            Puja Special Collection
          </h2>
        </div>

        {/* 4-Column Responsive Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} priority={index < 4} />
          ))}
        </div>

        {/* Bottom CTA Button */}
        <div className="mt-10 text-center">
          <Link
            href={FESTIVAL_CONFIG.ctaHref}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#6B0D2F] hover:bg-[#8B1E43] text-white font-serif text-xs font-semibold uppercase tracking-wider shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer group"
          >
            <span>{FESTIVAL_CONFIG.ctaLabel}</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </Container>
    </section>
  );
}

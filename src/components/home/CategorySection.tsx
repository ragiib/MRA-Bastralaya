import React from 'react';
import Container from '../ui/Container';
import SectionHeading from '../ui/SectionHeading';
import { CATEGORIES } from '@/data/mockData';
import Badge from '../ui/Badge';
import { ArrowUpRight } from 'lucide-react';

export default function CategorySection() {
  return (
    <section id="categories" className="py-16 md:py-24 bg-[#FAF7F2]">
      <Container>
        <SectionHeading
          subtitle="Handcrafted Collections"
          title="Curated Saree Collections"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {CATEGORIES.map((cat) => (
            <a
              key={cat.id}
              href={`#${cat.slug}`}
              className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 bg-white border border-[#D4AF37]/30 flex flex-col h-96"
            >
              {/* Category Image */}
              <div className="relative flex-1 overflow-hidden">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                {/* Tag Badge */}
                {cat.tag && (
                  <div className="absolute top-4 left-4 z-10">
                    <Badge variant="gold">{cat.tag}</Badge>
                  </div>
                )}

                {/* Arrow Icon */}
                <div className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/20 backdrop-blur-md group-hover:bg-[#6B0D2F] text-white flex items-center justify-center transition-colors">
                  <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>

                {/* Text Content inside Card */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-10">
                  <span className="text-[11px] uppercase tracking-widest text-[#D4AF37] font-semibold">
                    {cat.itemCount}
                  </span>

                  <h3 className="font-serif text-2xl font-normal text-white mt-1 mb-2 group-hover:text-[#FFF3B0] transition-colors">
                    {cat.name}
                  </h3>

                  <p className="text-xs text-gray-200 line-clamp-2 leading-relaxed opacity-90">
                    {cat.description}
                  </p>
                </div>
              </div>
            </a>
          ))}
        </div>
      </Container>
    </section>
  );
}

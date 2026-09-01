import React from 'react';
import Container from '../ui/Container';
import SectionHeading from '../ui/SectionHeading';
import { MAIN_DEPARTMENTS } from '@/data/mockData';
import Badge from '../ui/Badge';
import { ArrowRight } from 'lucide-react';

export default function CategorySection() {
  return (
    <section id="departments" className="py-16 md:py-24 bg-[#FAF7F2] scroll-mt-20">
      <Container>
        <SectionHeading
          subtitle="Shop By Department"
          title="Three Main Collections"
        />

        {/* Balanced 3-Column Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {MAIN_DEPARTMENTS.map((dept, index) => (
            <div
              key={dept.id}
              id={dept.slug}
              className="scroll-mt-24 group relative rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 bg-[#1A1315] border border-[#D4AF37]/40 flex flex-col h-[460px] sm:h-[520px]"
            >
              {/* Department Photography */}
              <div className="relative w-full h-full overflow-hidden">
                <img
                  src={dept.image}
                  alt={`MRA Bastralaya - ${dept.name}`}
                  className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
                />

                {/* Elegant Dark Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/10" />

                {/* Department Index Tag */}
                <div className="absolute top-5 left-5 z-10">
                  <Badge variant="gold" className="text-[10px] tracking-wider uppercase shadow-md backdrop-blur-md">
                    {dept.tag || `Department 0${index + 1}`}
                  </Badge>
                </div>

                {/* Text Content and Call to Action */}
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 text-white z-10 space-y-3">
                  <h3 className="font-serif text-2xl sm:text-3xl font-normal text-white group-hover:text-[#FFF3B0] transition-colors tracking-wide">
                    {dept.name}
                  </h3>

                  <p className="text-xs sm:text-sm text-gray-200 leading-relaxed opacity-90 line-clamp-3">
                    {dept.description}
                  </p>

                  {/* Primary CTA Button */}
                  <div className="pt-2">
                    <a
                      href={
                        dept.slug === 'sarees'
                          ? '/sarees'
                          : dept.slug === 'ladies-suits'
                          ? '/ladies-suits'
                          : `#${dept.slug}`
                      }
                      className="inline-flex items-center justify-between w-full px-5 py-3 rounded-full bg-[#FAF7F2]/90 hover:bg-[#6B0D2F] text-[#1A1315] hover:text-white font-medium text-xs uppercase tracking-wider backdrop-blur-sm border border-[#D4AF37]/50 shadow-md group-hover:border-[#D4AF37] transition-all duration-300 active:scale-[0.98]"
                      aria-label={`Explore ${dept.name} Collection`}
                    >
                      <span>Explore Collection</span>
                      <ArrowRight className="w-4 h-4 text-[#6B0D2F] group-hover:text-[#D4AF37] group-hover:translate-x-1 transition-all" />
                    </a>
                  </div>

                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}


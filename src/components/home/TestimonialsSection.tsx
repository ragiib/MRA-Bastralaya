import React from 'react';
import Container from '../ui/Container';
import SectionHeading from '../ui/SectionHeading';
import { TESTIMONIALS } from '@/data/mockData';
import { Star, Quote, CheckCircle } from 'lucide-react';

export default function TestimonialsSection() {
  return (
    <section id="reviews" className="py-16 md:py-24 bg-white border-t border-[#D4AF37]/30">
      <Container>
        <SectionHeading
          subtitle="Customer Experiences"
          title="Loved by Saree Enthusiasts Across India"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.id}
              className="p-8 rounded-2xl bg-[#FAF7F2] border border-[#D4AF37]/30 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-6 relative"
            >
              <Quote className="w-10 h-10 text-[#D4AF37]/30 absolute top-6 right-6" />

              <div className="space-y-4">
                {/* Rating */}
                <div className="flex text-[#D4AF37]">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#D4AF37]" />
                  ))}
                </div>

                <p className="text-xs sm:text-sm text-[#1A1315] italic leading-relaxed">
                  "{t.comment}"
                </p>
              </div>

              {/* Author */}
              <div className="flex items-center gap-4 pt-4 border-t border-[#D4AF37]/20">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-11 h-11 rounded-full object-cover border border-[#D4AF37]"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-serif text-sm font-semibold text-[#1A1315]">{t.name}</h4>
                    {t.verified && (
                      <span title="Verified Purchaser">
                        <CheckCircle className="w-3.5 h-3.5 text-[#6B0D2F] fill-[#6B0D2F]/10" />
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#6E676A]">{t.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

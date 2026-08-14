import React from 'react';
import Container from '../ui/Container';
import Button from '../ui/Button';
import { ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import { BRAND_STATS } from '@/data/mockData';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#FAF7F2] py-12 md:py-20 lg:py-24 border-b border-[#D4AF37]/30">
      {/* Background Decorative Gradient Light */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl -z-0 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#6B0D2F]/5 rounded-full blur-3xl -z-0 pointer-events-none" />

      <Container className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Text Content */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#6B0D2F]/10 border border-[#6B0D2F]/20 text-[#6B0D2F]">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-xs uppercase tracking-widest font-semibold">
                Authentic Indian Handloom Legacy
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#1A1315] font-normal leading-[1.15] tracking-wide">
              Elevate Your Elegance with <span className="shimmer-gold font-normal">Authentic Silk Sarees</span>
            </h1>

            <p className="text-sm sm:text-base text-[#6E676A] leading-relaxed max-w-xl mx-auto lg:mx-0">
              Immerse yourself in handcrafted Kanjeevaram pure silk, Banarasi zari brocades, and timeless wedding collections—woven with devotion by master artisans across India.
            </p>

            {/* Call to Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Button variant="primary" size="lg" className="w-full sm:w-auto">
                Explore Silk Collection <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Bridal Suite 2026
              </Button>
            </div>

            {/* Highlights Bar */}
            <div className="pt-6 border-t border-[#D4AF37]/30 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {BRAND_STATS.map((stat, i) => (
                <div key={i} className="text-center lg:text-left">
                  <div className="font-serif text-xl sm:text-2xl font-bold text-[#6B0D2F]">
                    {stat.value}
                  </div>
                  <div className="text-[11px] uppercase tracking-wider text-[#6E676A] mt-0.5">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Hero Visual Photography */}
          <div className="lg:col-span-6">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Outer Golden Border Layer */}
              <div className="absolute -inset-3 rounded-3xl border border-[#D4AF37]/40 translate-x-2 translate-y-2 -z-10" />

              {/* Main Image Frame */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-white aspect-[4/5] sm:aspect-[16/11] lg:aspect-[4/5]">
                <img
                  src="/images/hero_saree_banner.jpg"
                  alt="MRA Bastralaya Royal Kanjeevaram Silk Saree"
                  className="w-full h-full object-cover"
                />

                {/* Floating Badge Overlay */}
                <div className="absolute bottom-6 left-6 right-6 p-4 bg-[#FAF7F2]/90 backdrop-blur-md rounded-xl border border-[#D4AF37]/40 shadow-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#6B0D2F] text-[#D4AF37] flex items-center justify-center font-serif text-lg font-bold">
                      MRA
                    </div>
                    <div>
                      <h4 className="font-serif text-sm font-semibold text-[#1A1315]">Royal Kanjeevaram Silk</h4>
                      <p className="text-[11px] text-[#6E676A]">Pure Mulberry Silk & Gold Zari</p>
                    </div>
                  </div>
                  <div className="flex items-center text-xs font-bold text-[#6B0D2F]">
                    <ShieldCheck className="w-4 h-4 text-[#D4AF37] mr-1" /> Certified
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

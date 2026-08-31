import React from 'react';
import Container from '../ui/Container';
import Button from '../ui/Button';
import { ArrowRight, Sparkles, Store } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#FAF7F2] py-12 md:py-18 lg:py-20 border-b border-[#D4AF37]/30">
      {/* Background Decorative Ambient Light */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl -z-0 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#6B0D2F]/5 rounded-full blur-3xl -z-0 pointer-events-none" />

      <Container className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Text Content */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#6B0D2F]/10 border border-[#6B0D2F]/20 text-[#6B0D2F]">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-xs uppercase tracking-widest font-semibold">
                Indian Textiles & Apparel
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#1A1315] font-normal leading-[1.18] tracking-wide">
              Timeless Indian Elegance in <span className="shimmer-gold font-normal">Sarees, Suits & Bed Linen</span>
            </h1>

            <p className="text-sm sm:text-base text-[#6E676A] leading-relaxed max-w-xl mx-auto lg:mx-0">
              Welcome to MRA Bastralaya — your destination for handpicked Indian textiles. Explore our three primary departments: classic Sarees, elegant Ladies Suits, and premium pure cotton Bed Sheets crafted for comfort and festive grace.
            </p>

            {/* Department Quick Filter / Highlights */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-1 text-xs">
              <a
                href="/sarees"
                className="px-3.5 py-1.5 rounded-full bg-white border border-[#D4AF37]/40 text-[#1A1315] hover:bg-[#6B0D2F] hover:text-white transition-colors font-medium shadow-xs"
              >
                🥻 Sarees
              </a>

              <a
                href="#ladies-suits"
                className="px-3.5 py-1.5 rounded-full bg-white border border-[#D4AF37]/40 text-[#1A1315] hover:bg-[#6B0D2F] hover:text-white transition-colors font-medium shadow-xs"
              >
                👗 Ladies Suits
              </a>
              <a
                href="#bed-sheets"
                className="px-3.5 py-1.5 rounded-full bg-white border border-[#D4AF37]/40 text-[#1A1315] hover:bg-[#6B0D2F] hover:text-white transition-colors font-medium shadow-xs"
              >
                🛏️ Bed Sheets
              </a>
            </div>

            {/* Call to Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <a href="#departments" className="w-full sm:w-auto">
                <Button variant="primary" size="lg" className="w-full sm:w-auto">
                  Explore Departments <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </a>

              <a href="#about" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  About Our Store
                </Button>
              </a>
            </div>
          </div>

          {/* Right Column: Hero Visual Photography */}
          <div className="lg:col-span-6">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Outer Golden Border Layer */}
              <div className="absolute -inset-3 rounded-3xl border border-[#D4AF37]/40 translate-x-2 translate-y-2 -z-10" />

              {/* Main Image Frame */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-white aspect-[4/3] sm:aspect-[16/11] lg:aspect-[4/3]">
                <img
                  src="/images/hero_textile_store.jpg"
                  alt="MRA Bastralaya Indian Textile & Apparel Collection"
                  className="w-full h-full object-cover"
                />

                {/* Floating Store Badge Overlay */}
                <div className="absolute bottom-5 left-5 right-5 p-4 bg-[#FAF7F2]/95 backdrop-blur-md rounded-xl border border-[#D4AF37]/40 shadow-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#6B0D2F] text-[#D4AF37] flex items-center justify-center font-serif text-lg font-bold flex-shrink-0">
                      MRA
                    </div>
                    <div>
                      <h4 className="font-serif text-sm font-semibold text-[#1A1315]">MRA Bastralaya</h4>
                      <p className="text-[11px] text-[#6E676A]">Sarees · Ladies Suits · Bed Sheets</p>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center text-xs font-semibold text-[#6B0D2F]">
                    <Store className="w-4 h-4 text-[#D4AF37] mr-1" /> Complete Store
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


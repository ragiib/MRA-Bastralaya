import React from 'react';
import Container from '../ui/Container';
import { Sparkles, ShoppingBag, HeartHandshake } from 'lucide-react';

export default function StoreIntro() {
  return (
    <section id="about" className="py-16 md:py-24 bg-white border-y border-[#D4AF37]/30 scroll-mt-16">
      <Container>
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#6B0D2F]/10 border border-[#6B0D2F]/20 text-[#6B0D2F]">
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-xs uppercase tracking-widest font-semibold">
              About MRA Bastralaya
            </span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#1A1315] font-normal leading-snug">
            A Complete Indian Textile & Fashion Destination
          </h2>

          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto" />

          <p className="text-sm sm:text-base text-[#6E676A] leading-relaxed max-w-3xl mx-auto">
            At MRA Bastralaya, we take pride in presenting a thoughtfully selected range of traditional and modern textiles. Whether you are seeking the grace of an authentic Indian saree, the comfort and style of a tailored ladies suit, or the everyday luxury of pure cotton bed sheets, our store offers quality fabric and reliable service for your entire family.
          </p>

          {/* Three Core Store Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 text-left">
            <div className="p-6 rounded-2xl bg-[#FAF7F2] border border-[#D4AF37]/30 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#6B0D2F] text-[#D4AF37] flex items-center justify-center">
                <span className="font-serif font-bold text-sm">01</span>
              </div>
              <h3 className="font-serif text-lg font-medium text-[#1A1315]">
                Sarees for Every Moment
              </h3>
              <p className="text-xs text-[#6E676A] leading-relaxed">
                From festive celebrations to daily traditional wear, explore an extensive variety of fabrics and patterns.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FAF7F2] border border-[#D4AF37]/30 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#6B0D2F] text-[#D4AF37] flex items-center justify-center">
                <span className="font-serif font-bold text-sm">02</span>
              </div>
              <h3 className="font-serif text-lg font-medium text-[#1A1315]">
                Ladies Suits & Dress Material
              </h3>
              <p className="text-xs text-[#6E676A] leading-relaxed">
                Comfortable, stylish unstitched materials and ready ethnic suit sets designed for modern elegance.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FAF7F2] border border-[#D4AF37]/30 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#6B0D2F] text-[#D4AF37] flex items-center justify-center">
                <span className="font-serif font-bold text-sm">03</span>
              </div>
              <h3 className="font-serif text-lg font-medium text-[#1A1315]">
                Bed Sheets & Home Linen
              </h3>
              <p className="text-xs text-[#6E676A] leading-relaxed">
                Breathable pure cotton bed sheets and traditional prints crafted for restful everyday comfort.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

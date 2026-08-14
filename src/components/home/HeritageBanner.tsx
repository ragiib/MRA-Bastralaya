import React from 'react';
import Container from '../ui/Container';
import Button from '../ui/Button';
import { Award, Sparkles } from 'lucide-react';

export default function HeritageBanner() {
  return (
    <section className="relative py-20 bg-[#6B0D2F] text-white overflow-hidden">
      {/* Decorative Gold Motif Background Graphic */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      <Container className="relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40">
            <Award className="w-4 h-4" />
            <span className="text-xs uppercase tracking-widest font-semibold">
              Master Weaver Guild Direct
            </span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal leading-tight">
            Every Thread Tells a Story of <span className="text-[#D4AF37]">Royal Indian Heritage</span>
          </h2>

          <p className="text-sm sm:text-base text-gray-200 leading-relaxed font-light">
            Our master artisans in Kanchipuram and Varanasi spend up to 45 days meticulously hand-weaving a single silk saree. When you choose MRA Bastralaya, you take home authentic craftsmanship certified by Silk Mark India.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="gold" size="lg">
              Discover Handloom Legacy <Sparkles className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}

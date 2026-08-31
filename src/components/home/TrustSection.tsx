import React from 'react';
import Container from '../ui/Container';
import SectionHeading from '../ui/SectionHeading';
import { STORE_SERVICES } from '@/data/mockData';
import { Sparkles, Layers, Headphones, PackageCheck } from 'lucide-react';

export default function TrustSection() {
  const icons = [Sparkles, Layers, Headphones, PackageCheck];

  return (
    <section id="services" className="py-16 md:py-24 bg-[#FAF7F2] scroll-mt-16">
      <Container>
        <SectionHeading
          subtitle="Our Store Commitment"
          title="Why Shop With MRA Bastralaya"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {STORE_SERVICES.map((service, index) => {
            const Icon = icons[index % icons.length];
            return (
              <div
                key={index}
                className="p-8 rounded-2xl bg-white border border-[#D4AF37]/30 shadow-xs hover:shadow-lg transition-all duration-300 space-y-4 group"
              >
                <div className="w-13 h-13 rounded-2xl bg-[#6B0D2F]/10 text-[#6B0D2F] group-hover:bg-[#6B0D2F] group-hover:text-[#D4AF37] flex items-center justify-center transition-colors duration-300">
                  <Icon className="w-6 h-6 stroke-1.5" />
                </div>
                <h3 className="font-serif text-lg font-medium text-[#1A1315]">
                  {service.title}
                </h3>
                <p className="text-xs text-[#6E676A] leading-relaxed">
                  {service.description}
                </p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

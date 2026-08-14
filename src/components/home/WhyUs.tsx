import React from 'react';
import Container from '../ui/Container';
import SectionHeading from '../ui/SectionHeading';
import { ShieldCheck, Truck, RefreshCw, Scissors, Video, Sparkles } from 'lucide-react';

export default function WhyUs() {
  const features = [
    {
      icon: ShieldCheck,
      title: 'Silk Mark Certified',
      description: 'Guaranteed 100% pure mulberry and tussar silk authenticity with govt certified silk mark tag.',
    },
    {
      icon: Truck,
      title: 'Insured Express Shipping',
      description: 'Free pan-India shipping with secure transit insurance directly to your home.',
    },
    {
      icon: RefreshCw,
      title: '7-Day Easy Returns',
      description: 'Hassle-free return policy if the saree does not match your exact expectation.',
    },
    {
      icon: Video,
      title: 'Live Video Call Preview',
      description: 'Inspect sarees in real-time video call with our saree drapers before placing order.',
    },
    {
      icon: Scissors,
      title: 'Custom Blouse Tailoring',
      description: 'Get matching unstitched blouse tailored to your exact measurements by expert masters.',
    },
    {
      icon: Sparkles,
      title: 'Heritage Craftsmanship',
      description: 'Supporting over 1,200 traditional weaver families in Kanchipuram & Varanasi.',
    },
  ];

  return (
    <section id="why-us" className="py-16 md:py-24 bg-[#FAF7F2]">
      <Container>
        <SectionHeading
          subtitle="Our Promise to You"
          title="Why Choose MRA Bastralaya"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <div
                key={index}
                className="p-8 rounded-2xl bg-white border border-[#D4AF37]/30 shadow-xs hover:shadow-lg transition-all duration-300 space-y-4 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#6B0D2F]/10 text-[#6B0D2F] group-hover:bg-[#6B0D2F] group-hover:text-[#D4AF37] flex items-center justify-center transition-colors duration-300">
                  <Icon className="w-7 h-7 stroke-1.5" />
                </div>
                <h3 className="font-serif text-xl font-medium text-[#1A1315]">
                  {feat.title}
                </h3>
                <p className="text-xs text-[#6E676A] leading-relaxed">
                  {feat.description}
                </p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

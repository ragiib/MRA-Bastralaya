'use client';

import React, { useState } from 'react';
import Container from '../ui/Container';
import Button from '../ui/Button';
import { Mail, CheckCircle2 } from 'lucide-react';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
    }
  };

  return (
    <section className="py-16 bg-[#FAF7F2] border-t border-[#D4AF37]/30">
      <Container>
        <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-br from-[#FAF7F2] to-[#F3ECE2] border-2 border-[#D4AF37]/40 p-8 sm:p-12 text-center shadow-xl relative overflow-hidden">
          {/* Subtle gold accent circle */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#D4AF37]/10 rounded-full blur-2xl pointer-events-none" />

          <div className="max-w-xl mx-auto space-y-4">
            <span className="text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-bold">
              Exclusive Privilege
            </span>

            <h2 className="font-serif text-2xl sm:text-3xl text-[#1A1315]">
              Join the MRA Bastralaya Club
            </h2>

            <p className="text-xs sm:text-sm text-[#6E676A] leading-relaxed">
              Subscribe to receive preview access to rare limited-edition Kanjeevaram drops, festive collection alerts, and an exclusive 10% welcome coupon.
            </p>

            {subscribed ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200 inline-flex items-center gap-2 text-xs font-semibold">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Thank you! Welcome coupon code <span className="font-mono bg-white px-2 py-0.5 rounded border">WELCOME10</span> has been sent to your email.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-2">
                <div className="relative flex-1">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-4 top-3.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address..."
                    required
                    className="w-full bg-white text-xs py-3.5 pl-11 pr-4 rounded-full border border-[#D4AF37]/50 focus:outline-none focus:border-[#6B0D2F] shadow-xs text-[#1A1315]"
                  />
                </div>
                <Button variant="primary" size="md" type="submit" className="whitespace-nowrap">
                  Subscribe
                </Button>
              </form>
            )}

            <p className="text-[10px] text-gray-400">We respect your privacy. Unsubscribe anytime.</p>
          </div>
        </div>
      </Container>
    </section>
  );
}

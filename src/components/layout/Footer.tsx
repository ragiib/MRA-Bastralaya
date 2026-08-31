import React from 'react';
import Container from '../ui/Container';
import { MapPin, Phone, Mail, Clock, Sparkles, ShieldCheck, Truck, Globe, Share2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer id="contact" className="bg-[#1A1315] text-[#FAF7F2] pt-16 pb-8 border-t-4 border-[#D4AF37]">
      <Container>
        {/* Top Trust Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-12 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#6B0D2F] text-[#D4AF37] flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif text-sm font-semibold text-white">Quality Selection</h4>
              <p className="text-xs text-gray-400">Handpicked fabrics & finishes</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#6B0D2F] text-[#D4AF37] flex items-center justify-center flex-shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif text-sm font-semibold text-white">Careful Shipping</h4>
              <p className="text-xs text-gray-400">Secure packing for every item</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#6B0D2F] text-[#D4AF37] flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif text-sm font-semibold text-white">Honest Pricing</h4>
              <p className="text-xs text-gray-400">Value across all departments</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#6B0D2F] text-[#D4AF37] flex items-center justify-center flex-shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif text-sm font-semibold text-white">Customer Support</h4>
              <p className="text-xs text-gray-400">In-store & remote assistance</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 py-12 border-b border-white/10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-serif text-2xl tracking-widest text-[#D4AF37]">MRA BASTRALAYA</h3>
            <p className="text-xs text-gray-300 leading-relaxed max-w-sm">
              Your destination for fine Indian textiles, ethnic fashion, and home essentials. Offering handpicked collections of Sarees, Ladies Suits, and Pure Cotton Bed Sheets.
            </p>

            <div className="flex items-center gap-4 pt-2">
              <a href="#" className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#D4AF37] hover:text-[#1A1315] flex items-center justify-center transition-colors" title="Social">
                <Globe className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#D4AF37] hover:text-[#1A1315] flex items-center justify-center transition-colors" title="Share">
                <Share2 className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Departments */}
          <div>
            <h4 className="font-serif text-sm uppercase tracking-widest text-[#D4AF37] font-semibold mb-4">Departments</h4>
            <ul className="space-y-2.5 text-xs text-gray-300">
              <li><a href="#sarees" className="hover:text-[#D4AF37] transition-colors">Sarees Collection</a></li>
              <li><a href="#ladies-suits" className="hover:text-[#D4AF37] transition-colors">Ladies Suits & Sets</a></li>
              <li><a href="#bed-sheets" className="hover:text-[#D4AF37] transition-colors">Pure Cotton Bed Sheets</a></li>
              <li><a href="#departments" className="hover:text-[#D4AF37] transition-colors">All Categories</a></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="font-serif text-sm uppercase tracking-widest text-[#D4AF37] font-semibold mb-4">Customer Care</h4>
            <ul className="space-y-2.5 text-xs text-gray-300">
              <li><a href="#about" className="hover:text-[#D4AF37] transition-colors">About Our Store</a></li>
              <li><a href="#services" className="hover:text-[#D4AF37] transition-colors">Services & Inquiries</a></li>
              <li><a href="#" className="hover:text-[#D4AF37] transition-colors">Fabric Care Guide</a></li>
              <li><a href="#" className="hover:text-[#D4AF37] transition-colors">Shipping & Returns</a></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="font-serif text-sm uppercase tracking-widest text-[#D4AF37] font-semibold mb-4">Store Location</h4>
            <ul className="space-y-3 text-xs text-gray-300">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                <span>MRA Bastralaya Main Showroom, India</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
                <span>Store Support & Inquiries</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
                <span>info@mrabastralaya.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p>© 2026 MRA Bastralaya. All rights reserved. Sarees · Ladies Suits · Bed Sheets.</p>

          <div className="flex items-center gap-3 text-[11px] uppercase tracking-wider text-gray-400">
            <span className="px-2 py-1 bg-white/10 rounded">In-Store</span>
            <span className="px-2 py-1 bg-white/10 rounded">Online Preview</span>
            <span className="px-2 py-1 bg-white/10 rounded">Assistance</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}


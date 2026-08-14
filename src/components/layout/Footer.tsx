import React from 'react';
import Container from '../ui/Container';
import { MapPin, Phone, Mail, Clock, Award, ShieldCheck, Truck, Globe, Share2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#1A1315] text-[#FAF7F2] pt-16 pb-8 border-t-4 border-[#D4AF37]">
      <Container>
        {/* Top Trust Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-12 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#6B0D2F] text-[#D4AF37] flex items-center justify-center flex-shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif text-sm font-semibold text-white">100% Pure Silk Mark</h4>
              <p className="text-xs text-gray-400">Certified authentic silk guarantee</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#6B0D2F] text-[#D4AF37] flex items-center justify-center flex-shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif text-sm font-semibold text-white">Pan-India Express Shipping</h4>
              <p className="text-xs text-gray-400">Insured delivery to your doorstep</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#6B0D2F] text-[#D4AF37] flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif text-sm font-semibold text-white">Weaver Direct Pricing</h4>
              <p className="text-xs text-gray-400">No middlemen, fair pricing</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#6B0D2F] text-[#D4AF37] flex items-center justify-center flex-shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif text-sm font-semibold text-white">Personalized Assistance</h4>
              <p className="text-xs text-gray-400">Video call saree preview available</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 py-12 border-b border-white/10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-serif text-2xl tracking-widest text-[#D4AF37]">MRA BASTRALAYA</h3>
            <p className="text-xs text-gray-300 leading-relaxed max-w-sm">
              Established with a legacy of weaving authentic Indian sarees. We bring handcrafted Kanjeevaram, Banarasi brocades, Paithani, and bridal silk sarees directly from handlooms to your wardrobe.
            </p>

            <div className="flex items-center gap-4 pt-2">
              <a href="#" className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#D4AF37] hover:text-[#1A1315] flex items-center justify-center transition-colors" title="Instagram">
                <Globe className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#D4AF37] hover:text-[#1A1315] flex items-center justify-center transition-colors" title="Share">
                <Share2 className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-sm uppercase tracking-widest text-[#D4AF37] font-semibold mb-4">Collections</h4>
            <ul className="space-y-2.5 text-xs text-gray-300">
              <li><a href="#categories" className="hover:text-[#D4AF37] transition-colors">Kanjeevaram Pure Silk</a></li>
              <li><a href="#categories" className="hover:text-[#D4AF37] transition-colors">Banarasi Brocade</a></li>
              <li><a href="#categories" className="hover:text-[#D4AF37] transition-colors">Paithani Sarees</a></li>
              <li><a href="#categories" className="hover:text-[#D4AF37] transition-colors">Chanderi & Cotton</a></li>
              <li><a href="#categories" className="hover:text-[#D4AF37] transition-colors">Bridal Wedding Suite</a></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="font-serif text-sm uppercase tracking-widest text-[#D4AF37] font-semibold mb-4">Customer Care</h4>
            <ul className="space-y-2.5 text-xs text-gray-300">
              <li><a href="#" className="hover:text-[#D4AF37] transition-colors">Silk Care & Washing Guide</a></li>
              <li><a href="#" className="hover:text-[#D4AF37] transition-colors">Track Your Saree Order</a></li>
              <li><a href="#" className="hover:text-[#D4AF37] transition-colors">Silk Mark Certification</a></li>
              <li><a href="#" className="hover:text-[#D4AF37] transition-colors">Return & Exchange Policy</a></li>
              <li><a href="#" className="hover:text-[#D4AF37] transition-colors">FAQ & Video Shopping</a></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="font-serif text-sm uppercase tracking-widest text-[#D4AF37] font-semibold mb-4">Store Contact</h4>
            <ul className="space-y-3 text-xs text-gray-300">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                <span>MRA Bastralaya Main Showroom, Market Road, India</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
                <span>support@mrabastralaya.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & payment methods */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p>© 2026 MRA Bastralaya. All rights reserved. Craftsmanship & Heritage.</p>

          <div className="flex items-center gap-3 text-[11px] uppercase tracking-wider text-gray-400">
            <span className="px-2 py-1 bg-white/10 rounded">UPI</span>
            <span className="px-2 py-1 bg-white/10 rounded">Visa</span>
            <span className="px-2 py-1 bg-white/10 rounded">Mastercard</span>
            <span className="px-2 py-1 bg-white/10 rounded">NetBanking</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}

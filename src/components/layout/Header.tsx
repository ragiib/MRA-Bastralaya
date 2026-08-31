'use client';

import React, { useState } from 'react';
import { Search, Heart, ShoppingBag, User, Menu, X } from 'lucide-react';
import Container from '../ui/Container';
import { useShop } from '@/context/ShopContext';
import MobileNav from './MobileNav';
import TopAnnouncement from './TopAnnouncement';

export default function Header() {
  const { totalCartCount, wishlistIds, toggleCart } = useShop();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#D4AF37]/30 transition-all">
      <TopAnnouncement />

      <Container>
        <div className="flex items-center justify-between h-20">
          {/* Mobile Hamburger Menu Icon */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden p-2 text-[#1A1315] hover:text-[#6B0D2F] transition-colors"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Brand Logo & Name */}
          <a href="#" className="flex flex-col items-center lg:items-start group">
            <span className="font-serif text-2xl sm:text-3xl tracking-[0.15em] font-normal text-[#1A1315] group-hover:text-[#6B0D2F] transition-colors">
              MRA BASTRALAYA
            </span>
            <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.25em] text-[#D4AF37] font-semibold">
              Textiles & Apparel
            </span>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-7 text-xs uppercase tracking-[0.15em] font-medium text-[#1A1315]">
            <a href="#" className="hover:text-[#6B0D2F] transition-colors py-2 border-b-2 border-transparent hover:border-[#D4AF37]">
              Home
            </a>
            <a href="#sarees" className="hover:text-[#6B0D2F] transition-colors py-2 border-b-2 border-transparent hover:border-[#D4AF37]">
              Sarees
            </a>
            <a href="#ladies-suits" className="hover:text-[#6B0D2F] transition-colors py-2 border-b-2 border-transparent hover:border-[#D4AF37]">
              Ladies Suits
            </a>
            <a href="#bed-sheets" className="hover:text-[#6B0D2F] transition-colors py-2 border-b-2 border-transparent hover:border-[#D4AF37]">
              Bed Sheets
            </a>
            <a href="#about" className="hover:text-[#6B0D2F] transition-colors py-2 border-b-2 border-transparent hover:border-[#D4AF37]">
              About Store
            </a>
            <a href="#services" className="hover:text-[#6B0D2F] transition-colors py-2 border-b-2 border-transparent hover:border-[#D4AF37]">
              Services
            </a>
          </nav>

          {/* Right Utilities (Search, Account, Wishlist, Cart) */}
          <div className="flex items-center space-x-3 sm:space-x-5">
            {/* Search Input toggle */}
            <div className="relative">
              {isSearchOpen ? (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center bg-white shadow-xl rounded-full border border-[#D4AF37] p-1.5 w-64 sm:w-80">
                  <Search className="w-4 h-4 text-gray-400 ml-2" />
                  <input
                    type="text"
                    placeholder="Search Sarees, Ladies Suits, Bed Sheets..."
                    className="w-full bg-transparent text-xs px-2 focus:outline-none text-[#1A1315]"
                    autoFocus
                  />
                  <button onClick={() => setIsSearchOpen(false)} className="p-1 text-gray-400 hover:text-gray-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="p-2 text-[#1A1315] hover:text-[#6B0D2F] transition-colors"
                  aria-label="Search"
                >
                  <Search className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Customer Account Icon */}
            <a
              href="#account"
              className="hidden sm:flex items-center p-2 text-[#1A1315] hover:text-[#6B0D2F] transition-colors"
              aria-label="Customer Account"
              title="Account"
            >
              <User className="w-5 h-5" />
            </a>

            {/* Wishlist Icon + Counter Badge */}
            <a
              href="#wishlist"
              className="relative p-2 text-[#1A1315] hover:text-[#6B0D2F] transition-colors"
              aria-label="Wishlist"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistIds.length > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-[#6B0D2F] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlistIds.length}
                </span>
              )}
            </a>

            {/* Shopping Cart Drawer Trigger */}
            <button
              onClick={() => toggleCart(true)}
              className="relative p-2 bg-[#6B0D2F] text-white hover:bg-[#540924] rounded-full transition-colors shadow-sm flex items-center justify-center"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#D4AF37] text-[#1A1315] text-[11px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                  {totalCartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </Container>

      {/* Smartphone Slide-out Navigation Drawer */}
      <MobileNav
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        wishlistCount={wishlistIds.length}
      />
    </header>
  );
}


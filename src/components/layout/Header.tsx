'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, Heart, ShoppingBag, User, Menu, X, Loader2 } from 'lucide-react';
import Container from '../ui/Container';
import { useShop } from '@/context/ShopContext';
import MobileNav from './MobileNav';
import TopAnnouncement from './TopAnnouncement';
import GuestRegistrationBanner from '../banners/GuestRegistrationBanner';
import EmailVerificationBanner from '../banners/EmailVerificationBanner';
import { ProductItem } from '@/types/product';

export default function Header() {
  const { totalCartCount, wishlistIds, isAuthenticated } = useShop();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ProductItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Debounced search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products/search?q=${encodeURIComponent(searchQuery.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.products || []);
        }
      } catch (err) {
        console.error('Search request failed', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside to close search dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    if (isSearchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSearchOpen]);

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#D4AF37]/30 transition-all">
      <TopAnnouncement />
      <GuestRegistrationBanner />
      <EmailVerificationBanner />

      <Container>
        <div className="flex items-center justify-between h-18 sm:h-20 gap-2 sm:gap-4">
          {/* Mobile Hamburger Menu Icon */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden p-1.5 sm:p-2 text-[#1A1315] hover:text-[#6B0D2F] transition-colors shrink-0 cursor-pointer"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Brand Logo & Name */}
          <Link href="/" className="flex flex-col items-center lg:items-start group min-w-0 py-1">
            <span className="font-serif text-sm sm:text-base lg:text-xl tracking-[0.18em] sm:tracking-[0.22em] font-bold text-[#6B0D2F] group-hover:text-[#8B1E43] transition-colors truncate">
              MRA BASTRALAYA
            </span>
            <span className="text-[7.5px] sm:text-[9px] uppercase tracking-[0.28em] text-[#D4AF37] font-semibold leading-tight">
              Textiles &amp; Apparel
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-7 text-xs uppercase tracking-[0.15em] font-medium text-[#1A1315]">
            <Link href="/" className="hover:text-[#6B0D2F] transition-colors py-2 border-b-2 border-transparent hover:border-[#D4AF37]">
              Home
            </Link>
            <Link href="/sarees" className="hover:text-[#6B0D2F] transition-colors py-2 border-b-2 border-transparent hover:border-[#D4AF37]">
              Sarees
            </Link>
            <Link href="/ladies-suits" className="hover:text-[#6B0D2F] transition-colors py-2 border-b-2 border-transparent hover:border-[#D4AF37]">
              Ladies Suits
            </Link>
            <Link href="/bed-sheets" className="hover:text-[#6B0D2F] transition-colors py-2 border-b-2 border-transparent hover:border-[#D4AF37]">
              Bed Sheets
            </Link>
            <Link href="/#about" className="hover:text-[#6B0D2F] transition-colors py-2 border-b-2 border-transparent hover:border-[#D4AF37]">
              About Store
            </Link>
            <Link href="/#services" className="hover:text-[#6B0D2F] transition-colors py-2 border-b-2 border-transparent hover:border-[#D4AF37]">
              Services
            </Link>
          </nav>

          {/* Right Utilities (Search, Account, Wishlist, Cart) - Always shrink-0 to prevent overflowing off-screen */}
          <div className="flex items-center shrink-0 space-x-1 sm:space-x-3 md:space-x-4">
            {/* Search Input toggle & Dropdown */}
            <div className="relative" ref={searchRef}>
              <button
                onClick={() => setIsSearchOpen((prev) => !prev)}
                className={`p-1.5 sm:p-2 transition-colors cursor-pointer rounded-full ${
                  isSearchOpen ? 'bg-[#6B0D2F]/10 text-[#6B0D2F]' : 'text-[#1A1315] hover:text-[#6B0D2F]'
                }`}
                aria-label="Search Products"
                title="Search Products"
              >
                <Search className="w-5 h-5" />
              </button>

              {isSearchOpen && (
                <div className="fixed sm:absolute top-18 sm:top-full right-2 sm:right-0 mt-2 w-[calc(100vw-16px)] sm:w-96 max-w-md bg-white rounded-2xl shadow-2xl border border-[#D4AF37]/50 p-3 z-50 animate-fadeIn">
                  <div className="relative flex items-center bg-[#FAF7F2] rounded-xl border border-[#D4AF37]/40 px-3 py-2">
                    <Search className="w-4 h-4 text-gray-400 shrink-0 mr-2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search Sarees, Ladies Suits, Bed Sheets..."
                      className="w-full bg-transparent text-xs focus:outline-none text-[#1A1315]"
                      autoFocus
                    />
                    {isSearching ? (
                      <Loader2 className="w-4 h-4 text-[#6B0D2F] animate-spin shrink-0" />
                    ) : searchQuery ? (
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setSearchResults([]);
                        }}
                        className="p-0.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                        aria-label="Clear Search"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => setIsSearchOpen(false)}
                        className="p-0.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                        aria-label="Close Search"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Results Dropdown */}
                  {searchQuery.trim() && (
                    <div className="mt-2.5 max-h-72 overflow-y-auto divide-y divide-gray-100 text-left">
                      {isSearching && searchResults.length === 0 ? (
                        <p className="py-4 text-center text-xs text-[#6E676A]">Searching catalogue...</p>
                      ) : searchResults.length > 0 ? (
                        searchResults.map((item) => {
                          const deptSlug =
                            item.department === 'Sarees'
                              ? 'sarees'
                              : item.department === 'Ladies Suits'
                              ? 'ladies-suits'
                              : 'bed-sheets';
                          const detailUrl = `/${deptSlug}/${item.categorySlug}/${item.id}`;
                          const imageSrc =
                            item.images && item.images.length > 0
                              ? item.images[0]
                              : '/images/placeholder-product.svg';
                          const displayPrice =
                            item.salePrice && item.salePrice < item.price ? item.salePrice : item.price;

                          return (
                            <Link
                              key={item.id}
                              href={detailUrl}
                              onClick={() => {
                                setIsSearchOpen(false);
                                setSearchQuery('');
                              }}
                              className="flex items-center gap-3 p-2 hover:bg-[#FAF7F2] rounded-xl transition-colors group cursor-pointer"
                            >
                              <img
                                src={imageSrc}
                                alt={item.name}
                                className="w-11 h-11 object-cover rounded-lg shrink-0 border border-gray-100"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-[#1A1315] group-hover:text-[#6B0D2F] transition-colors truncate">
                                  {item.name}
                                </p>
                                <p className="text-[10px] text-[#6E676A] uppercase tracking-wider">
                                  {item.department} • {item.category}
                                </p>
                              </div>
                              <span className="text-xs font-semibold text-[#1A1315] shrink-0">
                                ₹{displayPrice.toLocaleString('en-IN')}
                              </span>
                            </Link>
                          );
                        })
                      ) : (
                        <p className="py-4 text-center text-xs text-[#6E676A]">
                          No products found matching &ldquo;{searchQuery}&rdquo;
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Customer Account Icon */}
            <Link
              href={isAuthenticated ? '/account' : '/login'}
              className="relative p-1.5 sm:p-2 text-[#1A1315] hover:text-[#6B0D2F] transition-colors flex items-center justify-center shrink-0 cursor-pointer"
              aria-label={isAuthenticated ? 'Customer Account' : 'Sign In'}
              title={isAuthenticated ? 'My Account' : 'Sign In'}
            >
              <User className="w-5 h-5" />
              {isAuthenticated && (
                <span
                  className="absolute top-1 right-1 w-2 h-2 bg-[#D4AF37] rounded-full ring-2 ring-[#FAF7F2]"
                  title="Signed In"
                />
              )}
            </Link>

            {/* Wishlist Icon + Counter Badge */}
            <Link
              href="/wishlist"
              className="relative p-1.5 sm:p-2 text-[#1A1315] hover:text-[#6B0D2F] transition-colors shrink-0 cursor-pointer"
              aria-label="Wishlist"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistIds.length > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-[#6B0D2F] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlistIds.length}
                </span>
              )}
            </Link>

            {/* Shopping Cart Link - Always shrink-0 to remain 100% visible */}
            <Link
              href="/cart"
              className="relative shrink-0 p-2 sm:p-2.5 bg-[#6B0D2F] text-white hover:bg-[#540924] rounded-full transition-colors shadow-sm flex items-center justify-center cursor-pointer ml-0.5"
              aria-label="Shopping Cart"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#D4AF37] text-[#1A1315] text-[11px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                  {totalCartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </Container>

      {/* Smartphone Slide-out Navigation Drawer */}
      <MobileNav
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        wishlistCount={wishlistIds.length}
        cartCount={totalCartCount}
        isAuthenticated={isAuthenticated}
      />
    </header>
  );
}

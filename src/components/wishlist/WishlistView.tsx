'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useShop } from '@/context/ShopContext';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import { ProductItem } from '@/types/product';
import {
  Heart,
  ShoppingBag,
  Trash2,
  ChevronRight,
  ArrowLeft,
  AlertCircle,
  Sparkles,
  Check,
} from 'lucide-react';

export default function WishlistView() {
  const { wishlistIds, toggleWishlist, addToCart, isAuthenticated } = useShop();
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addingId, setAddingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadWishlistProducts() {
      if (!isAuthenticated) {
        setIsLoading(false);
        setProducts([]);
        return;
      }

      try {
        setIsLoading(true);
        const res = await fetch('/api/wishlist?details=true');
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products || []);
        }
      } catch (err) {
        console.error('Failed to load wishlist products', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadWishlistProducts();
  }, [isAuthenticated, wishlistIds.length]);

  const handleAddToCart = async (product: ProductItem) => {
    setAddingId(product.id);
    try {
      await addToCart(product);
    } finally {
      setTimeout(() => setAddingId(null), 1000);
    }
  };

  const handleRemove = async (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    await toggleWishlist(productId);
  };

  return (
    <div className="bg-[#FAF7F2] min-h-screen py-6 sm:py-10">
      <Container>
        {/* Breadcrumb Navigation */}
        <nav
          className="flex items-center space-x-2 text-xs sm:text-sm text-[#6E676A] mb-6 sm:mb-8"
          aria-label="Breadcrumb"
        >
          <Link href="/" className="hover:text-[#6B0D2F] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span className="text-[#1A1315] font-semibold">Wishlist</span>
        </nav>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-6 border-b border-[#D4AF37]/30 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#6B0D2F]/10 border border-[#6B0D2F]/20 text-[#6B0D2F] text-[11px] font-semibold uppercase tracking-wider mb-2">
              <Heart className="w-3 h-3 text-[#6B0D2F] fill-[#6B0D2F]" />
              <span>Saved Items</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#1A1315] font-normal tracking-wide">
              Your Wishlist
            </h1>
          </div>
          {isAuthenticated && products.length > 0 && (
            <span className="text-xs sm:text-sm text-[#6E676A]">
              {products.length} {products.length === 1 ? 'item saved' : 'items saved'}
            </span>
          )}
        </div>

        {/* Guest View Prompt */}
        {!isAuthenticated ? (
          <div className="bg-white rounded-3xl border border-[#D4AF37]/30 p-8 sm:p-14 text-center max-w-xl mx-auto shadow-xs space-y-5">
            <div className="w-16 h-16 rounded-full bg-[#FAF7F2] border border-[#D4AF37]/40 text-[#6B0D2F] flex items-center justify-center mx-auto">
              <Heart className="w-8 h-8 text-[#6B0D2F]" />
            </div>
            <div className="space-y-2">
              <h2 className="font-serif text-2xl text-[#1A1315]">
                Sign in to View Your Wishlist
              </h2>
              <p className="text-xs sm:text-sm text-[#6E676A] leading-relaxed max-w-md mx-auto">
                Sign in to save handloom sarees, designer ladies suits, and pure cotton bed sheets to your wishlist across all your devices.
              </p>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/login?callbackUrl=/wishlist" className="w-full sm:w-auto">
                <Button variant="primary" size="md" className="w-full sm:w-auto">
                  Sign In to Account
                </Button>
              </Link>
              <Link href="/register?callbackUrl=/wishlist" className="w-full sm:w-auto">
                <Button variant="outline" size="md" className="w-full sm:w-auto">
                  Create New Account
                </Button>
              </Link>
            </div>
          </div>
        ) : isLoading ? (
          <div className="py-20 text-center space-y-3">
            <div className="inline-block w-8 h-8 border-3 border-[#6B0D2F]/30 border-t-[#6B0D2F] rounded-full animate-spin" />
            <p className="text-xs text-[#6E676A] uppercase tracking-wider font-semibold">
              Loading your wishlist...
            </p>
          </div>
        ) : products.length === 0 ? (
          /* Empty Wishlist View */
          <div className="bg-white rounded-3xl border border-[#D4AF37]/30 p-8 sm:p-14 text-center max-w-xl mx-auto shadow-xs space-y-5 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-[#FAF7F2] border border-[#D4AF37]/40 text-[#6B0D2F] flex items-center justify-center mx-auto">
              <Heart className="w-8 h-8 text-[#6B0D2F]/60" />
            </div>
            <div className="space-y-2">
              <h2 className="font-serif text-2xl text-[#1A1315]">
                Your Wishlist is Empty
              </h2>
              <p className="text-xs sm:text-sm text-[#6E676A] leading-relaxed max-w-md mx-auto">
                You haven&apos;t saved any products to your wishlist yet. Tap the heart icon on any product to save it here for easy access.
              </p>
            </div>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link href="/sarees">
                <Button variant="primary" size="md">
                  Explore Sarees
                </Button>
              </Link>
              <Link href="/ladies-suits">
                <Button variant="outline" size="md">
                  Browse Ladies Suits
                </Button>
              </Link>
              <Link href="/bed-sheets">
                <Button variant="outline" size="md">
                  Browse Bed Sheets
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          /* Populated Wishlist Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fadeIn">
            {products.map((product) => {
              const deptSlug =
                product.department === 'Sarees'
                  ? 'sarees'
                  : product.department === 'Ladies Suits'
                  ? 'ladies-suits'
                  : 'bed-sheets';

              const detailUrl = `/${deptSlug}/${product.categorySlug}/${product.id}`;
              const imageSrc =
                product.images && product.images.length > 0
                  ? product.images[0]
                  : '/images/sarees/01_printed_cotton.jpg';

              const isSoldOut =
                product.status === 'Sold Out' || product.stock <= 0;

              const displayPrice =
                product.salePrice && product.salePrice < product.price
                  ? product.salePrice
                  : product.price;

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-[#D4AF37]/30 shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow group"
                >
                  {/* Top Image & Department Tag */}
                  <div>
                    <div className="relative aspect-[3/4] overflow-hidden bg-gray-50">
                      <img
                        src={imageSrc}
                        alt={product.name}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* Department Tag */}
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-xs text-[10px] font-semibold text-[#6B0D2F] uppercase tracking-wider shadow-xs">
                        {product.department}
                      </span>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => handleRemove(product.id)}
                        className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors shadow-xs cursor-pointer"
                        aria-label="Remove from Wishlist"
                        title="Remove from Wishlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      {isSoldOut && (
                        <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex items-center justify-center">
                          <span className="px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-semibold uppercase tracking-wider">
                            Sold Out
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="p-4 space-y-1.5">
                      <span className="text-[11px] text-[#6E676A] uppercase tracking-wider">
                        {product.category}
                      </span>
                      <Link href={detailUrl} className="block">
                        <h3 className="font-serif text-sm font-medium text-[#1A1315] hover:text-[#6B0D2F] transition-colors line-clamp-2">
                          {product.name}
                        </h3>
                      </Link>
                      <div className="flex items-baseline gap-2 pt-1">
                        <span className="text-base font-semibold text-[#1A1315]">
                          ₹{displayPrice.toLocaleString('en-IN')}
                        </span>
                        {product.salePrice && product.salePrice < product.price && (
                          <span className="text-xs text-gray-400 line-through">
                            ₹{product.price.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-4 pt-0 space-y-2">
                    {isSoldOut ? (
                      <button
                        disabled
                        className="w-full py-2.5 px-3 rounded-xl bg-gray-100 text-gray-400 text-xs font-semibold uppercase tracking-wider cursor-not-allowed text-center"
                      >
                        Item Sold Out
                      </button>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        fullWidth
                        onClick={() => handleAddToCart(product)}
                        disabled={addingId === product.id}
                        className="!py-2.5 text-xs font-semibold uppercase tracking-wider"
                      >
                        {addingId === product.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 mr-1.5" /> Added to Cart
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-3.5 h-3.5 mr-1.5" /> Move to Bag
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Container>
    </div>
  );
}

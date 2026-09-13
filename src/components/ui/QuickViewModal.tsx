'use client';

import React from 'react';
import { useShop } from '@/context/ShopContext';
import { X, Heart, ShoppingBag } from 'lucide-react';
import Button from './Button';
import Badge from './Badge';

export default function QuickViewModal() {
  const { quickViewProduct, closeQuickView, addToCart, toggleWishlist, isWishlisted } = useShop();

  if (!quickViewProduct) return null;

  const wishlisted = isWishlisted(quickViewProduct.id);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
        onClick={closeQuickView}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-3xl bg-[#FAF7F2] rounded-2xl shadow-2xl overflow-hidden border border-[#D4AF37]/40 my-8">
          {/* Close Button */}
          <button
            onClick={closeQuickView}
            className="absolute top-4 right-4 z-10 p-2 bg-white/80 hover:bg-white rounded-full text-gray-700 shadow-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Image Section */}
            <div className="relative h-72 md:h-full min-h-[350px]">
              <img
                src={quickViewProduct.image}
                alt={quickViewProduct.name}
                className="w-full h-full object-cover"
              />
              {quickViewProduct.discount && (
                <div className="absolute top-4 left-4">
                  <Badge variant="discount">{quickViewProduct.discount}</Badge>
                </div>
              )}
            </div>

            {/* Info Section */}
            <div className="p-6 md:p-8 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">
                  {quickViewProduct.category} • {quickViewProduct.fabric}
                </span>

                <h3 className="font-serif text-xl md:text-2xl text-[#1A1315] mt-1 mb-2 font-normal">
                  {quickViewProduct.name}
                </h3>

                {/* Price */}
                <div className="flex items-baseline gap-3 mb-4">
                  <span className="text-xl sm:text-2xl font-semibold text-[#1A1315]">
                    ₹{quickViewProduct.price.toLocaleString('en-IN')}
                  </span>
                  {quickViewProduct.originalPrice && (
                    <span className="text-sm text-gray-400 line-through">
                      ₹{quickViewProduct.originalPrice.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#6E676A] leading-relaxed mb-6">
                  {quickViewProduct.description}
                </p>

                {/* Specs Chips */}
                <div className="flex flex-wrap gap-2 text-xs mb-6">
                  {quickViewProduct.fabric && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-white border border-[#D4AF37]/30 text-[#1A1315]">
                      <span className="text-gray-500 font-medium mr-1.5">Fabric:</span>
                      <span className="font-semibold">{quickViewProduct.fabric}</span>
                    </span>
                  )}
                  {quickViewProduct.category && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-white border border-[#D4AF37]/30 text-[#1A1315]">
                      <span className="text-gray-500 font-medium mr-1.5">Category:</span>
                      <span className="font-semibold">{quickViewProduct.category}</span>
                    </span>
                  )}
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-white border border-[#D4AF37]/30 text-[#1A1315]">
                    <span className="text-gray-500 font-medium mr-1.5">Blouse:</span>
                    <span className="font-semibold">Included (80cm)</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <div className="flex gap-3">
                  {quickViewProduct.inStock ? (
                    <Button
                      variant="primary"
                      fullWidth
                      onClick={() => {
                        addToCart(quickViewProduct);
                        closeQuickView();
                      }}
                    >
                      <ShoppingBag className="w-4 h-4 mr-2" /> Add to Cart
                    </Button>
                  ) : (
                    <button
                      disabled
                      className="w-full py-3 rounded-full bg-gray-200 text-gray-500 font-semibold text-xs uppercase tracking-wider cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <span>Item Sold Out</span>
                    </button>
                  )}

                  <button
                    onClick={() => toggleWishlist(quickViewProduct.id)}
                    className={`p-3 rounded-full border transition-all ${
                      wishlisted
                        ? 'bg-red-50 border-red-200 text-red-600'
                        : 'border-[#D4AF37] text-gray-600 hover:text-[#6B0D2F]'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${wishlisted ? 'fill-red-600' : ''}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

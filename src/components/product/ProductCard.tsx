'use client';

import React from 'react';
import { Product } from '@/types';
import { useShop } from '@/context/ShopContext';
import { Star, Heart, Eye, ShoppingBag } from 'lucide-react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, toggleWishlist, isWishlisted, openQuickView } = useShop();
  const wishlisted = isWishlisted(product.id);

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-[#D4AF37]/30 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
      {/* Top Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-[#FAF7F2]">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.discount && <Badge variant="discount">{product.discount}</Badge>}
          {product.isBestseller && <Badge variant="bestseller">Bestseller</Badge>}
          {product.isNew && <Badge variant="new">New</Badge>}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md shadow-md transition-all duration-300 z-10 ${
            wishlisted
              ? 'bg-red-50 text-red-600'
              : 'bg-white/80 text-gray-700 hover:bg-white hover:text-[#6B0D2F]'
          }`}
          aria-label="Toggle Wishlist"
        >
          <Heart className={`w-4 h-4 ${wishlisted ? 'fill-red-600' : ''}`} />
        </button>

        {/* Quick View Hover Overlay */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
          <Button
            variant="gold"
            size="sm"
            onClick={() => openQuickView(product)}
            className="shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
          >
            <Eye className="w-4 h-4 mr-2" /> Quick View
          </Button>
        </div>
      </div>

      {/* Product Information */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between text-[11px] text-[#6E676A] uppercase tracking-wider mb-1">
            <span>{product.category}</span>
            <span className="font-semibold text-[#D4AF37]">{product.fabric}</span>
          </div>

          <h3 className="font-serif text-base font-medium text-[#1A1315] group-hover:text-[#6B0D2F] transition-colors line-clamp-2">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex text-[#D4AF37]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-[#D4AF37]" />
              ))}
            </div>
            <span className="text-xs font-medium text-[#1A1315]">{product.rating}</span>
            <span className="text-[11px] text-gray-400">({product.reviewCount})</span>
          </div>
        </div>

        {/* Price & Add to Cart */}
        <div className="pt-3 border-t border-[#D4AF37]/20 flex items-center justify-between">
          <div>
            <div className="font-serif text-lg font-bold text-[#6B0D2F]">
              ₹{product.price.toLocaleString('en-IN')}
            </div>
            {product.originalPrice && (
              <div className="text-xs text-gray-400 line-through">
                ₹{product.originalPrice.toLocaleString('en-IN')}
              </div>
            )}
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => addToCart(product)}
            className="!px-3.5"
            title="Add to Cart"
          >
            <ShoppingBag className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { Product } from '@/types';
import { ProductItem } from '@/types/product';
import { useShop } from '@/context/ShopContext';
import { Star, Heart, Eye, ShoppingBag, AlertCircle } from 'lucide-react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

interface ProductCardProps {
  product: Product | ProductItem;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, toggleWishlist, isWishlisted, openQuickView } = useShop();

  const isProductItem = 'department' in product;
  const wishlisted = isWishlisted(product.id);

  // Determine Primary Image
  const primaryImage = isProductItem
    ? product.images && product.images.length > 0
      ? product.images[0]
      : '/images/sarees/01_printed_cotton.jpg'
    : product.image || '/images/sarees/01_printed_cotton.jpg';

  // Determine Sold Out status
  const isSoldOut = isProductItem
    ? product.status === 'Sold Out' || product.stock <= 0
    : !product.inStock || product.available === false;

  // Pricing calculations
  let displayPrice = product.price;
  let originalPrice: number | undefined = undefined;
  let discountBadge: string | undefined = undefined;

  if (isProductItem) {
    if (product.salePrice && product.salePrice < product.price) {
      displayPrice = product.salePrice;
      originalPrice = product.price;
      const discountPercent = Math.round(((product.price - product.salePrice) / product.price) * 100);
      discountBadge = `${discountPercent}% OFF`;
    }
  } else {
    displayPrice = product.price;
    originalPrice = product.originalPrice;
    discountBadge = product.discount;
  }

  const categoryLabel = product.category;
  const fabricLabel = product.fabric || (isProductItem ? product.department : 'Handloom');

  // Normalize to legacy Product for global cart/quickview state
  const normalizedProduct: Product = {
    id: product.id,
    name: product.name,
    category: categoryLabel,
    categorySlug: 'categorySlug' in product ? product.categorySlug : undefined,
    fabric: fabricLabel,
    price: displayPrice,
    originalPrice,
    discount: discountBadge,
    rating: 4.8,
    reviewCount: 24,
    image: primaryImage,
    description: product.description || '',
    inStock: !isSoldOut,
    available: !isSoldOut,
  };

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-[#D4AF37]/30 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
      {/* Top Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-[#FAF7F2]">
        <img
          src={primaryImage}
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-700 ease-out ${
            isSoldOut ? 'grayscale-[30%] opacity-85' : 'group-hover:scale-105'
          }`}
          loading="lazy"
        />

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {isSoldOut && <Badge variant="soldout">Sold Out</Badge>}
          {!isSoldOut && discountBadge && <Badge variant="discount">{discountBadge}</Badge>}
          {!isSoldOut && !isProductItem && (product as Product).isBestseller && (
            <Badge variant="bestseller">Bestseller</Badge>
          )}
          {!isSoldOut && !isProductItem && (product as Product).isNew && (
            <Badge variant="new">New</Badge>
          )}
        </div>

        {/* Sold Out Visual Overlay */}
        {isSoldOut && (
          <div className="absolute inset-0 bg-black/35 backdrop-blur-[1px] flex items-center justify-center pointer-events-none z-10">
            <span className="px-3.5 py-1.5 rounded-full bg-black/80 border border-red-500/80 text-white text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-red-400" />
              <span>Sold Out</span>
            </span>
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md shadow-md transition-all duration-300 z-20 ${
            wishlisted
              ? 'bg-red-50 text-red-600'
              : 'bg-white/80 text-gray-700 hover:bg-white hover:text-[#6B0D2F]'
          }`}
          aria-label="Toggle Wishlist"
        >
          <Heart className={`w-4 h-4 ${wishlisted ? 'fill-red-600' : ''}`} />
        </button>

        {/* Quick View Hover Overlay */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4 z-20">
          <Button
            variant="gold"
            size="sm"
            onClick={() => openQuickView(normalizedProduct)}
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
            <span className="truncate max-w-[60%]">{categoryLabel}</span>
            <span className="font-semibold text-[#D4AF37] truncate max-w-[38%]">{fabricLabel}</span>
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
            <span className="text-xs font-medium text-[#1A1315]">
              {('rating' in product && product.rating) ? product.rating : '4.8'}
            </span>
            <span className="text-[11px] text-gray-400">
              ({('reviewCount' in product && product.reviewCount) ? product.reviewCount : '24'})
            </span>
          </div>
        </div>

        {/* Price & Add to Cart */}
        <div className="pt-3 border-t border-[#D4AF37]/20 flex items-center justify-between">
          <div>
            <div className="font-serif text-lg font-bold text-[#6B0D2F]">
              ₹{displayPrice.toLocaleString('en-IN')}
            </div>
            {originalPrice && (
              <div className="text-xs text-gray-400 line-through">
                ₹{originalPrice.toLocaleString('en-IN')}
              </div>
            )}
          </div>

          {/* Add to Cart / Sold Out Action */}
          {isSoldOut ? (
            <button
              disabled
              className="px-3 py-1.5 rounded-lg bg-gray-100 border border-gray-300 text-gray-400 text-xs font-semibold uppercase tracking-wider cursor-not-allowed"
              title="This item is currently sold out"
            >
              Sold Out
            </button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={() => addToCart(normalizedProduct)}
              className="!px-3.5"
              title="Add to Cart"
            >
              <ShoppingBag className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

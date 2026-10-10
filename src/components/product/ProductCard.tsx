'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Product } from '@/types';
import { ProductItem } from '@/types/product';
import { useShop } from '@/context/ShopContext';
import { Heart, ShoppingBag, AlertCircle, CheckCircle2 } from 'lucide-react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import FormErrorBox from '../ui/FormErrorBox';
import { generateWhatsAppOrderUrl } from '@/lib/whatsapp';
import { focusAndScrollTo } from '@/lib/utils/scrollHelper';

interface ProductCardProps {
  product: Product | ProductItem;
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { addToCart, toggleWishlist, isWishlisted } = useShop();
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  // WhatsApp Single-Item Direct Order State
  const [isOrderingWhatsApp, setIsOrderingWhatsApp] = useState(false);
  const [preparedWaUrl, setPreparedWaUrl] = useState<string | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);

  const isProductItem = 'department' in product;
  const wishlisted = isWishlisted(product.id);

  // Compute product detail URL
  let detailUrl = '/sarees';
  if (isProductItem) {
    const deptSlug =
      product.department === 'Sarees'
        ? 'sarees'
        : product.department === 'Ladies Suits'
          ? 'ladies-suits'
          : 'bed-sheets';
    detailUrl = `/${deptSlug}/${product.categorySlug}/${product.id}`;
  } else {
    const catSlug = product.categorySlug || 'printed-cotton';
    detailUrl = `/sarees/${catSlug}/${product.id}`;
  }

  // Determine Primary Image
  const primaryImage = isProductItem
    ? product.images && product.images.length > 0
      ? product.images[0]
      : '/images/placeholder-product.svg'
    : product.image || '/images/placeholder-product.svg';

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

  // Compute accurate Department-Specific attribute label
  let deptAttributeLabel = '';
  if (isProductItem) {
    if (product.department === 'Sarees') {
      deptAttributeLabel = product.fabric || 'Saree';
    } else if (product.department === 'Ladies Suits') {
      deptAttributeLabel = product.suitType || product.fabric || 'Suit Set';
    } else if (product.department === 'Bed Sheets') {
      deptAttributeLabel =
        product.bedSize ||
        (product.pillowCoversIncluded !== false ? 'Pillow Covers' : product.fabric || 'Bed Sheet');
    }
  } else {
    deptAttributeLabel = product.fabric || 'Saree';
  }

  // Normalize to legacy Product for global cart/wishlist state
  const normalizedProduct: Product = {
    id: product.id,
    name: product.name,
    category: categoryLabel,
    categorySlug: 'categorySlug' in product ? product.categorySlug : undefined,
    fabric: deptAttributeLabel,
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

  // Direct WhatsApp Ordering Handler
  const handleOrderViaWhatsApp = async () => {
    if (isSoldOut || isOrderingWhatsApp) return;
    setIsOrderingWhatsApp(true);
    setOrderError(null);
    setPreparedWaUrl(null);

    const returnPath = pathname || (typeof window !== 'undefined' ? window.location.pathname : '/');

    try {
      const orderItem = {
        productId: product.id,
        name: product.name,
        department: isProductItem ? product.department : 'Sarees',
        category: product.category,
        categorySlug: isProductItem ? product.categorySlug : (product.categorySlug || 'printed-cotton'),
        quantity: 1,
        price: displayPrice,
        subtotal: displayPrice * 1,
        image: primaryImage,
      };

      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [orderItem],
          total: displayPrice,
        }),
      });

      if (!orderRes.ok) {
        const errData = await orderRes.json().catch(() => ({}));
        if (orderRes.status === 401 || errData.code === 'UNAUTHENTICATED') {
          router.push(`/login?callbackUrl=${encodeURIComponent(returnPath)}`);
          return;
        }
        if (errData.code === 'PROFILE_INCOMPLETE') {
          router.push(`/account/complete-profile?callbackUrl=${encodeURIComponent(returnPath)}`);
          return;
        }
        if (errData.code === 'EMAIL_UNVERIFIED') {
          router.push(`/account/verify-email?callbackUrl=${encodeURIComponent(returnPath)}`);
          return;
        }
        throw new Error(errData.error || 'Failed to record order attempt on the server.');
      }

      const orderData = await orderRes.json().catch(() => ({}));

      const waUrl =
        orderData.whatsappUrl ||
        generateWhatsAppOrderUrl({
          customerName: orderData.order?.customerName || '',
          customerPhone: orderData.order?.customerPhone || '',
          customerAddress: orderData.order?.customerAddress || '',
          items: [
            {
              name: product.name,
              quantity: 1,
              price: displayPrice,
              department: isProductItem ? product.department : 'Sarees',
              category: product.category,
            },
          ],
          total: displayPrice,
        });

      setPreparedWaUrl(waUrl);
    } catch (err: unknown) {
      console.error('[CARD WHATSAPP ORDER ERROR]', err);
      const message =
        err instanceof Error
          ? err.message
          : "We couldn't connect to WhatsApp ordering. Please check your internet connection and try again, or call 8391097995 if it keeps happening.";
      setOrderError(message);
      focusAndScrollTo(`card-error-${product.id}`);
    } finally {
      setIsOrderingWhatsApp(false);
    }
  };

  return (
    <div className="group/card bg-white rounded-2xl overflow-hidden border border-[#D4AF37]/30 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative">
      {/* 1. Main Clickable Card Link: wraps image, labels, title, and price area */}
      <Link
        href={detailUrl}
        className="flex-1 flex flex-col focus:outline-none cursor-pointer group"
        aria-label={`View ${product.name}`}
      >
        {/* Top Image Container: object-contain with soft neutral background */}
        <div className="relative aspect-[3/4] overflow-hidden bg-[#FAF7F2] flex items-center justify-center p-2.5">
          {!isImageLoaded && (
            <div className="absolute inset-0 bg-[#FAF7F2] animate-pulse" />
          )}

          <img
            src={primaryImage}
            alt={product.name}
            onLoad={() => setIsImageLoaded(true)}
            className={`w-full h-full object-contain transition-transform duration-500 ease-out ${
              isSoldOut ? 'grayscale-[30%] opacity-85' : 'group-hover:scale-105'
            } ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
            loading="lazy"
          />

          {/* Badges Overlay */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
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
            <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px] flex items-center justify-center pointer-events-none z-10">
              <span className="px-3.5 py-1.5 rounded-full bg-black/85 border border-red-500/80 text-white text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                <span>Sold Out</span>
              </span>
            </div>
          )}
        </div>

        {/* Product Information: Category, Department Attribute, Name, Price */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-2.5">
          <div>
            <div className="flex items-center justify-between text-[11px] text-[#6E676A] uppercase tracking-wider mb-1">
              <span className="truncate max-w-[60%]">{categoryLabel}</span>
              <span className="font-semibold text-[#D4AF37] truncate max-w-[38%]">
                {deptAttributeLabel}
              </span>
            </div>

            <h3 className="font-serif text-sm sm:text-base font-medium text-[#1A1315] group-hover:text-[#6B0D2F] transition-colors line-clamp-2">
              {product.name}
            </h3>
          </div>

          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-base sm:text-lg font-semibold text-[#1A1315]">
              ₹{displayPrice.toLocaleString('en-IN')}
            </span>
            {originalPrice && (
              <span className="text-xs text-gray-400 line-through">
                ₹{originalPrice.toLocaleString('en-IN')}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* 2. Wishlist Button: positioned absolute top-right with z-20 (independent of card link) */}
      <motion.button
        type="button"
        whileTap={{ scale: 0.8 }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleWishlist(product.id);
        }}
        className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md shadow-md transition-colors duration-300 z-20 cursor-pointer ${
          wishlisted
            ? 'bg-red-50 text-red-600'
            : 'bg-white/90 text-gray-700 hover:bg-white hover:text-[#6B0D2F]'
        }`}
        aria-label="Toggle Wishlist"
      >
        <motion.div
          key={wishlisted ? 'liked' : 'unliked'}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 15 }}
        >
          <Heart className={`w-4 h-4 ${wishlisted ? 'fill-red-600' : ''}`} />
        </motion.div>
      </motion.button>

      {/* 3. Bottom Action Buttons: Outside the Link area, z-10 */}
      <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 border-t border-[#D4AF37]/20 z-10 bg-white">
        <div className="pt-3 flex flex-col gap-2">
          {isSoldOut ? (
            <div className="py-2.5 px-3 rounded-xl bg-gray-100 border border-gray-200 text-gray-400 text-xs font-semibold uppercase tracking-wider text-center cursor-not-allowed">
              Sold Out
            </div>
          ) : (
            <>
              {preparedWaUrl ? (
                /* Step 2: Real Anchor Link to Open WhatsApp */
                <div className="space-y-1.5 animate-fadeIn">
                  <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center gap-1.5 text-[11px] font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Order saved! Tap to send:</span>
                  </div>
                  <a
                    href={preparedWaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#128C7E] hover:bg-[#0E6C61] text-white font-serif text-xs font-semibold tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer border border-emerald-400/40 text-center"
                  >
                    <svg className="w-4 h-4 fill-current text-white shrink-0" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                    </svg>
                    <span>Open WhatsApp ↗</span>
                  </a>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setPreparedWaUrl(null);
                    }}
                    className="w-full text-center text-[10px] text-[#6E676A] hover:text-[#6B0D2F] py-0.5 transition-colors cursor-pointer"
                  >
                    Reset / Re-order
                  </button>
                </div>
              ) : (
                /* Step 1: Order via WhatsApp & Add to Cart */
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleOrderViaWhatsApp();
                    }}
                    disabled={isOrderingWhatsApp}
                    className="flex-1 py-2 px-3 rounded-xl bg-[#128C7E] hover:bg-[#0E6C61] text-white text-xs font-semibold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-75 border border-emerald-400/40"
                    title="Order directly via WhatsApp"
                  >
                    {isOrderingWhatsApp ? (
                      <>
                        <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                        <span className="text-[11px]">Saving...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5 fill-current text-white shrink-0" viewBox="0 0 24 24">
                          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                        </svg>
                        <span className="text-[11px] font-semibold whitespace-nowrap">WhatsApp</span>
                      </>
                    )}
                  </button>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      addToCart(normalizedProduct);
                    }}
                    className="!px-3.5 !py-2 shrink-0"
                    title="Add to Cart"
                  >
                    <ShoppingBag className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {/* Card-level Error Notice */}
              {orderError && (
                <FormErrorBox
                  id={`card-error-${product.id}`}
                  error={orderError}
                  className="!p-2 !text-[11px] mt-1.5"
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

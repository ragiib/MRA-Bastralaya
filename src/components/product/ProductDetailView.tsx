'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ProductItem } from '@/types/product';
import { useShop } from '@/context/ShopContext';
import { generateWhatsAppOrderUrl } from '@/lib/whatsapp';
import Container from '@/components/ui/Container';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import {
  ChevronRight,
  Heart,
  ShoppingBag,
  AlertCircle,
  Check,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';

interface ProductDetailViewProps {
  product: ProductItem;
}

export default function ProductDetailView({ product }: ProductDetailViewProps) {
  const router = useRouter();
  const { toggleWishlist, isWishlisted, addToCart } = useShop();
  const wishlisted = isWishlisted(product.id);

  const pathname = usePathname();
  const returnPath = pathname || (typeof window !== 'undefined' ? window.location.pathname : '/');

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [isOrderingWhatsApp, setIsOrderingWhatsApp] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [preparedWaUrl, setPreparedWaUrl] = useState<string | null>(null);

  const handleAddToCart = async () => {
    if (product.status === 'Sold Out' || product.stock <= 0 || isAdding) return;
    setIsAdding(true);
    await addToCart(product, quantity);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdding(false);
      setIsAdded(false);
    }, 1800);
  };

  const handleOrderViaWhatsApp = async () => {
    if (product.status === 'Sold Out' || product.stock <= 0 || isOrderingWhatsApp) return;
    setIsOrderingWhatsApp(true);
    setOrderError(null);
    setPreparedWaUrl(null);

    const returnPath = pathname || (typeof window !== 'undefined' ? window.location.pathname : '/');

    try {
      // 1. Determine effective unit price and format single-item order (independent of cart)
      const effectivePrice =
        product.salePrice && product.salePrice < product.price
          ? product.salePrice
          : product.price;

      const orderItem = {
        productId: product.id,
        name: product.name,
        department: product.department,
        category: product.category,
        categorySlug: product.categorySlug,
        quantity,
        price: effectivePrice,
        subtotal: effectivePrice * quantity,
        image: product.images && product.images.length > 0 ? product.images[0] : undefined,
      };

      // 2. Directly create single-item order record on server (validates authentication and profile completeness)
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [orderItem],
          total: effectivePrice * quantity,
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

      // 3. Generate WhatsApp order URL
      const waUrl =
        orderData.whatsappUrl ||
        generateWhatsAppOrderUrl({
          customerName: orderData.order?.customerName || '',
          customerPhone: orderData.order?.customerPhone || '',
          customerAddress: orderData.order?.customerAddress || '',
          items: [
            {
              name: product.name,
              quantity,
              price: effectivePrice,
              department: product.department,
              category: product.category,
            },
          ],
          total: effectivePrice * quantity,
        });

      // 4. Set prepared URL to transition to Step 2 (direct anchor element for user tap)
      // Do NOT attempt any automatic window.open or location redirect
      setPreparedWaUrl(waUrl);
    } catch (err: unknown) {
      console.error('[WHATSAPP ORDER ERROR]', err);
      const message = err instanceof Error ? err.message : 'Unable to proceed to WhatsApp. Please try again.';
      setOrderError(message);
    } finally {
      setIsOrderingWhatsApp(false);
    }
  };

  // Generic fallback placeholder image if product has no photos
  const defaultImage = '/images/placeholder-product.svg';

  const images = product.images && product.images.length > 0 ? product.images : [defaultImage];
  const activeImage = images[activeImageIndex] || images[0] || defaultImage;

  // Department URL prefix and label
  const deptSlug =
    product.department === 'Sarees'
      ? 'sarees'
      : product.department === 'Ladies Suits'
      ? 'ladies-suits'
      : 'bed-sheets';

  const deptLabel = product.department;
  const isSoldOut = product.status === 'Sold Out' || product.stock <= 0;

  // Pricing calculations
  const displayPrice =
    product.salePrice && product.salePrice < product.price ? product.salePrice : product.price;
  const originalPrice =
    product.salePrice && product.salePrice < product.price ? product.price : undefined;
  const discountPercent = originalPrice
    ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100)
    : undefined;

  return (
    <div className="bg-[#FAF7F2] min-h-screen py-6 sm:py-10">
      <Container>
        {/* Breadcrumbs Navigation */}
        <nav
          className="flex items-center space-x-2 text-xs sm:text-sm text-[#6E676A] mb-6 sm:mb-8 overflow-x-auto whitespace-nowrap pb-2 scrollbar-none"
          aria-label="Breadcrumb"
        >
          <Link href="/" className="hover:text-[#6B0D2F] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <Link href={`/${deptSlug}`} className="hover:text-[#6B0D2F] transition-colors">
            {deptLabel}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <Link
            href={`/${deptSlug}/${product.categorySlug}`}
            className="hover:text-[#6B0D2F] transition-colors font-medium text-[#1A1315]"
          >
            {product.category}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <span className="text-[#6B0D2F] font-semibold truncate max-w-[200px] sm:max-w-xs">
            {product.name}
          </span>
        </nav>

        {/* Back Link */}
        <div className="mb-6">
          <Link
            href={`/${deptSlug}/${product.categorySlug}`}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-[#6E676A] hover:text-[#6B0D2F] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to {product.category}</span>
          </Link>
        </div>

        {/* Main Product Showcase Card */}
        <div className="bg-white rounded-3xl border border-[#D4AF37]/30 shadow-md overflow-hidden p-6 sm:p-10 lg:p-12 mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Column: Image Gallery (6 cols on lg) */}
            <div className="lg:col-span-6 space-y-4">
              {/* Primary Large Image View */}
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#FAF7F2] border border-[#D4AF37]/30 group">
                <img
                  src={activeImage}
                  alt={product.name}
                  className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${
                    isSoldOut ? 'grayscale-[25%] opacity-90' : ''
                  }`}
                />

                {/* Badges Overlay */}
                <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                  {isSoldOut && <Badge variant="soldout">Sold Out</Badge>}
                  {!isSoldOut && discountPercent && (
                    <Badge variant="discount">{discountPercent}% OFF</Badge>
                  )}
                  <Badge variant="gold">
                    <Sparkles className="w-3 h-3 mr-1 inline" /> Handcrafted
                  </Badge>
                </div>

                {/* Sold Out Visual Overlay */}
                {isSoldOut && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center pointer-events-none z-10">
                    <span className="px-5 py-2.5 rounded-full bg-black/85 border border-red-500 text-white text-xs sm:text-sm font-bold uppercase tracking-wider shadow-2xl flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400" />
                      <span>Item Sold Out</span>
                    </span>
                  </div>
                )}
              </div>

              {/* Thumbnails Gallery Strip */}
              {images.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
                  {images.map((imgUrl, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImageIndex(index)}
                      className={`relative w-20 h-24 rounded-xl overflow-hidden border-2 transition-all cursor-pointer flex-shrink-0 ${
                        activeImageIndex === index
                          ? 'border-[#6B0D2F] ring-2 ring-[#D4AF37]/50 shadow-md scale-105'
                          : 'border-gray-200 hover:border-[#D4AF37]/60 opacity-75 hover:opacity-100'
                      }`}
                      aria-label={`View image ${index + 1}`}
                    >
                      <img
                        src={imgUrl}
                        alt={`${product.name} thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Product Info & Actions (6 cols on lg) */}
            <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
              {/* Category & Department Meta */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <span className="px-3.5 py-1 rounded-full bg-[#FAF7F2] border border-[#D4AF37]/40 text-[#6B0D2F] text-xs font-semibold uppercase tracking-wider">
                    {product.department} • {product.category}
                  </span>

                  {/* Wishlist Button */}
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className={`p-2.5 rounded-full border transition-all cursor-pointer shadow-xs ${
                      wishlisted
                        ? 'bg-red-50 border-red-200 text-red-600'
                        : 'bg-white border-[#D4AF37]/40 text-gray-700 hover:text-[#6B0D2F] hover:bg-[#FAF7F2]'
                    }`}
                    aria-label="Toggle Wishlist"
                  >
                    <Heart className={`w-5 h-5 ${wishlisted ? 'fill-red-600' : ''}`} />
                  </button>
                </div>

                {/* Product Title */}
                <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl text-[#1A1315] font-normal leading-tight">
                  {product.name}
                </h1>
              </div>

              {/* Pricing Section */}
              <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#D4AF37]/30 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                <div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-2xl sm:text-3xl font-semibold text-[#1A1315]">
                      ₹{displayPrice.toLocaleString('en-IN')}
                    </span>
                    {originalPrice && (
                      <span className="text-sm sm:text-base text-gray-400 line-through">
                        ₹{originalPrice.toLocaleString('en-IN')}
                      </span>
                    )}
                    {discountPercent && (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                        Save {discountPercent}%
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#6E676A] mt-1">
                    Inclusive of all taxes
                  </p>
                </div>

                {/* Stock Status Pill */}
                <div className="pt-2 sm:pt-0">
                  {isSoldOut ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-semibold">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Sold Out
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
                      <Check className="w-3.5 h-3.5" />
                      In Stock ({product.stock} units)
                    </span>
                  )}
                </div>
              </div>

              {/* Full Description */}
              <div className="space-y-2">
                <h2 className="text-xs font-bold uppercase tracking-widest text-[#6E676A]">
                  Description & Weave Story
                </h2>
                <p className="text-sm sm:text-base text-[#1A1315]/80 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Department-Specific Specifications Chips */}
              <div className="space-y-2.5">
                <h2 className="text-xs font-bold uppercase tracking-widest text-[#6E676A]">
                  Specifications &amp; Details
                </h2>

                <div className="flex flex-wrap gap-2 text-xs">
                  {/* Sarees Specifics */}
                  {product.department === 'Sarees' && (
                    <>
                      {product.fabric && (
                        <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#D4AF37]/30 text-[#1A1315]">
                          <span className="text-[#6E676A] font-medium mr-1.5">Fabric:</span>
                          <span className="font-semibold">{product.fabric}</span>
                        </span>
                      )}
                      <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#D4AF37]/30 text-[#1A1315]">
                        <span className="text-[#6E676A] font-medium mr-1.5">Blouse:</span>
                        <span className="font-semibold">
                          {product.blousePieceIncluded !== false ? 'Included (80 cm)' : 'Not Included'}
                        </span>
                      </span>
                      {product.workTechnique && (
                        <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#D4AF37]/30 text-[#1A1315]">
                          <span className="text-[#6E676A] font-medium mr-1.5">Work:</span>
                          <span className="font-semibold">{product.workTechnique}</span>
                        </span>
                      )}
                      {product.color && (
                        <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#D4AF37]/30 text-[#1A1315]">
                          <span className="text-[#6E676A] font-medium mr-1.5">Color:</span>
                          <span className="font-semibold">{product.color}</span>
                        </span>
                      )}
                      {product.occasion && (
                        <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#D4AF37]/30 text-[#1A1315]">
                          <span className="text-[#6E676A] font-medium mr-1.5">Occasion:</span>
                          <span className="font-semibold">{product.occasion}</span>
                        </span>
                      )}
                    </>
                  )}

                  {/* Ladies Suits Specifics */}
                  {product.department === 'Ladies Suits' && (
                    <>
                      {product.suitType && (
                        <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#D4AF37]/30 text-[#1A1315]">
                          <span className="text-[#6E676A] font-medium mr-1.5">Type:</span>
                          <span className="font-semibold">{product.suitType}</span>
                        </span>
                      )}
                      {product.size && (
                        <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#D4AF37]/30 text-[#1A1315]">
                          <span className="text-[#6E676A] font-medium mr-1.5">Cut:</span>
                          <span className="font-semibold">{product.size}</span>
                        </span>
                      )}
                      {product.fabric && (
                        <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#D4AF37]/30 text-[#1A1315]">
                          <span className="text-[#6E676A] font-medium mr-1.5">Fabric:</span>
                          <span className="font-semibold">{product.fabric}</span>
                        </span>
                      )}
                      {product.color && (
                        <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#D4AF37]/30 text-[#1A1315]">
                          <span className="text-[#6E676A] font-medium mr-1.5">Color:</span>
                          <span className="font-semibold">{product.color}</span>
                        </span>
                      )}
                    </>
                  )}

                  {/* Bed Sheets Specifics */}
                  {product.department === 'Bed Sheets' && (
                    <>
                      {product.bedSize && (
                        <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#D4AF37]/30 text-[#1A1315]">
                          <span className="text-[#6E676A] font-medium mr-1.5">Size:</span>
                          <span className="font-semibold">{product.bedSize}</span>
                        </span>
                      )}
                      <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#D4AF37]/30 text-[#1A1315]">
                        <span className="text-[#6E676A] font-medium mr-1.5">Pillow Covers:</span>
                        <span className="font-semibold">
                          {product.pillowCoversIncluded !== false ? '2 Included' : 'Not Included'}
                        </span>
                      </span>
                      {product.fabric && (
                        <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#D4AF37]/30 text-[#1A1315]">
                          <span className="text-[#6E676A] font-medium mr-1.5">Fabric:</span>
                          <span className="font-semibold">{product.fabric}</span>
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Actions Section */}
              <div className="space-y-4 pt-2">
                {/* Quantity Selector (when item is in stock) */}
                {!isSoldOut && (
                  <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#D4AF37]/30">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#1A1315]">
                      Select Quantity:
                    </span>
                    <div className="flex items-center gap-3">
                      <div className="inline-flex items-center border border-[#D4AF37]/50 rounded-xl bg-white shadow-xs p-1">
                        <button
                          type="button"
                          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                          disabled={quantity <= 1}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-base font-bold text-[#1A1315] hover:bg-[#FAF7F2] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="w-10 text-center text-sm font-bold text-[#1A1315]">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                          disabled={quantity >= product.stock}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-base font-bold text-[#1A1315] hover:bg-[#FAF7F2] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-xs text-[#6E676A]">
                        ({product.stock} units available)
                      </span>
                    </div>
                  </div>
                )}

                {isSoldOut ? (
                  <button
                    disabled
                    className="w-full py-4 rounded-xl bg-gray-200 border border-gray-300 text-gray-500 font-bold text-xs uppercase tracking-widest cursor-not-allowed flex items-center justify-center gap-2 shadow-xs"
                  >
                    <AlertCircle className="w-4 h-4 text-gray-400" />
                    <span>Item Sold Out — Currently Unavailable</span>
                  </button>
                ) : (
                  <div className="space-y-3">
                    {/* Error Notice if any */}
                    {orderError && (
                      <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 animate-fadeIn">
                        <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                        <span className="leading-relaxed">{orderError}</span>
                      </div>
                    )}

                    {/* WhatsApp Action: Two-step flow (Order created on server -> User taps direct anchor) */}
                    {preparedWaUrl ? (
                      <div className="space-y-2.5 animate-fadeIn">
                        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center gap-2 text-xs font-semibold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Order saved! Tap below to open WhatsApp and send your order details:</span>
                        </div>
                        <a
                          href={preparedWaUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-4 px-6 rounded-2xl bg-[#128C7E] hover:bg-[#0E6C61] text-white font-serif text-sm sm:text-base font-semibold tracking-wide transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2.5 cursor-pointer group border border-emerald-400/40 text-center"
                        >
                          <svg className="w-5 h-5 fill-current text-white shrink-0 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                          </svg>
                          <span>Open WhatsApp to Send Order ↗</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => setPreparedWaUrl(null)}
                          className="w-full text-center text-xs text-[#6E676A] hover:text-[#6B0D2F] py-1 transition-colors cursor-pointer"
                        >
                          Change quantity or re-order
                        </button>
                      </div>
                    ) : (
                      /* Step 1: Initial "Order via WhatsApp" button */
                      <button
                        type="button"
                        onClick={handleOrderViaWhatsApp}
                        disabled={isOrderingWhatsApp}
                        className="w-full py-4 px-6 rounded-2xl bg-[#128C7E] hover:bg-[#0E6C61] text-white font-serif text-sm sm:text-base font-semibold tracking-wide transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-75 group border border-emerald-400/40"
                      >
                        {isOrderingWhatsApp ? (
                          <>
                            <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Preparing your order...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5 fill-current text-white shrink-0 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                            </svg>
                            <span>Order via WhatsApp ({quantity > 1 ? `${quantity} items` : '1 item'})</span>
                          </>
                        )}
                      </button>
                    )}

                    {/* Secondary Action: Add to Cart */}
                    <Button
                      variant="outline"
                      size="lg"
                      fullWidth
                      onClick={handleAddToCart}
                      disabled={isAdding}
                      className="!py-3.5 border-[#D4AF37]/50 hover:bg-[#FAF7F2] text-[#6B0D2F] text-xs font-semibold uppercase tracking-wider cursor-pointer"
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-4 h-4 mr-2 text-emerald-600" /> Added to Cart!
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4 mr-2 text-[#D4AF37]" /> Add to Cart for Later
                        </>
                      )}
                    </Button>

                    <Link
                      href="/cart"
                      className="inline-flex items-center justify-center gap-1.5 w-full text-center text-xs font-bold text-[#6B0D2F] hover:underline pt-1 uppercase tracking-wider"
                    >
                      <span>Review Cart ({quantity > 1 ? `${quantity} items` : 'Current bag'}) →</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

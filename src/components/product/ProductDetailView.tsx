'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ProductItem } from '@/types/product';
import { useShop } from '@/context/ShopContext';
import { generateWhatsAppOrderUrl } from '@/lib/whatsapp';
import Container from '@/components/ui/Container';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import {
  ChevronRight,
  Star,
  Heart,
  ShoppingBag,
  ShieldCheck,
  Truck,
  RefreshCw,
  AlertCircle,
  Check,
  Sparkles,
  ArrowLeft,
  PhoneCall,
  Info,
  CheckCircle2,
  MessageSquare,
} from 'lucide-react';

interface ProductDetailViewProps {
  product: ProductItem;
}

export default function ProductDetailView({ product }: ProductDetailViewProps) {
  const router = useRouter();
  const { toggleWishlist, isWishlisted, addToCart } = useShop();
  const wishlisted = isWishlisted(product.id);

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

    // Open blank window immediately on user gesture so browser popup blocker doesn't block it
    let popupWindow: Window | null = null;
    try {
      popupWindow = window.open('about:blank', '_blank');
    } catch {
      popupWindow = null;
    }

    try {
      // 1. Verify authenticated user and profile completeness (bypass any cached GET responses)
      const profileRes = await fetch(`/api/account/profile?t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });

      if (!profileRes.ok) {
        if (popupWindow && !popupWindow.closed) popupWindow.close();
        if (profileRes.status === 401) {
          const returnPath = typeof window !== 'undefined' ? window.location.pathname : '/';
          router.push(`/login?callbackUrl=${encodeURIComponent(returnPath)}`);
          return;
        }
        throw new Error('Failed to verify customer profile status. Please check your network connection.');
      }

      const profileData = await profileRes.json();
      const user = profileData.user;

      const isProfileComplete = Boolean(
        user &&
        user.name && user.name.trim().length >= 2 &&
        user.phone && user.phone.trim().length >= 7 &&
        user.address && user.address.trim().length >= 5
      );

      if (!isProfileComplete) {
        if (popupWindow && !popupWindow.closed) popupWindow.close();
        const returnPath = typeof window !== 'undefined' ? window.location.pathname : '/';
        router.push(`/account/complete-profile?callbackUrl=${encodeURIComponent(returnPath)}`);
        return;
      }

      // 2. Profile is complete! Determine unit price and order total
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

      // 3. Record order attempt in the database
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [orderItem],
          total: effectivePrice * quantity,
        }),
      });

      if (!orderRes.ok) {
        if (popupWindow && !popupWindow.closed) popupWindow.close();
        const errData = await orderRes.json().catch(() => ({}));
        if (errData.code === 'PROFILE_INCOMPLETE') {
          const returnPath = typeof window !== 'undefined' ? window.location.pathname : '/';
          router.push(`/account/complete-profile?callbackUrl=${encodeURIComponent(returnPath)}`);
          return;
        }
        throw new Error(errData.error || 'Failed to record order attempt on the server.');
      }

      const orderData = await orderRes.json().catch(() => ({}));

      // 4. Use server-generated WhatsApp order link (or client fallback)
      const waUrl =
        orderData.whatsappUrl ||
        generateWhatsAppOrderUrl({
          customerName: user.name,
          customerPhone: user.phone,
          customerAddress: user.address,
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

      // Save prepared URL for persistent manual button if needed
      setPreparedWaUrl(waUrl);

      // 5. Open WhatsApp: try pre-opened popup tab, or fallback to current window navigation
      let popupNavigated = false;
      if (popupWindow && !popupWindow.closed) {
        try {
          popupWindow.location.href = waUrl;
          popupWindow.focus();
          popupNavigated = true;
        } catch (popupErr) {
          console.warn('[POPUP NAVIGATION ERROR]', popupErr);
        }
      }

      if (!popupNavigated) {
        // Direct redirect fallback so the user is never blocked by popup restrictions
        window.location.href = waUrl;
      }
    } catch (err: unknown) {
      if (popupWindow && !popupWindow.closed) {
        try { popupWindow.close(); } catch {}
      }
      console.error('[WHATSAPP ORDER ERROR]', err);
      const message = err instanceof Error ? err.message : 'Unable to proceed to WhatsApp. Please try again.';
      setOrderError(message);
    } finally {
      setIsOrderingWhatsApp(false);
    }
  };

  // Fallback default images per department if empty
  const defaultImage =
    product.department === 'Ladies Suits'
      ? '/images/ladies-suits/cotton_batik.jpg'
      : product.department === 'Bed Sheets'
      ? '/images/bed-sheets/phulkari_bedsheet_cat.jpg'
      : '/images/sarees/01_printed_cotton.jpg';

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

                {/* Ratings & Social Proof */}
                <div className="flex items-center gap-2 pt-1">
                  <div className="flex text-[#D4AF37]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#D4AF37]" />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-[#1A1315]">4.9</span>
                  <span className="text-xs text-[#6E676A]">
                    · Heritage Handloom Quality Inspected
                  </span>
                </div>
              </div>

              {/* Pricing Section */}
              <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#D4AF37]/30 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                <div>
                  <div className="flex items-baseline gap-3">
                    <span className="font-serif text-3xl sm:text-4xl font-bold text-[#6B0D2F]">
                      ₹{displayPrice.toLocaleString('en-IN')}
                    </span>
                    {originalPrice && (
                      <span className="text-base text-gray-400 line-through">
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
                    Inclusive of all taxes · Direct artisan pricing
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

              {/* Department-Specific Specifications Grid */}
              <div className="space-y-3">
                <h2 className="text-xs font-bold uppercase tracking-widest text-[#6E676A]">
                  Specifications & Craft Details
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-[#FAF7F2] p-4 sm:p-5 rounded-2xl border border-[#D4AF37]/30">
                  {/* Sarees Specifics */}
                  {product.department === 'Sarees' && (
                    <>
                      <div className="flex flex-col border-b border-[#D4AF37]/15 pb-2">
                        <span className="text-[#6E676A] uppercase text-[10px] tracking-wider">
                          Fabric & Weave
                        </span>
                        <span className="font-semibold text-[#1A1315] mt-0.5">
                          {product.fabric || 'Pure Handloom Cotton / Silk'}
                        </span>
                      </div>
                      <div className="flex flex-col border-b border-[#D4AF37]/15 pb-2">
                        <span className="text-[#6E676A] uppercase text-[10px] tracking-wider">
                          Blouse Piece
                        </span>
                        <span className="font-semibold text-[#1A1315] mt-0.5">
                          {product.blousePieceIncluded !== false
                            ? 'Included (Unstitched, ~80 cm)'
                            : 'Not Included'}
                        </span>
                      </div>
                      <div className="flex flex-col border-b border-[#D4AF37]/15 pb-2">
                        <span className="text-[#6E676A] uppercase text-[10px] tracking-wider">
                          Work / Technique
                        </span>
                        <span className="font-semibold text-[#1A1315] mt-0.5">
                          {product.workTechnique || 'Traditional Artisan Weave'}
                        </span>
                      </div>
                      <div className="flex flex-col border-b border-[#D4AF37]/15 pb-2">
                        <span className="text-[#6E676A] uppercase text-[10px] tracking-wider">
                          Color
                        </span>
                        <span className="font-semibold text-[#1A1315] mt-0.5">
                          {product.color || 'Authentic Natural Dye'}
                        </span>
                      </div>
                      <div className="flex flex-col sm:col-span-2 pt-1">
                        <span className="text-[#6E676A] uppercase text-[10px] tracking-wider">
                          Recommended Occasion
                        </span>
                        <span className="font-semibold text-[#1A1315] mt-0.5">
                          {product.occasion || 'Festive Gatherings, Traditional Events & Celebrations'}
                        </span>
                      </div>
                    </>
                  )}

                  {/* Ladies Suits Specifics */}
                  {product.department === 'Ladies Suits' && (
                    <>
                      <div className="flex flex-col border-b border-[#D4AF37]/15 pb-2">
                        <span className="text-[#6E676A] uppercase text-[10px] tracking-wider">
                          Set Configuration
                        </span>
                        <span className="font-semibold text-[#1A1315] mt-0.5">
                          {product.suitType || 'Full Set (Top, Bottom & Dupatta)'}
                        </span>
                      </div>
                      <div className="flex flex-col border-b border-[#D4AF37]/15 pb-2">
                        <span className="text-[#6E676A] uppercase text-[10px] tracking-wider">
                          Size & Cut
                        </span>
                        <span className="font-semibold text-[#1A1315] mt-0.5">
                          {product.size || 'Free Size Unstitched Dress Material'}
                        </span>
                      </div>
                      <div className="flex flex-col border-b border-[#D4AF37]/15 pb-2">
                        <span className="text-[#6E676A] uppercase text-[10px] tracking-wider">
                          Fabric
                        </span>
                        <span className="font-semibold text-[#1A1315] mt-0.5">
                          {product.fabric || '100% Pure Handcrafted Cotton'}
                        </span>
                      </div>
                      <div className="flex flex-col border-b border-[#D4AF37]/15 pb-2">
                        <span className="text-[#6E676A] uppercase text-[10px] tracking-wider">
                          Primary Color
                        </span>
                        <span className="font-semibold text-[#1A1315] mt-0.5">
                          {product.color || 'Artisan Indigo / Floral Palette'}
                        </span>
                      </div>
                    </>
                  )}

                  {/* Bed Sheets Specifics */}
                  {product.department === 'Bed Sheets' && (
                    <>
                      <div className="flex flex-col border-b border-[#D4AF37]/15 pb-2">
                        <span className="text-[#6E676A] uppercase text-[10px] tracking-wider">
                          Bed Size & Dimensions
                        </span>
                        <span className="font-semibold text-[#1A1315] mt-0.5">
                          {product.bedSize || 'King Size (108 x 108 inches)'}
                        </span>
                      </div>
                      <div className="flex flex-col border-b border-[#D4AF37]/15 pb-2">
                        <span className="text-[#6E676A] uppercase text-[10px] tracking-wider">
                          Pillow Covers
                        </span>
                        <span className="font-semibold text-[#1A1315] mt-0.5">
                          {product.pillowCoversIncluded !== false
                            ? '2 Matching Embroidered Pillow Covers Included'
                            : 'Not Included'}
                        </span>
                      </div>
                      <div className="flex flex-col sm:col-span-2 pt-1">
                        <span className="text-[#6E676A] uppercase text-[10px] tracking-wider">
                          Fabric & Material
                        </span>
                        <span className="font-semibold text-[#1A1315] mt-0.5">
                          {product.fabric || '100% Pure Breathable Cotton'}
                        </span>
                      </div>
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

                    {/* Persistent WhatsApp Direct Button if opened / blocked by browser */}
                    {preparedWaUrl && (
                      <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-500/80 text-emerald-950 space-y-2 animate-fadeIn">
                        <div className="flex items-center gap-2 font-semibold text-xs text-emerald-900">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Order Prepared! Connecting to WhatsApp...</span>
                        </div>
                        <p className="text-[11px] text-emerald-800 leading-relaxed">
                          If WhatsApp didn&apos;t open automatically on your device, click below to open your chat directly:
                        </p>
                        <a
                          href={preparedWaUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2.5 px-4 rounded-xl bg-[#128C7E] hover:bg-[#0E6C61] text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>Open WhatsApp Chat ↗</span>
                        </a>
                      </div>
                    )}

                    {/* Primary Action: Order via WhatsApp */}
                    <button
                      type="button"
                      onClick={handleOrderViaWhatsApp}
                      disabled={isOrderingWhatsApp}
                      className="w-full py-4 px-6 rounded-2xl bg-[#128C7E] hover:bg-[#0E6C61] text-white font-serif text-sm sm:text-base font-semibold tracking-wide transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-75 group border border-emerald-400/40"
                    >
                      {isOrderingWhatsApp ? (
                        <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <svg className="w-5 h-5 fill-current text-white shrink-0 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                        </svg>
                      )}
                      <span>Order via WhatsApp ({quantity > 1 ? `${quantity} items` : '1 item'})</span>
                    </button>

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

              {/* Trust & Guarantee Highlights */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#D4AF37]/20 text-center">
                <div className="flex flex-col items-center p-3 rounded-xl bg-[#FAF7F2]">
                  <Truck className="w-5 h-5 text-[#D4AF37] mb-1.5" />
                  <span className="text-[11px] font-bold text-[#1A1315]">Free Shipping</span>
                  <span className="text-[10px] text-[#6E676A]">Pan India Delivery</span>
                </div>
                <div className="flex flex-col items-center p-3 rounded-xl bg-[#FAF7F2]">
                  <ShieldCheck className="w-5 h-5 text-[#D4AF37] mb-1.5" />
                  <span className="text-[11px] font-bold text-[#1A1315]">Authentic Craft</span>
                  <span className="text-[10px] text-[#6E676A]">Direct Artisan Weaves</span>
                </div>
                <div className="flex flex-col items-center p-3 rounded-xl bg-[#FAF7F2]">
                  <RefreshCw className="w-5 h-5 text-[#D4AF37] mb-1.5" />
                  <span className="text-[11px] font-bold text-[#1A1315]">Easy Exchange</span>
                  <span className="text-[10px] text-[#6E676A]">7-Day Return Policy</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

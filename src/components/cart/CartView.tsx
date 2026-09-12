'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useShop } from '@/context/ShopContext';
import { generateWhatsAppOrderUrl } from '@/lib/whatsapp';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import {
  ShoppingBag,
  Trash2,
  ChevronRight,
  ArrowLeft,
  AlertTriangle,
  AlertCircle,
  Truck,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  MessageSquare,
} from 'lucide-react';

export default function CartView() {
  const router = useRouter();
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalCartCount,
    totalCartPrice,
  } = useShop();

  const [isOrderingWhatsApp, setIsOrderingWhatsApp] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [preparedWaUrl, setPreparedWaUrl] = useState<string | null>(null);

  const hasSoldOutItems = cartItems.some(
    (item) =>
      item.product.status === 'Sold Out' ||
      item.product.status === 'Draft' ||
      item.product.stock <= 0
  );

  const handleOrderViaWhatsApp = async () => {
    if (cartItems.length === 0 || isOrderingWhatsApp) return;

    if (hasSoldOutItems) {
      setOrderError(
        'Please remove sold out items from your cart before placing your WhatsApp order.'
      );
      return;
    }

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
      // 1. Verify authenticated user and complete profile (bypass any cached GET responses)
      const profileRes = await fetch(`/api/account/profile?t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });

      if (!profileRes.ok) {
        if (popupWindow && !popupWindow.closed) popupWindow.close();
        if (profileRes.status === 401) {
          router.push(`/login?callbackUrl=${encodeURIComponent('/cart')}`);
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
        router.push(`/account/complete-profile?callbackUrl=${encodeURIComponent('/cart')}`);
        return;
      }

      // 2. Format order items
      const orderItems = cartItems.map((item) => ({
        productId: item.productId,
        name: item.product.name,
        department: item.product.department,
        category: item.product.category,
        categorySlug: item.product.categorySlug,
        quantity: item.quantity,
        price: item.priceAtAdd,
        subtotal: item.priceAtAdd * item.quantity,
        image:
          item.product.images && item.product.images.length > 0
            ? item.product.images[0]
            : undefined,
      }));

      // 3. Record order attempt in the database
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: orderItems,
          total: totalCartPrice,
        }),
      });

      if (!orderRes.ok) {
        if (popupWindow && !popupWindow.closed) popupWindow.close();
        const errData = await orderRes.json().catch(() => ({}));
        if (errData.code === 'PROFILE_INCOMPLETE') {
          router.push(`/account/complete-profile?callbackUrl=${encodeURIComponent('/cart')}`);
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
          items: cartItems.map((item) => ({
            name: item.product.name,
            quantity: item.quantity,
            price: item.priceAtAdd,
            department: item.product.department,
            category: item.product.category,
          })),
          total: totalCartPrice,
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
      console.error('[CART WHATSAPP ORDER ERROR]', err);
      const message =
        err instanceof Error ? err.message : 'Unable to proceed to WhatsApp. Please try again.';
      setOrderError(message);
    } finally {
      setIsOrderingWhatsApp(false);
    }
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
          <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <span className="text-[#6B0D2F] font-semibold">Shopping Cart</span>
        </nav>

        {/* Page Title & Count */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-6 border-b border-[#D4AF37]/30 mb-8">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#1A1315]">
              Shopping Cart
            </h1>
            <p className="text-xs sm:text-sm text-[#6E676A] mt-1">
              Review your handcrafted selections from MRA Bastralaya
            </p>
          </div>

          {cartItems.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="px-3.5 py-1 rounded-full bg-[#FAF7F2] border border-[#D4AF37]/40 text-[#6B0D2F] text-xs font-bold">
                {totalCartCount} {totalCartCount === 1 ? 'Item' : 'Items'} in Bag
              </span>
              <button
                onClick={clearCart}
                className="text-xs text-gray-500 hover:text-red-600 transition-colors underline cursor-pointer"
              >
                Clear Cart
              </button>
            </div>
          )}
        </div>

        {/* Empty Cart State */}
        {cartItems.length === 0 ? (
          <div className="py-16 sm:py-24 text-center bg-white rounded-3xl border border-[#D4AF37]/30 p-8 sm:p-12 space-y-6 max-w-xl mx-auto shadow-xs">
            <div className="w-20 h-20 rounded-3xl bg-[#FAF7F2] border border-[#D4AF37]/40 text-[#6B0D2F] flex items-center justify-center mx-auto text-3xl shadow-xs">
              <ShoppingBag className="w-10 h-10 text-[#D4AF37]" />
            </div>
            <div className="space-y-2">
              <h2 className="font-serif text-2xl sm:text-3xl text-[#1A1315]">
                Your Shopping Bag is Empty
              </h2>
              <p className="text-xs sm:text-sm text-[#6E676A] leading-relaxed max-w-md mx-auto">
                Explore our curated handloom sarees, designer salwar suits, and pure cotton bed sheets to begin filling your bag.
              </p>
            </div>

            {/* Quick Department Buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link href="/sarees">
                <Button variant="primary" size="md">
                  Explore Sarees Collection
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
          /* Populated Cart Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Column: Cart Items List (8 cols on lg) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-white rounded-3xl border border-[#D4AF37]/30 shadow-xs overflow-hidden divide-y divide-[#D4AF37]/20">
                {cartItems.map((item) => {
                  const product = item.product;
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
                    product.status === 'Sold Out' ||
                    product.status === 'Draft' ||
                    product.stock <= 0;

                  const hasStockDeficit =
                    !isSoldOut && product.stock < item.quantity;

                  const lineSubtotal = item.priceAtAdd * item.quantity;

                  return (
                    <div
                      key={item.productId}
                      className="p-5 sm:p-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between transition-colors hover:bg-[#FAF7F2]/50"
                    >
                      {/* Product Thumbnail & Basic Info */}
                      <div className="flex gap-4 items-center flex-1 min-w-0">
                        <Link
                          href={detailUrl}
                          className="relative w-20 h-24 sm:w-24 sm:h-28 rounded-2xl overflow-hidden bg-[#FAF7F2] border border-[#D4AF37]/30 flex-shrink-0 group"
                        >
                          <img
                            src={imageSrc}
                            alt={product.name}
                            className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                              isSoldOut ? 'grayscale-[30%] opacity-85' : ''
                            }`}
                          />
                          {isSoldOut && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <span className="text-[9px] font-bold text-white bg-red-600 px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                                Sold Out
                              </span>
                            </div>
                          )}
                        </Link>

                        <div className="flex-1 min-w-0 space-y-1">
                          <span className="text-[10px] uppercase font-bold tracking-widest text-[#D4AF37] block">
                            {product.department} • {product.category}
                          </span>

                          <Link
                            href={detailUrl}
                            className="font-serif text-base sm:text-lg text-[#1A1315] hover:text-[#6B0D2F] transition-colors font-medium line-clamp-2"
                          >
                            {product.name}
                          </Link>

                          {/* Unit Price (Price at time of adding) */}
                          <div className="flex items-baseline gap-2 pt-0.5">
                            <span className="text-xs text-[#6E676A]">Price per item:</span>
                            <span className="font-serif text-sm font-bold text-[#6B0D2F]">
                              ₹{item.priceAtAdd.toLocaleString('en-IN')}
                            </span>
                          </div>

                          {/* Live Stock Alert Messages */}
                          {isSoldOut && (
                            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-50 border border-red-200 text-red-700 text-[11px] font-semibold">
                              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                              <span>No longer available in store. Please remove to continue.</span>
                            </div>
                          )}

                          {hasStockDeficit && (
                            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold">
                              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 text-amber-600" />
                              <span>
                                Only {product.stock} units available (you have {item.quantity} in cart).
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Quantity Controls & Line Subtotal */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#D4AF37]/20">
                        {/* Stepper */}
                        <div className="inline-flex items-center border border-[#D4AF37]/50 rounded-xl bg-white shadow-xs p-0.5">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold text-[#1A1315] hover:bg-[#FAF7F2] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            -
                          </button>
                          <span className="w-9 text-center text-xs font-bold text-[#1A1315]">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            disabled={isSoldOut || item.quantity >= product.stock}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold text-[#1A1315] hover:bg-[#FAF7F2] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>

                        {/* Line Subtotal */}
                        <div className="text-right">
                          <span className="text-[10px] text-gray-400 block uppercase tracking-wider">
                            Subtotal
                          </span>
                          <span className="font-serif text-lg font-bold text-[#6B0D2F]">
                            ₹{lineSubtotal.toLocaleString('en-IN')}
                          </span>
                        </div>

                        {/* Remove Action */}
                        <button
                          onClick={() => removeFromCart(item.productId)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors cursor-pointer rounded-lg hover:bg-red-50"
                          title="Remove product"
                          aria-label={`Remove ${product.name} from cart`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Continue Shopping Link */}
              <div className="pt-2">
                <Link
                  href="/sarees"
                  className="inline-flex items-center gap-2 text-xs font-bold text-[#6B0D2F] hover:underline uppercase tracking-wider"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Continue Exploring Catalogue</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Order Summary Card (4 cols on lg) */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-3xl border border-[#D4AF37]/30 shadow-md p-6 sm:p-8 space-y-6">
                <h3 className="font-serif text-xl text-[#1A1315] pb-4 border-b border-[#D4AF37]/20">
                  Order Summary
                </h3>

                <div className="space-y-3 text-xs sm:text-sm">
                  <div className="flex justify-between text-[#6E676A]">
                    <span>Items Total ({totalCartCount} units)</span>
                    <span className="font-semibold text-[#1A1315]">
                      ₹{totalCartPrice.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex justify-between text-[#6E676A]">
                    <span>Shipping</span>
                    <span className="font-semibold text-emerald-700">
                      Calculated at checkout
                    </span>
                  </div>

                  <div className="flex justify-between text-[#6E676A]">
                    <span>Taxes & GST</span>
                    <span className="font-semibold text-gray-500">
                      Inclusive in item prices
                    </span>
                  </div>

                  <div className="pt-4 border-t border-[#D4AF37]/30 flex justify-between items-baseline">
                    <div>
                      <span className="font-bold text-[#1A1315] uppercase tracking-wider text-xs block">
                        Order Subtotal
                      </span>
                      <span className="text-[11px] text-[#6E676A]">
                        Excluding shipping fees
                      </span>
                    </div>
                    <span className="font-serif text-2xl sm:text-3xl font-bold text-[#6B0D2F]">
                      ₹{totalCartPrice.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Order via WhatsApp CTA */}
                <div className="space-y-3 pt-2">
                  {orderError && (
                    <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5 animate-fadeIn">
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

                  <button
                    type="button"
                    onClick={handleOrderViaWhatsApp}
                    disabled={isOrderingWhatsApp || hasSoldOutItems}
                    className="w-full py-4 px-6 rounded-2xl bg-[#128C7E] hover:bg-[#0E6C61] text-white font-serif text-sm sm:text-base font-semibold tracking-wide transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed border border-emerald-400/40 group"
                  >
                    {isOrderingWhatsApp ? (
                      <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <svg
                        className="w-5 h-5 fill-current text-white shrink-0 group-hover:scale-110 transition-transform"
                        viewBox="0 0 24 24"
                      >
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                      </svg>
                    )}
                    <span>
                      Order via WhatsApp ({totalCartCount}{' '}
                      {totalCartCount === 1 ? 'item' : 'items'})
                    </span>
                  </button>

                  <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#D4AF37]/30 text-xs text-[#6E676A] leading-relaxed space-y-1">
                    <div className="flex items-center gap-1.5 font-semibold text-[#1A1315]">
                      <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>Direct WhatsApp Handloom Confirmation</span>
                    </div>
                    <p className="text-[11px]">
                      Orders are received directly by our store owner over WhatsApp. Your bag items will remain safely stored here so you can review them at any time.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={clearCart}
                    className="w-full py-2.5 text-xs text-gray-500 hover:text-red-600 transition-colors border border-gray-200 hover:border-red-200 rounded-xl cursor-pointer"
                  >
                    Clear All Items in Bag
                  </button>
                </div>

                {/* Assurances & Trust Details */}
                <div className="space-y-3 pt-4 border-t border-[#D4AF37]/20 text-xs text-[#6E676A]">
                  <div className="flex items-center gap-2.5">
                    <Truck className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
                    <span>Safe packaging and reliable pan-India courier dispatch.</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
                    <span>100% Authentic handloom and silk weaves guaranteed.</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <RefreshCw className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
                    <span>7-Day customer return and exchange policy.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}

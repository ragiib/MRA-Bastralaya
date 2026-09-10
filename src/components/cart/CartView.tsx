'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useShop } from '@/context/ShopContext';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import {
  ShoppingBag,
  Trash2,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  AlertCircle,
  Truck,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  Info,
} from 'lucide-react';

export default function CartView() {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalCartCount,
    totalCartPrice,
  } = useShop();

  const [showCheckoutNotice, setShowCheckoutNotice] = useState(false);

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

                {/* Checkout CTA */}
                <div className="space-y-3 pt-2">
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={() => setShowCheckoutNotice(true)}
                    className="!py-4 shadow-xl text-sm uppercase tracking-wider cursor-pointer"
                  >
                    Proceed to Checkout <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>

                  {/* Phase K Checkout Notice */}
                  {showCheckoutNotice && (
                    <div className="p-4 rounded-2xl bg-[#F3ECE2] border border-[#D4AF37] space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-[#6B0D2F] flex-shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-[#6B0D2F] uppercase tracking-wider">
                            Checkout Arriving in Phase K
                          </h4>
                          <p className="text-xs text-[#1A1315] leading-relaxed">
                            Full digital checkout with address entry, payment gateways, and order placement is coming in the next release (Phase K).
                          </p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#D4AF37]/30 flex justify-between items-center text-xs">
                        <span className="text-[#6E676A] font-medium">
                          Store Desk: +91 98300 00000
                        </span>
                        <button
                          onClick={() => setShowCheckoutNotice(false)}
                          className="text-xs text-[#6B0D2F] font-bold hover:underline cursor-pointer"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  )}
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

'use client';

import React from 'react';
import { useShop } from '@/context/ShopContext';
import { X, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import Button from './Button';

export default function CartDrawer() {
  const { isCartOpen, toggleCart, cartItems, removeFromCart, totalCartPrice } = useShop();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => toggleCart(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF7F2] shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-6 bg-[#6B0D2F] text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-5 h-5 text-[#D4AF37]" />
              <h2 className="font-serif text-lg tracking-wide">Your Shopping Bag ({cartItems.length})</h2>
            </div>
            <button
              onClick={() => toggleCart(false)}
              className="p-2 text-white/80 hover:text-white transition-colors"
              aria-label="Close Cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 divide-y divide-[#D4AF37]/20">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-[#6E676A]">
                <ShoppingBag className="w-16 h-16 text-[#D4AF37]/40 mb-4 stroke-1" />
                <h3 className="font-serif text-xl text-[#1A1315] mb-2">Your Bag is Empty</h3>
                <p className="text-xs max-w-xs mb-6">Explore our authentic Kanjeevaram and Banarasi handloom collections to add items.</p>
                <Button variant="gold" size="sm" onClick={() => toggleCart(false)}>
                  Start Shopping
                </Button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div key={item.product.id} className="py-4 flex gap-4 items-center">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-20 h-24 object-cover rounded-lg border border-[#D4AF37]/30 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] uppercase text-[#D4AF37] font-semibold">{item.product.fabric}</span>
                    <h4 className="font-serif text-sm font-medium text-[#1A1315] truncate">{item.product.name}</h4>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-[#6E676A]">Qty: {item.quantity}</span>
                      <span className="text-sm font-semibold text-[#6B0D2F]">
                        ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Remove Item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {cartItems.length > 0 && (
            <div className="p-6 bg-white border-t border-[#D4AF37]/30 space-y-4">
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-[#6E676A]">Estimated Subtotal</span>
                <span className="font-serif text-xl font-bold text-[#6B0D2F]">
                  ₹{totalCartPrice.toLocaleString('en-IN')}
                </span>
              </div>
              <p className="text-[11px] text-gray-500">Taxes calculated at checkout. Free shipping across India included.</p>
              <Button variant="primary" fullWidth size="lg">
                Proceed to Checkout <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

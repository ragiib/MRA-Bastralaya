import React from 'react';
import { ShoppingBag, Sparkles } from 'lucide-react';

export default function AdminOrdersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-6 border-b border-white/10">
        <div>
          <h1 className="font-serif text-2xl text-[#FAF7F2]">Order Management</h1>
          <p className="text-xs text-gray-400 mt-1">
            Track customer orders, shipments, invoices, and fulfillment status.
          </p>
        </div>
      </div>

      <div className="p-12 text-center rounded-2xl bg-[#1E181A] border border-[#D4AF37]/20 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-[#251D20] text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h2 className="font-serif text-xl text-[#FAF7F2]">
            Ready for Phase 3: Order Processing & Checkout
          </h2>
          <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
            Order management will activate once checkout, payment, and inventory management are integrated in subsequent phases.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-300 text-xs border border-emerald-500/30">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Order Pipeline Placeholder</span>
        </div>
      </div>
    </div>
  );
}

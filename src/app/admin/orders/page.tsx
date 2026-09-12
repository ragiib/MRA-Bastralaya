import React from 'react';
import { OrderRepository } from '@/lib/repositories/order.repository';
import {
  ShoppingBag,
  Calendar,
  Phone,
  MapPin,
  MessageCircle,
  Package,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  const orders = OrderRepository.listOrders(100);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif text-2xl sm:text-3xl text-[#FAF7F2]">WhatsApp Orders</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold uppercase tracking-wider">
              Live Feed
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Order requests received via WhatsApp buttons with customer snapshots and item breakdowns ({orders.length} orders recorded).
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#1E181A] border border-[#D4AF37]/20 space-y-3">
          <ShoppingBag className="w-10 h-10 text-gray-500 mx-auto" />
          <h2 className="font-serif text-lg text-[#FAF7F2]">No Orders Recorded Yet</h2>
          <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
            When customers tap &ldquo;Order via WhatsApp&rdquo; on product pages or from their shopping bag, their order attempts and delivery snapshots will appear here instantly.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((ord) => {
            const cleanCustomerPhone = ord.customerPhone.replace(/\D/g, '');
            const customerWaUrl = `https://wa.me/${cleanCustomerPhone}`;

            return (
              <div
                key={ord.id}
                className="rounded-2xl bg-[#1E181A] border border-[#D4AF37]/25 p-5 sm:p-6 space-y-4 hover:border-[#D4AF37]/50 transition-colors shadow-md"
              >
                {/* Header row: ID, Date, Status, Total */}
                <div className="flex flex-wrap items-start sm:items-center justify-between gap-3 pb-4 border-b border-white/10 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#FAF7F2] text-sm sm:text-base">
                        {ord.id}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-medium tracking-wide">
                        {ord.status}
                      </span>
                    </div>
                    <span className="flex items-center gap-1.5 text-gray-400 text-[11px]">
                      <Calendar className="w-3.5 h-3.5 text-gray-500" />
                      <span>
                        {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-gray-400 uppercase tracking-wider text-[10px]">
                      Order Value:
                    </span>
                    <span className="font-serif text-xl sm:text-2xl font-bold text-[#D4AF37]">
                      ₹{ord.total.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Customer Snapshot & WhatsApp Action */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-[#251D20] text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-gray-400 block tracking-wider mb-1">
                      Customer Name
                    </span>
                    <span className="font-medium text-[#FAF7F2] text-sm">
                      {ord.customerName}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-semibold text-gray-400 block tracking-wider mb-1">
                      Phone / WhatsApp
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-300 flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>{ord.customerPhone}</span>
                      </span>
                      <a
                        href={customerWaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-[10px] font-semibold border border-emerald-500/30 transition-colors"
                        title="Chat with customer on WhatsApp"
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span>Chat</span>
                      </a>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-semibold text-gray-400 block tracking-wider mb-1">
                      Delivery Address
                    </span>
                    <span className="text-gray-300 flex items-start gap-1 leading-relaxed">
                      <MapPin className="w-3.5 h-3.5 text-[#D4AF37] shrink-0 mt-0.5" />
                      <span>{ord.customerAddress}</span>
                    </span>
                  </div>
                </div>

                {/* Ordered Items Table */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                    <Package className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Items Requested ({ord.items.length})</span>
                  </div>

                  <div className="rounded-xl overflow-hidden border border-white/5">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#20181A] text-gray-400 text-[10px] uppercase tracking-wider">
                        <tr>
                          <th className="py-2.5 px-4 font-semibold">Product</th>
                          <th className="py-2.5 px-4 font-semibold">Category</th>
                          <th className="py-2.5 px-4 font-semibold text-center">Qty</th>
                          <th className="py-2.5 px-4 font-semibold text-right">Unit Price</th>
                          <th className="py-2.5 px-4 font-semibold text-right">Line Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 bg-[#1A1416]">
                        {ord.items.map((item, idx) => (
                          <tr key={idx} className="text-gray-300">
                            <td className="py-2.5 px-4 font-medium text-[#FAF7F2]">
                              {item.name}
                            </td>
                            <td className="py-2.5 px-4 text-gray-400 text-[11px]">
                              {item.department ? `${item.department} · ` : ''}
                              {item.category || 'Handloom'}
                            </td>
                            <td className="py-2.5 px-4 text-center font-bold text-[#D4AF37]">
                              {item.quantity}
                            </td>
                            <td className="py-2.5 px-4 text-right text-gray-400">
                              ₹{item.price.toLocaleString('en-IN')}
                            </td>
                            <td className="py-2.5 px-4 text-right font-semibold text-[#FAF7F2]">
                              ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Order, ORDER_STATUSES, OrderStatus } from '@/types/order';
import OrderStatusBadge from '@/components/orders/OrderStatusBadge';
import {
  ShoppingBag,
  Calendar,
  Phone,
  MapPin,
  MessageCircle,
  Package,
  RotateCcw,
  Search,
  CheckCircle2,
  X,
  Printer,
  ChevronRight,
  Clock,
  Send,
  FileText,
} from 'lucide-react';

interface AdminOrdersManagerProps {
  initialOrders: Order[];
}

export default function AdminOrdersManager({ initialOrders }: AdminOrdersManagerProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [selectedOrderForModal, setSelectedOrderForModal] = useState<Order | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((prev) => (prev === message ? null : prev));
    }, 4500);
  };

  // Refetch orders from database
  const refreshOrders = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch('/api/admin/orders');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.orders)) {
          setOrders(data.orders);
          if (selectedOrderForModal) {
            const fresh = data.orders.find((o: Order) => o.id === selectedOrderForModal.id);
            if (fresh) setSelectedOrderForModal(fresh);
          }
          showToast('Order feed refreshed successfully.');
        }
      }
    } catch (err) {
      console.error('Failed to refresh orders', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [selectedOrderForModal]);

  // Handle status update
  const handleStatusChange = async (orderId: string, newStatus: OrderStatus | string) => {
    const previousOrder = orders.find((o) => o.id === orderId);
    if (!previousOrder || previousOrder.status === newStatus) return;

    setUpdatingOrderId(orderId);

    // Optimistically update locally
    setOrders((prev) =>
      prev.map((ord) =>
        ord.id === orderId
          ? { ...ord, status: newStatus, updatedAt: new Date().toISOString() }
          : ord
      )
    );

    if (selectedOrderForModal?.id === orderId) {
      setSelectedOrderForModal((prev) =>
        prev
          ? { ...prev, status: newStatus, updatedAt: new Date().toISOString() }
          : null
      );
    }

    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();

      if (!res.ok) {
        setOrders((prev) =>
          prev.map((ord) => (ord.id === orderId ? previousOrder : ord))
        );
        if (selectedOrderForModal?.id === orderId) {
          setSelectedOrderForModal(previousOrder);
        }
        alert(data.error || 'Failed to update order status.');
      } else {
        showToast(`Order #${orderId} status updated to "${newStatus}".`);
      }
    } catch {
      setOrders((prev) =>
        prev.map((ord) => (ord.id === orderId ? previousOrder : ord))
      );
      if (selectedOrderForModal?.id === orderId) {
        setSelectedOrderForModal(previousOrder);
      }
      alert('Network error while saving order status.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Status metrics counts
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      All: orders.length,
      Pending: 0,
      Confirmed: 0,
      Shipped: 0,
      Delivered: 0,
      Cancelled: 0,
    };

    for (const ord of orders) {
      const s =
        ord.status === 'Pending - Awaiting WhatsApp Confirmation' ? 'Pending' : ord.status;
      if (counts[s] !== undefined) {
        counts[s]++;
      }
    }

    return counts;
  }, [orders]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      const normStatus =
        ord.status === 'Pending - Awaiting WhatsApp Confirmation' ? 'Pending' : ord.status;

      if (selectedStatus !== 'All' && normStatus !== selectedStatus) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = ord.id.toLowerCase().includes(q);
        const matchName = ord.customerName.toLowerCase().includes(q);
        const matchPhone = ord.customerPhone.toLowerCase().includes(q);
        const matchAddress = ord.customerAddress.toLowerCase().includes(q);
        return matchId || matchName || matchPhone || matchAddress;
      }

      return true;
    });
  }, [orders, selectedStatus, searchQuery]);

  // WhatsApp quick update message generator
  const getWhatsAppStatusUpdateUrl = (order: Order, status: string) => {
    const cleanPhone = order.customerPhone.replace(/\D/g, '');
    let text = '';

    switch (status) {
      case 'Confirmed':
        text = `Namaste ${order.customerName} ji, your order #${order.id} for ₹${order.total.toLocaleString('en-IN')} has been CONFIRMED by MRA Bastralaya! We are preparing your handloom items for packing.`;
        break;
      case 'Shipped':
        text = `Namaste ${order.customerName} ji, exciting news! Your order #${order.id} from MRA Bastralaya has been DISPATCHED and is on its way to ${order.customerAddress}.`;
        break;
      case 'Delivered':
        text = `Namaste ${order.customerName} ji, your order #${order.id} from MRA Bastralaya has been successfully DELIVERED! Thank you for choosing our heritage handloom collection.`;
        break;
      case 'Cancelled':
        text = `Namaste ${order.customerName} ji, order #${order.id} from MRA Bastralaya has been CANCELLED. Please feel free to message us if you need any assistance.`;
        break;
      default:
        text = `Namaste ${order.customerName} ji, regarding your order #${order.id} from MRA Bastralaya (Status: ${status}).`;
    }

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#FAF7F2] font-normal">
            WhatsApp Orders
          </h1>
          <p className="text-sm text-gray-300 mt-1">
            Review customer orders received via WhatsApp and update their delivery progress ({orders.length} total orders).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={refreshOrders}
            disabled={isRefreshing}
            className="px-4 py-2.5 rounded-xl bg-[#1E181A] hover:bg-[#251D20] text-gray-300 hover:text-white border border-white/10 text-sm font-medium transition-colors cursor-pointer flex items-center gap-2"
          >
            <RotateCcw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#D4AF37]' : ''}`} />
            <span>Refresh Orders</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-700 text-emerald-200 text-sm flex items-center justify-between animate-fadeIn shadow-md">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-gray-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-5 rounded-2xl bg-[#1E181A] border border-[#D4AF37]/20 space-y-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {(['All', ...ORDER_STATUSES] as const).map((st) => {
            const isSelected = selectedStatus === st;
            const count = statusCounts[st] || 0;

            return (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                  isSelected
                    ? 'bg-[#D4AF37] text-[#1A1315] font-bold shadow-sm'
                    : 'bg-[#140F11] text-gray-300 hover:text-white border border-white/5'
                }`}
              >
                <span>{st}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    isSelected
                      ? 'bg-[#1A1315]/20 text-[#1A1315] font-bold'
                      : 'bg-white/10 text-gray-300'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Field */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Order ID, customer name, phone number, or delivery address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#140F11] border border-white/10 rounded-xl pl-11 pr-10 py-3 text-sm text-[#FAF7F2] placeholder-gray-400 focus:outline-none focus:border-[#D4AF37] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#1E181A] border border-[#D4AF37]/20 space-y-3">
          <ShoppingBag className="w-12 h-12 text-gray-500 mx-auto" />
          <h2 className="font-serif text-xl text-[#FAF7F2]">No Orders Found</h2>
          <p className="text-sm text-gray-300 max-w-md mx-auto leading-relaxed">
            {searchQuery || selectedStatus !== 'All'
              ? 'No orders match the current search or filter. Try clearing the search box or selecting "All".'
              : 'When customers place orders via WhatsApp on your website, their orders will appear here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredOrders.map((ord) => {
            const cleanCustomerPhone = ord.customerPhone.replace(/\D/g, '');
            const customerWaUrl = `https://wa.me/${cleanCustomerPhone}`;
            const isUpdating = updatingOrderId === ord.id;
            const normStatus =
              ord.status === 'Pending - Awaiting WhatsApp Confirmation'
                ? 'Pending'
                : ord.status;

            return (
              <div
                key={ord.id}
                className="rounded-2xl bg-[#1E181A] border border-[#D4AF37]/25 p-6 space-y-5 hover:border-[#D4AF37]/50 transition-colors shadow-md"
              >
                {/* Header row: ID, Date, Status Changer, Total */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-mono font-bold text-[#FAF7F2] text-base">
                        {ord.id}
                      </span>
                      <OrderStatusBadge status={normStatus} theme="dark" size="sm" />
                    </div>

                    <div className="flex items-center gap-4 text-gray-400 text-xs flex-wrap">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>
                          Placed:{' '}
                          {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </span>

                      {ord.updatedAt && ord.updatedAt !== ord.createdAt && (
                        <span className="flex items-center gap-1 text-gray-400">
                          <Clock className="w-3.5 h-3.5" />
                          <span>
                            Updated:{' '}
                            {new Date(ord.updatedAt).toLocaleDateString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status Dropdown Changer & Total */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                    {/* Status Dropdown */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-300">
                        Status:
                      </span>
                      <div className="relative">
                        <select
                          value={normStatus}
                          disabled={isUpdating}
                          onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                          className={`bg-[#140F11] border rounded-xl px-3.5 py-2 text-sm text-[#FAF7F2] font-semibold focus:outline-none focus:border-[#D4AF37] transition-all cursor-pointer ${
                            isUpdating
                              ? 'opacity-50 border-amber-500'
                              : 'border-[#D4AF37]/50 hover:border-[#D4AF37]'
                          }`}
                        >
                          {ORDER_STATUSES.map((statusOption) => (
                            <option
                              key={statusOption}
                              value={statusOption}
                              className="bg-[#1E181A] text-[#FAF7F2]"
                            >
                              {statusOption}
                            </option>
                          ))}
                        </select>
                        {isUpdating && (
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                        )}
                      </div>
                    </div>

                    <div className="flex items-baseline gap-2 text-right pl-3 border-l border-white/10 sm:border-0 sm:pl-0">
                      <span className="text-gray-400 text-xs">Total:</span>
                      <span className="font-serif text-xl sm:text-2xl font-bold text-[#D4AF37]">
                        ₹{ord.total.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Customer Snapshot & WhatsApp Action */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-[#251D20] text-sm">
                  <div>
                    <span className="text-xs font-semibold text-gray-400 block mb-1">
                      Customer Name
                    </span>
                    <span className="font-medium text-[#FAF7F2]">
                      {ord.customerName}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-gray-400 block mb-1">
                      WhatsApp Phone
                    </span>
                    <div className="flex items-center gap-2.5">
                      <span className="text-gray-200 flex items-center gap-1.5">
                        <Phone className="w-4 h-4 text-[#D4AF37]" />
                        <span>{ord.customerPhone}</span>
                      </span>
                      <a
                        href={customerWaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-xs font-semibold border border-emerald-500/30 transition-colors"
                        title="Chat with customer on WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Chat</span>
                      </a>
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-gray-400 block mb-1">
                      Delivery Address
                    </span>
                    <span className="text-gray-200 flex items-start gap-1.5 leading-relaxed">
                      <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                      <span>{ord.customerAddress}</span>
                    </span>
                  </div>
                </div>

                {/* Ordered Items Preview */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-gray-300 font-medium">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-[#D4AF37]" />
                      <span>Items in this Order ({ord.items.length})</span>
                    </div>

                    <button
                      onClick={() => setSelectedOrderForModal(ord)}
                      className="text-[#D4AF37] hover:text-[#E5C358] text-xs font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>View Full Order Details</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="rounded-xl overflow-hidden border border-white/5">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-[#20181A] text-gray-400 text-xs uppercase tracking-wider">
                        <tr>
                          <th className="py-3 px-4 font-semibold">Product</th>
                          <th className="py-3 px-4 font-semibold">Category</th>
                          <th className="py-3 px-4 font-semibold text-center">Qty</th>
                          <th className="py-3 px-4 font-semibold text-right">Price</th>
                          <th className="py-3 px-4 font-semibold text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 bg-[#1A1416]">
                        {ord.items.map((item, idx) => (
                          <tr key={idx} className="text-gray-200">
                            <td className="py-3 px-4 font-medium text-[#FAF7F2]">
                              {item.name}
                            </td>
                            <td className="py-3 px-4 text-gray-400 text-xs">
                              {item.department ? `${item.department} · ` : ''}
                              {item.category || 'Handloom'}
                            </td>
                            <td className="py-3 px-4 text-center font-bold text-[#D4AF37]">
                              {item.quantity}
                            </td>
                            <td className="py-3 px-4 text-right text-gray-300">
                              ₹{item.price.toLocaleString('en-IN')}
                            </td>
                            <td className="py-3 px-4 text-right font-semibold text-[#FAF7F2]">
                              ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Bottom Quick Action Bar */}
                <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 font-medium">
                      WhatsApp Message:
                    </span>
                    <a
                      href={getWhatsAppStatusUpdateUrl(ord, normStatus)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#251D20] hover:bg-[#2E2428] text-emerald-400 hover:text-emerald-300 border border-emerald-500/20 text-xs font-medium transition-colors"
                      title="Send pre-written status message to customer on WhatsApp"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send &quot;{normStatus}&quot; Alert</span>
                    </a>
                  </div>

                  <button
                    onClick={() => setSelectedOrderForModal(ord)}
                    className="px-4 py-2 rounded-xl bg-[#251D20] hover:bg-[#2F2428] border border-white/10 text-gray-200 hover:text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-[#D4AF37]" />
                    <span>View Order Details</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full Order Detail Modal */}
      {selectedOrderForModal && (
        <OrderDetailModal
          order={selectedOrderForModal}
          onClose={() => setSelectedOrderForModal(null)}
          onStatusChange={handleStatusChange}
          isUpdating={updatingOrderId === selectedOrderForModal.id}
          getWhatsAppStatusUpdateUrl={getWhatsAppStatusUpdateUrl}
        />
      )}
    </div>
  );
}

interface OrderDetailModalProps {
  order: Order;
  onClose: () => void;
  onStatusChange: (orderId: string, status: OrderStatus | string) => Promise<void>;
  isUpdating: boolean;
  getWhatsAppStatusUpdateUrl: (order: Order, status: string) => string;
}

function OrderDetailModal({
  order,
  onClose,
  onStatusChange,
  isUpdating,
  getWhatsAppStatusUpdateUrl,
}: OrderDetailModalProps) {
  const normStatus =
    order.status === 'Pending - Awaiting WhatsApp Confirmation' ? 'Pending' : order.status;
  const cleanCustomerPhone = order.customerPhone.replace(/\D/g, '');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="bg-[#1E181A] border border-[#D4AF37]/30 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="p-6 border-b border-white/10 flex items-start justify-between gap-4 bg-[#251D20]">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-mono text-lg font-bold text-[#FAF7F2]">
                Order: {order.id}
              </span>
              <OrderStatusBadge status={normStatus} theme="dark" size="md" />
            </div>
            <p className="text-sm text-gray-300 mt-1 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>
                Placed on{' '}
                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              title="Print Order Receipt"
              className="p-2.5 rounded-xl bg-[#1A1416] hover:bg-[#2E2428] text-gray-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
            >
              <Printer className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-[#1A1416] hover:bg-[#2E2428] text-gray-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Status Changer Banner inside Modal */}
          <div className="p-4 rounded-xl bg-[#140F11] border border-[#D4AF37]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-sm font-semibold text-[#FAF7F2] block">
                Update Order Status
              </span>
              <span className="text-xs text-gray-400">
                Change status to reflect customer communication
              </span>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={normStatus}
                disabled={isUpdating}
                onChange={(e) => onStatusChange(order.id, e.target.value)}
                className="bg-[#1E181A] border border-[#D4AF37]/50 rounded-xl px-4 py-2 text-sm text-[#FAF7F2] font-semibold focus:outline-none focus:border-[#D4AF37] cursor-pointer"
              >
                {ORDER_STATUSES.map((st) => (
                  <option key={st} value={st} className="bg-[#1E181A] text-[#FAF7F2]">
                    Set as: {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Customer & Delivery Snapshot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#251D20] border border-white/5 space-y-2 text-sm">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                Customer Information
              </span>
              <div className="text-base font-semibold text-[#FAF7F2]">{order.customerName}</div>
              <div className="text-gray-200 flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#D4AF37]" />
                <span>{order.customerPhone}</span>
              </div>
              <div className="pt-2">
                <a
                  href={`https://wa.me/${cleanCustomerPhone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold border border-emerald-500/30 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Direct WhatsApp Chat</span>
                </a>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#251D20] border border-white/5 space-y-2 text-sm">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                Delivery Address
              </span>
              <div className="text-gray-200 flex items-start gap-2 leading-relaxed">
                <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                <span>{order.customerAddress}</span>
              </div>
            </div>
          </div>

          {/* Items Breakdown Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-gray-300 font-medium">
              <span className="flex items-center gap-2">
                <Package className="w-4 h-4 text-[#D4AF37]" />
                <span>Ordered Items ({order.items.length})</span>
              </span>
              <span>
                Total Units:{' '}
                {order.items.reduce((sum, it) => sum + (Number(it.quantity) || 1), 0)}
              </span>
            </div>

            <div className="rounded-xl overflow-hidden border border-white/10">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#140F11] text-gray-400 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Item</th>
                    <th className="py-3 px-4 font-semibold text-center">Quantity</th>
                    <th className="py-3 px-4 font-semibold text-right">Price</th>
                    <th className="py-3 px-4 font-semibold text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 bg-[#1E181A]">
                  {order.items.map((item, idx) => (
                    <tr key={idx} className="text-gray-200">
                      <td className="py-3 px-4">
                        <div className="font-medium text-[#FAF7F2]">{item.name}</div>
                        <div className="text-xs text-gray-400">
                          {item.department ? `${item.department} · ` : ''}
                          {item.category || 'Handloom'}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-[#D4AF37]">
                        {item.quantity}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-300">
                        ₹{item.price.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-[#FAF7F2]">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-[#140F11] border-t border-white/10">
                  <tr>
                    <td colSpan={3} className="py-3 px-4 text-right text-sm font-semibold text-gray-300">
                      Total Order Amount:
                    </td>
                    <td className="py-3 px-4 text-right font-serif text-lg font-bold text-[#D4AF37]">
                      ₹{order.total.toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Quick WhatsApp Alert Buttons */}
          <div className="p-4 rounded-xl bg-[#251D20] border border-white/5 space-y-3">
            <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider block">
              Send WhatsApp Alert to Customer
            </span>
            <p className="text-xs text-gray-400">
              Tap any button below to open WhatsApp with a polite, pre-written notification message for this customer:
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {(['Confirmed', 'Shipped', 'Delivered', 'Cancelled'] as const).map((st) => (
                <a
                  key={st}
                  href={getWhatsAppStatusUpdateUrl(order, st)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#140F11] hover:bg-[#1E181A] border border-white/10 hover:border-[#D4AF37]/50 text-xs font-medium text-gray-200 hover:text-white transition-colors"
                >
                  <Send className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Send &quot;{st}&quot; Notice</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-5 border-t border-white/10 bg-[#251D20] flex items-center justify-between">
          <span className="text-xs text-gray-400">
            MRA Bastralaya Admin
          </span>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#C29F2F] text-[#1A1315] text-sm font-semibold transition-colors cursor-pointer"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}

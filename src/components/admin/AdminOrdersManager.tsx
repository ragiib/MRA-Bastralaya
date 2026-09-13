'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Order, ORDER_STATUSES, OrderStatus } from '@/types/order';
import OrderStatusBadge from '@/components/orders/OrderStatusBadge';
import { getWhatsAppPhone } from '@/lib/utils/phone';
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
  Send,
  FileText,
  Trash2,
  AlertTriangle,
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

  // Deletion state
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [isDeletingOrder, setIsDeletingOrder] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

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

  // Handle hard delete single order
  const handleConfirmDeleteOrder = async () => {
    if (!orderToDelete) return;
    const targetId = orderToDelete.id;
    setIsDeletingOrder(true);

    try {
      const res = await fetch(`/api/admin/orders/${targetId}`, { method: 'DELETE' });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Failed to delete order.');
        return;
      }

      setOrders((prev) => prev.filter((o) => o.id !== targetId));
      if (selectedOrderForModal?.id === targetId) {
        setSelectedOrderForModal(null);
      }
      setOrderToDelete(null);
      showToast(`Order #${targetId} was permanently deleted.`);
    } catch {
      alert('Network error while attempting to delete order.');
    } finally {
      setIsDeletingOrder(false);
    }
  };

  // Handle bulk delete all cancelled orders
  const handleConfirmBulkDeleteCancelled = async () => {
    setIsBulkDeleting(true);

    try {
      const res = await fetch('/api/admin/orders?status=Cancelled', { method: 'DELETE' });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Failed to delete cancelled orders.');
        return;
      }

      setOrders((prev) => prev.filter((o) => o.status !== 'Cancelled'));
      if (selectedOrderForModal?.status === 'Cancelled') {
        setSelectedOrderForModal(null);
      }
      setShowBulkDeleteModal(false);
      showToast(`Successfully deleted ${data.deletedCount || 0} cancelled orders.`);
    } catch {
      alert('Network error while deleting cancelled orders.');
    } finally {
      setIsBulkDeleting(false);
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

  // WhatsApp quick update message generator with guaranteed country code
  const getWhatsAppStatusUpdateUrl = (order: Order, status: string) => {
    const cleanPhone = getWhatsAppPhone(order.customerPhone);
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
          <h1 className="text-2xl sm:text-3xl text-[#FAF7F2] font-bold tracking-tight">
            Customer Orders
          </h1>
          <p className="text-sm text-gray-300 mt-1">
            Review incoming orders, send WhatsApp updates, and manage delivery workflow ({orders.length} total orders).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={refreshOrders}
            disabled={isRefreshing}
            className="px-4 py-2.5 rounded-xl bg-[#1E181A] hover:bg-[#251D20] text-gray-300 hover:text-white border border-white/10 text-sm font-medium transition-colors cursor-pointer flex items-center gap-2"
          >
            <RotateCcw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#D4AF37]' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-200 text-sm flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-gray-400 hover:text-white p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-5 rounded-2xl bg-[#1E181A] border border-white/10 space-y-4">
        {/* Status Filter Tabs & Bulk Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {(['All', ...ORDER_STATUSES] as const).map((st) => {
              const isSelected = selectedStatus === st;
              const count = statusCounts[st] || 0;

              return (
                <button
                  key={st}
                  onClick={() => setSelectedStatus(st)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                    isSelected
                      ? 'bg-[#D4AF37] text-[#1A1315] font-bold shadow-sm'
                      : 'bg-[#140F11] text-gray-300 hover:text-white border border-white/5'
                  }`}
                >
                  <span>{st}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      isSelected
                        ? 'bg-[#1A1315]/20 text-[#1A1315]'
                        : 'bg-white/10 text-gray-300'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Bulk cleanup option for cancelled orders */}
          {statusCounts.Cancelled > 0 && (
            <button
              onClick={() => setShowBulkDeleteModal(true)}
              className="px-3 py-1.5 rounded-xl bg-rose-950/30 hover:bg-rose-950/60 text-rose-300 border border-rose-900/40 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
              title="Permanently remove all cancelled orders"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Clean Up Cancelled ({statusCounts.Cancelled})</span>
            </button>
          )}
        </div>

        {/* Live Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Order ID, Customer Name, Phone, or Delivery Address..."
            className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#140F11] border border-white/10 text-sm text-[#FAF7F2] placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Orders List / Empty State */}
      {filteredOrders.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#1E181A] border border-white/10 space-y-4">
          <ShoppingBag className="w-12 h-12 text-gray-500 mx-auto" />
          <h2 className="text-xl font-semibold text-[#FAF7F2]">No Orders Found</h2>
          <p className="text-sm text-gray-300 max-w-md mx-auto leading-relaxed">
            {searchQuery || selectedStatus !== 'All'
              ? 'No orders match the current search or filter. Try clearing the search box or selecting "All".'
              : 'When customers place orders via WhatsApp on your website, their orders will appear here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((ord) => {
            const cleanCustomerPhone = getWhatsAppPhone(ord.customerPhone);
            const customerWaUrl = `https://wa.me/${cleanCustomerPhone}`;
            const isUpdating = updatingOrderId === ord.id;
            const normStatus =
              ord.status === 'Pending - Awaiting WhatsApp Confirmation'
                ? 'Pending'
                : ord.status;

            return (
              <div
                key={ord.id}
                className="rounded-2xl bg-[#1E181A] border border-white/10 p-5 sm:p-6 space-y-5 hover:border-white/20 transition-colors shadow-sm"
              >
                {/* Order Card Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-mono text-base sm:text-lg font-bold text-[#FAF7F2]">
                        Order #{ord.id}
                      </span>
                      <OrderStatusBadge status={normStatus} theme="dark" size="sm" />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Status Selector & Total Price */}
                  <div className="flex items-center gap-4 justify-between sm:justify-end">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-300">
                        Status:
                      </span>
                      <div className="relative">
                        <select
                          value={normStatus}
                          disabled={isUpdating}
                          onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                          className={`bg-[#140F11] border rounded-xl px-3 py-1.5 text-xs text-[#FAF7F2] font-semibold focus:outline-none focus:border-[#D4AF37] transition-all cursor-pointer ${
                            isUpdating
                              ? 'opacity-50 border-amber-500'
                              : 'border-white/15 hover:border-white/30'
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
                      <span className="text-xl sm:text-2xl font-bold text-[#D4AF37]">
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
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-950/50 text-emerald-300 hover:bg-emerald-900/50 text-xs font-semibold border border-emerald-800/40 transition-colors"
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
                  <div className="flex items-center justify-between text-xs text-gray-300 font-medium">
                    <div className="flex items-center gap-2">
                      <Package className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>Items in this Order ({ord.items.length})</span>
                    </div>
                  </div>

                  <div className="divide-y divide-white/5 bg-[#171113] rounded-xl border border-white/5 overflow-hidden">
                    {ord.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 sm:p-4 flex items-center justify-between gap-4 text-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-10 h-10 object-cover rounded-lg bg-gray-800 shrink-0 border border-white/10"
                            />
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-[#FAF7F2] truncate">
                              {item.name}
                            </p>
                            <p className="text-gray-400">
                              {item.department ? `${item.department} · ` : ''}
                              {item.category || 'Handloom'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 shrink-0 text-right">
                          <div>
                            <span className="text-gray-400">Qty: </span>
                            <span className="font-bold text-[#FAF7F2]">{item.quantity}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Subtotal: </span>
                            <span className="font-bold text-[#D4AF37]">
                              ₹{item.subtotal.toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <a
                      href={getWhatsAppStatusUpdateUrl(ord, normStatus)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-800/40 text-xs font-semibold transition-colors flex items-center gap-1.5"
                      title="Send customer a WhatsApp message regarding current status"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send &quot;{normStatus}&quot; Alert</span>
                    </a>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedOrderForModal(ord)}
                      className="px-4 py-2 rounded-xl bg-[#251D20] hover:bg-[#2F2428] border border-white/10 text-gray-200 hover:text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <FileText className="w-4 h-4 text-[#D4AF37]" />
                      <span>View Details</span>
                    </button>

                    <button
                      onClick={() => setOrderToDelete(ord)}
                      className="p-2 rounded-xl bg-rose-950/30 hover:bg-rose-950/60 text-rose-300 border border-rose-900/40 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                      title="Delete this order"
                    >
                      <Trash2 className="w-4 h-4 text-rose-400" />
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  </div>
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
          onDeleteClick={(ord) => setOrderToDelete(ord)}
          isUpdating={updatingOrderId === selectedOrderForModal.id}
          getWhatsAppStatusUpdateUrl={getWhatsAppStatusUpdateUrl}
        />
      )}

      {/* Single Order Deletion Confirmation Modal */}
      {orderToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#1E181A] border border-rose-900/40 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-950/50 flex items-center justify-center border border-rose-900/40 shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#FAF7F2]">Permanently Delete Order?</h3>
                <p className="text-xs text-gray-400">Order #{orderToDelete.id}</p>
              </div>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
              Are you sure you want to permanently delete this order for <strong>{orderToDelete.customerName}</strong> (₹{orderToDelete.total.toLocaleString('en-IN')})? This will hard delete the order from the database and cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setOrderToDelete(null)}
                disabled={isDeletingOrder}
                className="px-4 py-2 rounded-xl bg-[#251D20] text-gray-300 hover:text-white text-xs font-semibold border border-white/10 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteOrder}
                disabled={isDeletingOrder}
                className="px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeletingOrder ? 'Deleting...' : 'Delete Permanently'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Cancelled Deletion Confirmation Modal */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#1E181A] border border-rose-900/40 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-950/50 flex items-center justify-center border border-rose-900/40 shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#FAF7F2]">Delete All Cancelled Orders?</h3>
                <p className="text-xs text-gray-400">{statusCounts.Cancelled} orders selected</p>
              </div>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
              Are you sure you want to permanently delete all <strong>{statusCounts.Cancelled} cancelled orders</strong>? They will be permanently removed from the database and cannot be recovered.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowBulkDeleteModal(false)}
                disabled={isBulkDeleting}
                className="px-4 py-2 rounded-xl bg-[#251D20] text-gray-300 hover:text-white text-xs font-semibold border border-white/10 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBulkDeleteCancelled}
                disabled={isBulkDeleting}
                className="px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isBulkDeleting ? 'Deleting...' : `Delete All ${statusCounts.Cancelled} Orders`}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface OrderDetailModalProps {
  order: Order;
  onClose: () => void;
  onStatusChange: (orderId: string, status: OrderStatus | string) => Promise<void>;
  onDeleteClick: (order: Order) => void;
  isUpdating: boolean;
  getWhatsAppStatusUpdateUrl: (order: Order, status: string) => string;
}

function OrderDetailModal({
  order,
  onClose,
  onStatusChange,
  onDeleteClick,
  isUpdating,
  getWhatsAppStatusUpdateUrl,
}: OrderDetailModalProps) {
  const normStatus =
    order.status === 'Pending - Awaiting WhatsApp Confirmation' ? 'Pending' : order.status;
  const cleanCustomerPhone = getWhatsAppPhone(order.customerPhone);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="bg-[#1E181A] border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="p-6 border-b border-white/10 flex items-start justify-between gap-4 bg-[#251D20]">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-mono text-lg font-bold text-[#FAF7F2]">
                Order: #{order.id}
              </span>
              <OrderStatusBadge status={normStatus} theme="dark" size="md" />
            </div>
            <p className="text-xs text-gray-400 mt-1 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" />
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
              className="p-2 rounded-xl bg-[#1A1416] hover:bg-[#2E2428] text-gray-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[#1A1416] hover:bg-[#2E2428] text-gray-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Status Changer Banner inside Modal */}
          <div className="p-4 rounded-xl bg-[#140F11] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
                className="bg-[#1E181A] border border-white/20 rounded-xl px-3 py-1.5 text-xs text-[#FAF7F2] font-semibold focus:outline-none focus:border-[#D4AF37] cursor-pointer"
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
              <div className="text-gray-200 flex items-center gap-2 text-xs">
                <Phone className="w-4 h-4 text-[#D4AF37]" />
                <span>{order.customerPhone}</span>
              </div>
              <div className="pt-2">
                <a
                  href={`https://wa.me/${cleanCustomerPhone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/50 hover:bg-emerald-900/50 text-emerald-300 text-xs font-semibold border border-emerald-800/40 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Direct WhatsApp Chat</span>
                </a>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#251D20] border border-white/5 space-y-2 text-sm">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                Delivery Address
              </span>
              <div className="text-gray-200 flex items-start gap-2 leading-relaxed text-xs">
                <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                <span>{order.customerAddress}</span>
              </div>
            </div>
          </div>

          {/* Items Breakdown Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-300 font-medium">
              <span className="flex items-center gap-2">
                <Package className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Ordered Items ({order.items.length})</span>
              </span>
              <span>
                Total Units:{' '}
                {order.items.reduce((sum, it) => sum + (Number(it.quantity) || 1), 0)}
              </span>
            </div>

            <div className="rounded-xl overflow-hidden border border-white/10">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#140F11] text-gray-400 uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Item</th>
                    <th className="py-2.5 px-4 font-semibold text-center">Qty</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Price</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 bg-[#1E181A]">
                  {order.items.map((item, idx) => (
                    <tr key={idx} className="text-gray-200">
                      <td className="py-2.5 px-4">
                        <div className="font-medium text-[#FAF7F2]">{item.name}</div>
                        <div className="text-[11px] text-gray-400">
                          {item.department ? `${item.department} · ` : ''}
                          {item.category || 'Handloom'}
                        </div>
                      </td>
                      <td className="py-2.5 px-4 text-center font-bold text-[#D4AF37]">
                        {item.quantity}
                      </td>
                      <td className="py-2.5 px-4 text-right text-gray-300">
                        ₹{item.price.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 px-4 text-right font-bold text-[#FAF7F2]">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-[#140F11] border-t border-white/10">
                  <tr>
                    <td colSpan={3} className="py-3 px-4 text-right text-xs font-semibold text-gray-300">
                      Total Order Amount:
                    </td>
                    <td className="py-3 px-4 text-right text-base font-bold text-[#D4AF37]">
                      ₹{order.total.toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Quick WhatsApp Alert Buttons */}
          <div className="p-4 rounded-xl bg-[#251D20] border border-white/5 space-y-2">
            <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider block">
              Send WhatsApp Alert to Customer
            </span>
            <p className="text-xs text-gray-400">
              Tap any button below to open WhatsApp with a pre-formatted notification:
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {(['Confirmed', 'Shipped', 'Delivered', 'Cancelled'] as const).map((st) => (
                <a
                  key={st}
                  href={getWhatsAppStatusUpdateUrl(order, st)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#140F11] hover:bg-[#1E181A] border border-white/10 hover:border-white/20 text-xs font-medium text-gray-200 hover:text-white transition-colors"
                >
                  <Send className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Send &quot;{st}&quot; Notice</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/10 bg-[#251D20] flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              onDeleteClick(order);
            }}
            className="px-3.5 py-2 rounded-xl bg-rose-950/30 hover:bg-rose-950/60 text-rose-300 border border-rose-900/40 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>Delete Order</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#C29F2F] text-[#1A1315] text-xs font-semibold transition-colors cursor-pointer"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import Link from 'next/link';
import { UserRepository } from '@/lib/repositories/user.repository';
import { ProductRepository } from '@/lib/repositories/product.repository';
import { OrderRepository } from '@/lib/repositories/order.repository';
import {
  Users,
  Shirt,
  ShoppingBag,
  Plus,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  PhoneCall,
} from 'lucide-react';

export default async function AdminDashboardPage() {
  const metrics = UserRepository.countMetrics();
  const productMetrics = ProductRepository.countMetrics();
  const orderCount = OrderRepository.countOrders();
  const orderMetrics = OrderRepository.countMetrics();

  const summaryCards = [
    {
      title: 'Customer Orders',
      value: `${orderCount}`,
      subtext: `${orderMetrics.Pending || 0} Pending · ${orderMetrics.Confirmed || 0} Confirmed`,
      icon: ShoppingBag,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      href: '/admin/orders',
    },
    {
      title: 'Store Products',
      value: `${productMetrics.total}`,
      subtext: `${productMetrics.sarees} Sarees · ${productMetrics.suits} Suits · ${productMetrics.bedSheets} Sheets`,
      icon: Shirt,
      color: 'text-[#D4AF37]',
      bgColor: 'bg-[#D4AF37]/10',
      href: '/admin/products',
    },
    {
      title: 'Registered Customers',
      value: `${metrics.customers}`,
      subtext: 'Accounts with saved addresses',
      icon: Users,
      color: 'text-sky-400',
      bgColor: 'bg-sky-500/10',
      href: '/admin/customers',
    },
    {
      title: 'Store Status',
      value: 'Online',
      subtext: 'Ready to receive WhatsApp orders',
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      href: '/admin/settings',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#FAF7F2] font-normal">
            Store Overview
          </h1>
          <p className="text-sm text-gray-300 mt-1">
            Welcome back! Here is a summary of your products, customer orders, and store activity.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products/new"
            className="px-4 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#C29F2F] text-[#1A1315] text-sm font-semibold transition-all shadow-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>

          <Link
            href="/"
            target="_blank"
            className="px-4 py-2.5 rounded-xl bg-[#251D20] hover:bg-[#2F2428] border border-white/10 text-sm text-gray-200 hover:text-white transition-colors flex items-center gap-2"
          >
            <span>View Website</span>
            <ExternalLink className="w-4 h-4 text-gray-400" />
          </Link>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              href={card.href}
              className="p-6 rounded-2xl bg-[#1E181A] border border-[#D4AF37]/20 hover:border-[#D4AF37]/50 transition-all shadow-md group block space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-300">{card.title}</span>
                <div className={`p-2.5 rounded-xl ${card.bgColor} ${card.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div>
                <div className="text-3xl font-serif font-bold text-[#FAF7F2]">{card.value}</div>
                <div className="text-xs text-gray-400 mt-1.5">{card.subtext}</div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Main Action Shortcuts */}
      <div className="space-y-4">
        <h2 className="text-lg font-medium text-[#FAF7F2]">Quick Actions</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Quick Action 1: Orders */}
          <Link
            href="/admin/orders"
            className="p-6 rounded-2xl bg-[#1E181A] border border-[#D4AF37]/20 hover:border-[#D4AF37]/50 transition-all group flex items-start justify-between gap-4"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-base font-semibold text-[#FAF7F2] group-hover:text-[#D4AF37] transition-colors">
                <ShoppingBag className="w-5 h-5 text-amber-400" />
                <span>Process Customer Orders</span>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">
                Check WhatsApp order requests, view customer delivery addresses, and update order statuses (Confirmed, Shipped, Delivered).
              </p>
              <div className="pt-2 flex items-center gap-1.5 text-xs font-semibold text-[#D4AF37]">
                <span>Go to Orders</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Quick Action 2: Add Product */}
          <Link
            href="/admin/products/new"
            className="p-6 rounded-2xl bg-[#1E181A] border border-[#D4AF37]/20 hover:border-[#D4AF37]/50 transition-all group flex items-start justify-between gap-4"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-base font-semibold text-[#FAF7F2] group-hover:text-[#D4AF37] transition-colors">
                <Plus className="w-5 h-5 text-[#D4AF37]" />
                <span>Add a New Saree or Product</span>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">
                Upload new sarees, ladies suits, or bed sheets with photographs, prices, fabric specifications, and stock quantities.
              </p>
              <div className="pt-2 flex items-center gap-1.5 text-xs font-semibold text-[#D4AF37]">
                <span>Add Product</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Quick Action 3: Products Catalogue */}
          <Link
            href="/admin/products"
            className="p-6 rounded-2xl bg-[#1E181A] border border-[#D4AF37]/20 hover:border-[#D4AF37]/50 transition-all group flex items-start justify-between gap-4"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-base font-semibold text-[#FAF7F2] group-hover:text-[#D4AF37] transition-colors">
                <Shirt className="w-5 h-5 text-[#D4AF37]" />
                <span>Manage Existing Products</span>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">
                Edit prices, mark items as out of stock, change photos, or archive products from your store catalogue.
              </p>
              <div className="pt-2 flex items-center gap-1.5 text-xs font-semibold text-[#D4AF37]">
                <span>View Products List</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Quick Action 4: Customer Directory */}
          <Link
            href="/admin/customers"
            className="p-6 rounded-2xl bg-[#1E181A] border border-[#D4AF37]/20 hover:border-[#D4AF37]/50 transition-all group flex items-start justify-between gap-4"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-base font-semibold text-[#FAF7F2] group-hover:text-[#D4AF37] transition-colors">
                <Users className="w-5 h-5 text-sky-400" />
                <span>Customer Directory</span>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">
                View registered customers, their contact phone numbers, and delivery addresses on file.
              </p>
              <div className="pt-2 flex items-center gap-1.5 text-xs font-semibold text-[#D4AF37]">
                <span>View Customers</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Helpful Order Guide Panel */}
      <div className="p-6 sm:p-7 rounded-2xl bg-[#1E181A] border border-[#D4AF37]/20 space-y-3">
        <div className="flex items-center gap-2 text-[#D4AF37]">
          <PhoneCall className="w-5 h-5" />
          <h3 className="font-serif text-lg text-[#FAF7F2] font-normal">
            How WhatsApp Ordering Works
          </h3>
        </div>
        <p className="text-sm text-gray-300 leading-relaxed max-w-3xl">
          When customers browse your website and tap <strong>&ldquo;Order via WhatsApp&rdquo;</strong>, an order record is created in your <strong>Orders</strong> list. You can chat with them directly on WhatsApp to confirm delivery, pack the items, and update the status from <em>Pending</em> to <em>Confirmed</em> or <em>Shipped</em>.
        </p>
      </div>
    </div>
  );
}

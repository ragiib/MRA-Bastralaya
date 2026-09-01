import React from 'react';
import Link from 'next/link';
import { UserRepository } from '@/lib/repositories/user.repository';
import { ProductRepository } from '@/lib/repositories/product.repository';
import {
  Users,
  Shirt,
  ShoppingBag,
  Layers,
  ShieldCheck,
  ArrowUpRight,
  Sparkles,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';

export default async function AdminDashboardPage() {
  const metrics = UserRepository.countMetrics();
  const productMetrics = ProductRepository.countMetrics();

  const cards = [
    {
      title: 'Registered Customers',
      value: metrics.customers.toString(),
      subtext: 'Real-time database records',
      icon: Users,
      color: 'text-sky-400',
      href: '/admin/customers',
    },
    {
      title: 'Catalogue Products',
      value: `${productMetrics.total} Items`,
      subtext: `${productMetrics.sarees} Sarees · ${productMetrics.suits} Suits · ${productMetrics.bedSheets} Sheets`,
      icon: Shirt,
      color: 'text-[#D4AF37]',
      href: '/admin/products',
    },
    {
      title: 'Store Orders',
      value: 'Pending Phase 3',
      subtext: 'Order Processing & Checkout',
      icon: ShoppingBag,
      color: 'text-emerald-400',
      href: '/admin/orders',
    },
    {
      title: 'Handloom Categories',
      value: '18 Active',
      subtext: '14 Sarees · 3 Suits · 1 Bed Sheets',
      icon: Layers,
      color: 'text-amber-400',
      href: '/admin/products',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl text-[#FAF7F2] font-normal">
              Store Executive Dashboard
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold uppercase tracking-wider">
              Live & Secure
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            MRA Bastralaya Management Console · Phase 1: Authentication & RBAC Foundation Complete
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            className="px-4 py-2 rounded-xl bg-[#251D20] hover:bg-[#2F2529] border border-[#D4AF37]/30 text-xs text-[#FAF7F2] font-medium transition-colors flex items-center gap-1.5"
          >
            <span>View Public Store</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#D4AF37]" />
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              href={card.href}
              className="p-5 rounded-2xl bg-[#1E181A] border border-[#D4AF37]/20 hover:border-[#D4AF37]/60 transition-all shadow-md group block"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-400 font-medium">{card.title}</span>
                <div className="p-2 rounded-xl bg-[#251D20] text-gray-300 group-hover:text-[#D4AF37] transition-colors">
                  <Icon className={`w-4 h-4 ${card.color}`} />
                </div>
              </div>
              <div className="text-2xl font-serif text-[#FAF7F2] font-semibold">{card.value}</div>
              <div className="text-[11px] text-gray-500 mt-1">{card.subtext}</div>
            </Link>
          );
        })}
      </div>

      {/* Architecture & Security Status Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Security Enforcements */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#1E181A] border border-[#D4AF37]/20 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg text-[#FAF7F2] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
              <span>Server-Side Security Enforcements</span>
            </h2>
            <span className="text-[10px] text-emerald-400 uppercase tracking-wider font-bold">
              100% Operational
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-[#140F11] border border-white/5 space-y-2">
              <div className="flex items-center gap-2 text-[#FAF7F2] font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Single Unified Auth Model</span>
              </div>
              <p className="text-gray-400 text-[11px] leading-relaxed">
                One database, one authentication engine with strict server-side CUSTOMER / ADMIN roles.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#140F11] border border-white/5 space-y-2">
              <div className="flex items-center gap-2 text-[#FAF7F2] font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Zero Public Admin Sign-up</span>
              </div>
              <p className="text-gray-400 text-[11px] leading-relaxed">
                Public registration strictly hardcodes CUSTOMER role. Admin accounts are provisioned exclusively server-side.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#140F11] border border-white/5 space-y-2">
              <div className="flex items-center gap-2 text-[#FAF7F2] font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>HttpOnly Cryptographic Session</span>
              </div>
              <p className="text-gray-400 text-[11px] leading-relaxed">
                Signed JWT session tokens stored in HttpOnly, SameSite=Lax cookies, immune to XSS theft.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#140F11] border border-white/5 space-y-2">
              <div className="flex items-center gap-2 text-[#FAF7F2] font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Two-Layer Server Route Guards</span>
              </div>
              <p className="text-gray-400 text-[11px] leading-relaxed">
                Protected at both Edge Next.js Middleware and Server Component layout execution via requireAdmin().
              </p>
            </div>
          </div>
        </div>

        {/* Next Phase Preparation Panel */}
        <div className="p-6 rounded-2xl bg-[#1E181A] border border-[#D4AF37]/20 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[#D4AF37]">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs uppercase font-bold tracking-widest">Roadmap Status</span>
            </div>
            <h3 className="font-serif text-lg text-[#FAF7F2]">Ready for Phase 2: Product Management</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              With the secure authentication foundation in place, the next phase will introduce the complete Admin Product CRUD system:
            </p>
            <ul className="space-y-1.5 text-xs text-gray-300">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                <span>Add / Edit / Archive Sarees</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                <span>Manage Ladies Suits & Bed Sheets</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                <span>Live Catalogue Synchronization</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-white/10">
            <div className="flex items-center gap-2 text-[11px] text-gray-500">
              <KeyRound className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Admin Session Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

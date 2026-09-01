'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SafeUser } from '@/types/auth';
import {
  User,
  Package,
  MapPin,
  LogOut,
  ShieldCheck,
  Calendar,
  Phone,
  Mail,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface AccountViewProps {
  user: SafeUser;
}

export default function AccountView({ user }: AccountViewProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'addresses'>('profile');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
      router.refresh();
    } catch {
      router.push('/login');
    }
  };

  const formattedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Member';

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-10 px-4 sm:px-6 lg:px-8 selection:bg-[#D4AF37]/30 selection:text-[#6B0D2F]">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Navigation Breadcrumb / Top Bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#6E676A] hover:text-[#6B0D2F] transition-colors"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Return to Storefront</span>
          </Link>

          {user.role === 'ADMIN' && (
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1A1315] text-[#D4AF37] text-xs font-medium tracking-wider hover:bg-black transition-colors"
            >
              <span>Admin Portal</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          )}
        </div>

        {/* Profile Banner */}
        <div className="bg-white rounded-2xl shadow-md border border-[#D4AF37]/30 p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-radial from-[#D4AF37]/10 via-transparent to-transparent pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#6B0D2F] text-[#D4AF37] flex items-center justify-center font-serif text-2xl sm:text-3xl font-bold shadow-md">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-serif text-2xl sm:text-3xl text-[#1A1315] font-normal">
                    {user.name}
                  </h1>
                  <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#6B0D2F] border border-[#D4AF37]/40">
                    {user.role === 'ADMIN' ? 'Administrator' : 'Valued Customer'}
                  </span>
                </div>
                <p className="text-xs text-[#6E676A] mt-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{user.email}</span>
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 text-xs font-medium uppercase tracking-wider transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{isLoggingOut ? 'Signing Out...' : 'Sign Out'}</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 border-b border-[#D4AF37]/20 pb-px overflow-x-auto">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 py-3 px-5 text-xs font-medium uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'profile'
                ? 'border-[#6B0D2F] text-[#6B0D2F]'
                : 'border-transparent text-[#6E676A] hover:text-[#1A1315]'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile Information</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 py-3 px-5 text-xs font-medium uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'orders'
                ? 'border-[#6B0D2F] text-[#6B0D2F]'
                : 'border-transparent text-[#6E676A] hover:text-[#1A1315]'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Order History</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-gray-100 text-gray-600">
              0
            </span>
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`flex items-center gap-2 py-3 px-5 text-xs font-medium uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'addresses'
                ? 'border-[#6B0D2F] text-[#6B0D2F]'
                : 'border-transparent text-[#6E676A] hover:text-[#1A1315]'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Saved Addresses</span>
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
            {/* Account Details Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#D4AF37]/20 p-6 space-y-5">
              <h2 className="font-serif text-lg text-[#1A1315] font-normal flex items-center gap-2">
                <User className="w-4 h-4 text-[#D4AF37]" />
                <span>Personal Credentials</span>
              </h2>

              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-[#6E676A] uppercase tracking-wider block text-[10px]">
                    Full Name
                  </span>
                  <span className="text-sm font-medium text-[#1A1315] mt-0.5 block">
                    {user.name}
                  </span>
                </div>

                <div>
                  <span className="text-[#6E676A] uppercase tracking-wider block text-[10px]">
                    Registered Email
                  </span>
                  <span className="text-sm font-medium text-[#1A1315] mt-0.5 block">
                    {user.email}
                  </span>
                </div>

                <div>
                  <span className="text-[#6E676A] uppercase tracking-wider block text-[10px]">
                    Contact Phone
                  </span>
                  <span className="text-sm font-medium text-[#1A1315] mt-0.5 block flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    <span>{user.phone || 'Not provided'}</span>
                  </span>
                </div>

                <div>
                  <span className="text-[#6E676A] uppercase tracking-wider block text-[10px]">
                    Member Since
                  </span>
                  <span className="text-sm font-medium text-[#1A1315] mt-0.5 block flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span>{formattedDate}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Security & Authenticity Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#D4AF37]/20 p-6 space-y-5 flex flex-col justify-between">
              <div>
                <h2 className="font-serif text-lg text-[#1A1315] font-normal flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                  <span>Account Security & Trust</span>
                </h2>

                <p className="text-xs text-[#6E676A] mt-3 leading-relaxed">
                  Your session is protected with modern server-side cryptographic verification and HttpOnly cookie security.
                  Your passwords are encrypted using bcrypt hashing.
                </p>

                <div className="mt-5 space-y-3">
                  <div className="flex items-center gap-2.5 text-xs text-[#1A1315]">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Role Enforcement: {user.role}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-[#1A1315]">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>HttpOnly Session Active</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-[#6E676A]">Heritage Handloom Promise</span>
                <span className="text-[#D4AF37] font-serif tracking-wider">Est. 1980</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-white rounded-2xl shadow-sm border border-[#D4AF37]/20 p-10 text-center space-y-4 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-[#FAF7F2] border border-[#D4AF37]/40 text-[#6B0D2F] flex items-center justify-center mx-auto">
              <Package className="w-7 h-7" />
            </div>
            <h3 className="font-serif text-xl text-[#1A1315]">No Active Orders Yet</h3>
            <p className="text-xs text-[#6E676A] max-w-md mx-auto leading-relaxed">
              You haven't placed any orders yet. When you purchase authentic handloom sarees, ladies suits, or bed sheets, tracking and invoice details will appear here.
            </p>
            <div className="pt-2">
              <Link
                href="/sarees"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#6B0D2F] hover:bg-[#540924] text-white rounded-xl text-xs font-medium uppercase tracking-wider transition-colors shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Explore Saree Catalogue</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {activeTab === 'addresses' && (
          <div className="bg-white rounded-2xl shadow-sm border border-[#D4AF37]/20 p-10 text-center space-y-4 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-[#FAF7F2] border border-[#D4AF37]/40 text-[#6B0D2F] flex items-center justify-center mx-auto">
              <MapPin className="w-7 h-7" />
            </div>
            <h3 className="font-serif text-xl text-[#1A1315]">No Saved Addresses</h3>
            <p className="text-xs text-[#6E676A] max-w-md mx-auto leading-relaxed">
              Saved delivery addresses will be enabled during the forthcoming checkout and shipping integration phase.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

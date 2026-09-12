'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { SafeUser } from '@/types/auth';
import {
  LayoutDashboard,
  Shirt,
  ShoppingBag,
  Users,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Store,
} from 'lucide-react';

interface AdminShellProps {
  user: SafeUser;
  children: React.ReactNode;
}

export default function AdminShell({ user, children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const navItems = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Products', href: '/admin/products', icon: Shirt },
    { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
    { label: 'Customers', href: '/admin/customers', icon: Users },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch {
      router.push('/admin/login');
    }
  };

  return (
    <div className="min-h-screen bg-[#140F11] text-[#FAF7F2] flex flex-col selection:bg-[#D4AF37]/30 selection:text-[#FAF7F2]">
      {/* Top Admin Header Bar */}
      <header className="sticky top-0 z-40 bg-[#1E181A] border-b border-[#D4AF37]/20 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Toggle Navigation"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/admin" className="flex items-center gap-2.5">
            <span className="font-serif text-lg sm:text-xl tracking-wider text-[#FAF7F2]">
              MRA BASTRALAYA
            </span>
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-semibold">
              Admin
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-3 sm:gap-6">
          {/* View Website Link */}
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#251D20] hover:bg-[#2F2428] text-xs sm:text-sm text-gray-200 hover:text-[#D4AF37] border border-white/10 transition-colors"
          >
            <Store className="w-4 h-4 text-[#D4AF37]" />
            <span className="hidden sm:inline">View Website</span>
            <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
          </Link>

          <div className="h-5 w-px bg-white/10 hidden sm:block" />

          {/* Admin User Greeting & Logout */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#D4AF37] text-[#1A1315] font-bold text-sm flex items-center justify-center shadow-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <span className="hidden md:inline text-sm font-medium text-gray-200">
              {user.name}
            </span>
          </div>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/30 hover:bg-red-950/60 text-red-300 border border-red-900/30 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
            title="Sign Out of Admin"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">
              {isLoggingOut ? 'Signing Out...' : 'Sign Out'}
            </span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar Navigation */}
        <aside className="hidden lg:flex flex-col w-64 bg-[#1A1315] border-r border-[#D4AF37]/15 p-5 justify-between">
          <div className="space-y-4">
            <div className="px-3 pb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Menu
              </span>
            </div>

            <nav className="space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-[#D4AF37] text-[#1A1315] font-bold shadow-md'
                        : 'text-gray-300 hover:bg-[#251D20] hover:text-[#FAF7F2]'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-[#1A1315]' : 'text-[#D4AF37]'}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Simple Bottom Store Summary */}
          <div className="p-4 rounded-xl bg-[#221A1D] border border-white/5 space-y-1.5 text-xs text-gray-300">
            <div className="font-semibold text-[#D4AF37] text-sm">MRA Bastralaya</div>
            <div className="text-gray-400">Handloom Sarees &amp; Ethnic Wear</div>
            <div className="text-emerald-400 font-medium pt-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Store Live &amp; Online</span>
            </div>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="relative w-72 max-w-[85vw] bg-[#1A1315] border-r border-[#D4AF37]/20 p-6 flex flex-col justify-between z-10">
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div className="font-serif text-base tracking-wider text-[#FAF7F2]">
                    STORE MENU
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="space-y-2">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                          isActive
                            ? 'bg-[#D4AF37] text-[#1A1315] font-bold'
                            : 'text-gray-300 hover:bg-[#251D20]'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-6 border-t border-white/10 space-y-3">
                <Link
                  href="/"
                  target="_blank"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#251D20] text-sm text-gray-200 font-medium border border-white/10"
                >
                  <Store className="w-4 h-4 text-[#D4AF37]" />
                  <span>Open Storefront</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-950/40 text-sm text-red-300 font-medium border border-red-900/40"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Viewport */}
        <main className="flex-1 p-5 sm:p-8 lg:p-10 overflow-y-auto max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}

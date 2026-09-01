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
  ShieldCheck,
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
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Products', href: '/admin/products', icon: Shirt, badge: 'Phase 2' },
    { label: 'Orders', href: '/admin/orders', icon: ShoppingBag, badge: 'Phase 3' },
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
      {/* Top Admin Bar */}
      <header className="sticky top-0 z-40 bg-[#1E181A] border-b border-[#D4AF37]/20 px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-gray-300 hover:text-white"
            aria-label="Toggle Navigation"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/admin" className="flex items-center gap-2.5">
            <span className="font-serif text-lg tracking-widest text-[#FAF7F2] uppercase">
              MRA BASTRALAYA
            </span>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] text-[10px] font-bold uppercase tracking-wider">
              Admin Console
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <Link
            href="/"
            target="_blank"
            className="hidden sm:flex items-center gap-1.5 text-xs text-gray-300 hover:text-[#D4AF37] transition-colors"
          >
            <span>Live Storefront</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <div className="h-4 w-px bg-white/10 hidden sm:block" />

          {/* Admin User Summary */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#D4AF37] text-[#1A1315] font-bold text-xs flex items-center justify-center shadow-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="hidden md:block text-left">
              <div className="text-xs font-medium text-[#FAF7F2]">{user.name}</div>
              <div className="text-[10px] text-[#D4AF37] uppercase tracking-wider font-semibold">
                Super Admin
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="p-2 text-gray-400 hover:text-red-400 transition-colors"
            title="Sign Out of Admin"
            aria-label="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 bg-[#1A1315] border-r border-[#D4AF37]/15 p-4 justify-between">
          <div className="space-y-6">
            <div className="px-3 pt-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]/70">
                Core Management
              </span>
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-[#D4AF37] text-[#1A1315] font-semibold shadow-md'
                        : 'text-gray-300 hover:bg-[#251D20] hover:text-[#FAF7F2]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#1A1315]' : 'text-[#D4AF37]'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                          isActive
                            ? 'bg-[#1A1315]/20 text-[#1A1315]'
                            : 'bg-[#D4AF37]/15 text-[#D4AF37]'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Security Status Box */}
          <div className="p-3.5 rounded-xl bg-[#221A1D] border border-[#D4AF37]/20 text-[11px] space-y-2">
            <div className="flex items-center gap-1.5 text-[#D4AF37] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>RBAC Enforced</span>
            </div>
            <p className="text-gray-400 text-[10px] leading-relaxed">
              All admin actions strictly require verified ADMIN role in server session.
            </p>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-xs"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="relative w-64 max-w-[80vw] bg-[#1A1315] border-r border-[#D4AF37]/20 p-5 flex flex-col justify-between z-10">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <span className="font-serif text-sm tracking-wider text-[#D4AF37]">
                    ADMIN NAVIGATION
                  </span>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-400">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs ${
                          isActive
                            ? 'bg-[#D4AF37] text-[#1A1315] font-bold'
                            : 'text-gray-300 hover:bg-[#251D20]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-4 border-t border-white/10">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-950/40 rounded-lg"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Viewport */}
        <main className="flex-1 p-6 sm:p-8 lg:p-10 overflow-y-auto max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}

import React from 'react';
import { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WishlistView from '@/components/wishlist/WishlistView';
import CartDrawer from '@/components/ui/CartDrawer';
import QuickViewModal from '@/components/ui/QuickViewModal';
import ToastNotification from '@/components/ui/ToastNotification';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'My Wishlist | MRA Bastralaya',
  description:
    'View and manage your saved handloom sarees, ladies suits, and bed sheets at MRA Bastralaya.',
};

export default function WishlistPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FAF7F2]">
      <Header />
      <main className="flex-1">
        <WishlistView />
      </main>
      <Footer />
      <CartDrawer />
      <QuickViewModal />
      <ToastNotification />
    </div>
  );
}

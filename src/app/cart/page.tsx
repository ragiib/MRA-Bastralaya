import React from 'react';
import { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartView from '@/components/cart/CartView';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Shopping Cart | MRA Bastralaya',
  description:
    'Review your selected handcrafted sarees, salwar suits, and pure cotton bed sheets in your MRA Bastralaya shopping cart.',
};

export default function CartPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FAF7F2]">
      <Header />
      <main className="flex-1">
        <CartView />
      </main>
      <Footer />
    </div>
  );
}

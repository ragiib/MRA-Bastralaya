import React from 'react';
import { OrderRepository } from '@/lib/repositories/order.repository';
import AdminOrdersManager from '@/components/admin/AdminOrdersManager';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Order Management | Admin Portal | MRA Bastralaya',
  description: 'Manage WhatsApp order statuses and customer dispatch workflow.',
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminOrdersPage() {
  const orders = OrderRepository.listOrders(150);

  return <AdminOrdersManager initialOrders={orders} />;
}

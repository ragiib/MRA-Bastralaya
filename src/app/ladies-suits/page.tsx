import React from 'react';
import { Metadata } from 'next';
import LadiesSuitsCatalogue from '@/components/ladies-suits/LadiesSuitsCatalogue';
import { ProductRepository } from '@/lib/repositories/product.repository';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Ladies Suits Collection | Cotton Batik, Phulkari & Printed Cotton | MRA Bastralaya',
  description: 'Explore handcrafted Ladies Suits at MRA Bastralaya — Cotton Batik, Phulkari Cotton (All Types), and Printed Cotton salwar suits, unstitched dress materials, and ethnic sets.',
};

export default function LadiesSuitsPage() {
  const products = ProductRepository.getCustomerProducts({ department: 'Ladies Suits' });
  return <LadiesSuitsCatalogue initialCategorySlug="all" initialProducts={products} />;
}

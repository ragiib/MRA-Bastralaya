import React from 'react';
import { Metadata } from 'next';
import LadiesSuitsCatalogue from '@/components/ladies-suits/LadiesSuitsCatalogue';

export const metadata: Metadata = {
  title: 'Ladies Suits Collection | Cotton Batik, Phulkari & Printed Cotton | MRA Bastralaya',
  description: 'Explore handcrafted Ladies Suits at MRA Bastralaya — Cotton Batik, Phulkari Cotton (All Types), and Printed Cotton salwar suits, unstitched dress materials, and ethnic sets.',
};

export default function LadiesSuitsPage() {
  return <LadiesSuitsCatalogue initialCategorySlug="all" />;
}

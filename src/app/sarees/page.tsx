import React from 'react';
import { Metadata } from 'next';
import SareesCatalogue from '@/components/sarees/SareesCatalogue';

export const metadata: Metadata = {
  title: 'Sarees Collection | 14 Handcrafted Categories | MRA Bastralaya',
  description: 'Explore 14 dedicated saree categories at MRA Bastralaya — Printed Cotton, Tant Cotton, Pure Jamdani, Handloom, Baluchari, Tassar, Linen Silk and more.',
};

export default function SareesPage() {
  return <SareesCatalogue initialCategorySlug="all" />;
}

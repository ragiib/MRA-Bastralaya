import React from 'react';
import { Metadata } from 'next';
import BedSheetsCatalogue from '@/components/bed-sheets/BedSheetsCatalogue';
import { ProductRepository } from '@/lib/repositories/product.repository';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Bed Sheets Collection | Phulkari Handwork Pure Cotton Bed Sheets | MRA Bastralaya',
  description: 'Explore authentic Phulkari Handwork pure cotton bed sheets at MRA Bastralaya. Handcrafted Punjabi silk-thread embroidery, matching pillow covers, and luxurious everyday comfort.',
};

export default function BedSheetsPage() {
  const products = ProductRepository.getCustomerProducts({ department: 'Bed Sheets' });
  return <BedSheetsCatalogue initialCategorySlug="all" initialProducts={products} />;
}

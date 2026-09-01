import React from 'react';
import { Metadata } from 'next';
import BedSheetsCatalogue from '@/components/bed-sheets/BedSheetsCatalogue';

export const metadata: Metadata = {
  title: 'Bed Sheets Collection | Phulkari Handwork Pure Cotton Bed Sheets | MRA Bastralaya',
  description: 'Explore authentic Phulkari Handwork pure cotton bed sheets at MRA Bastralaya. Handcrafted Punjabi silk-thread embroidery, matching pillow covers, and luxurious everyday comfort.',
};

export default function BedSheetsPage() {
  return <BedSheetsCatalogue initialCategorySlug="all" />;
}

import React from 'react';
import { Metadata } from 'next';
import BedSheetsCatalogue from '@/components/bed-sheets/BedSheetsCatalogue';
import { BED_SHEET_CATEGORIES } from '@/data/bedSheetsData';
import { ProductRepository } from '@/lib/repositories/product.repository';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = BED_SHEET_CATEGORIES.find((c) => c.slug === slug);

  if (!category) {
    return {
      title: 'Bed Sheets Collection | MRA Bastralaya',
      description: 'Explore handcrafted pure cotton bed sheets at MRA Bastralaya.',
    };
  }

  return {
    title: `${category.name} | MRA Bastralaya`,
    description: category.shortDescription,
  };
}

export default async function BedSheetCategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const products = ProductRepository.getCustomerProducts({ department: 'Bed Sheets' });
  return <BedSheetsCatalogue initialCategorySlug={slug} initialProducts={products} />;
}

import React from 'react';
import { Metadata } from 'next';
import BedSheetsCatalogue from '@/components/bed-sheets/BedSheetsCatalogue';
import { BED_SHEET_CATEGORIES } from '@/data/bedSheetsData';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return BED_SHEET_CATEGORIES.map((cat) => ({
    slug: cat.slug,
  }));
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
  return <BedSheetsCatalogue initialCategorySlug={slug} />;
}

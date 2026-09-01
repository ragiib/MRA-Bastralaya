import React from 'react';
import { Metadata } from 'next';
import LadiesSuitsCatalogue from '@/components/ladies-suits/LadiesSuitsCatalogue';
import { LADIES_SUIT_CATEGORIES } from '@/data/ladiesSuitsData';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return LADIES_SUIT_CATEGORIES.map((cat) => ({
    slug: cat.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = LADIES_SUIT_CATEGORIES.find((c) => c.slug === slug);

  if (!category) {
    return {
      title: 'Ladies Suits Collection | MRA Bastralaya',
      description: 'Explore the complete Ladies Suits collection at MRA Bastralaya.',
    };
  }

  return {
    title: `${category.name} Ladies Suits | MRA Bastralaya`,
    description: category.shortDescription,
  };
}

export default async function LadiesSuitCategoryPage({ params }: PageProps) {
  const { slug } = await params;
  return <LadiesSuitsCatalogue initialCategorySlug={slug} />;
}

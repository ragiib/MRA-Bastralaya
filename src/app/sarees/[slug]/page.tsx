import React from 'react';
import { Metadata } from 'next';
import SareesCatalogue from '@/components/sarees/SareesCatalogue';
import { SAREE_CATEGORIES } from '@/data/sareesData';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return SAREE_CATEGORIES.map((cat) => ({
    slug: cat.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = SAREE_CATEGORIES.find((c) => c.slug === slug);

  if (!category) {
    return {
      title: 'Sarees Collection | MRA Bastralaya',
      description: 'Explore the complete Sarees collection at MRA Bastralaya.',
    };
  }

  return {
    title: `${category.name} Sarees | MRA Bastralaya`,
    description: category.shortDescription,
  };
}

export default async function SareeCategoryPage({ params }: PageProps) {
  const { slug } = await params;
  return <SareesCatalogue initialCategorySlug={slug} />;
}

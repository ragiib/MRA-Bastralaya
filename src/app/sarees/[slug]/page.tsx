import React from 'react';
import { Metadata } from 'next';
import SareesCatalogue from '@/components/sarees/SareesCatalogue';
import { SAREE_CATEGORIES } from '@/data/sareesData';
import { ProductRepository } from '@/lib/repositories/product.repository';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
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
  const products = ProductRepository.getCustomerProducts({ department: 'Sarees' });
  return <SareesCatalogue initialCategorySlug={slug} initialProducts={products} />;
}

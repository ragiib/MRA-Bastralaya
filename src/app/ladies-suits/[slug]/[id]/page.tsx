import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductDetailView from '@/components/product/ProductDetailView';
import { ProductRepository } from '@/lib/repositories/product.repository';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string; id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, id } = await params;
  const product = ProductRepository.getCustomerProductById(id);

  if (!product || product.department !== 'Ladies Suits' || product.categorySlug !== slug) {
    return {
      title: 'Product Not Found | MRA Bastralaya',
    };
  }

  return {
    title: `${product.name} | ${product.category} | MRA Bastralaya`,
    description: product.description.slice(0, 160),
    openGraph: {
      title: `${product.name} | MRA Bastralaya`,
      description: product.description.slice(0, 160),
      images: product.images && product.images.length > 0 ? [{ url: product.images[0] }] : [],
    },
  };
}

export default async function LadiesSuitProductDetailPage({ params }: PageProps) {
  const { slug, id } = await params;
  const product = ProductRepository.getCustomerProductById(id);

  // Strictly enforce existence, customer-visible status (non-draft), department, and category match
  if (!product || product.department !== 'Ladies Suits' || product.categorySlug !== slug) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FAF7F2]">
      <Header />
      <main className="flex-1">
        <ProductDetailView product={product} />
      </main>
      <Footer />
    </div>
  );
}

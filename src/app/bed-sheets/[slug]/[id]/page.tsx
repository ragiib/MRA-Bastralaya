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
  const product = await ProductRepository.getCustomerProductById(id);

  if (!product || product.department !== 'Bed Sheets' || product.categorySlug !== slug) {
    return {
      title: 'Product Not Found',
    };
  }

  const formattedPrice = `₹${product.price.toLocaleString('en-IN')}`;
  const title = `${product.name} - ${formattedPrice}`;
  const description = product.description && product.description.trim().length > 0
    ? (product.description.length > 160 ? `${product.description.slice(0, 157)}...` : product.description)
    : `${product.name} available at MRA Bastralaya for ${formattedPrice}. Explore authentic pure cotton bed sheets.`;
  const imageUrl = product.images && product.images.length > 0 && product.images[0]
    ? product.images[0]
    : '/brand/opengraph-image.png';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: imageUrl,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function BedSheetProductDetailPage({ params }: PageProps) {
  const { slug, id } = await params;
  const product = await ProductRepository.getCustomerProductById(id);

  // Strictly enforce existence, customer-visible status (non-draft), department, and category match
  if (!product || product.department !== 'Bed Sheets' || product.categorySlug !== slug) {
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

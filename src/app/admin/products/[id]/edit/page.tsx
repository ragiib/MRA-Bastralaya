import React from 'react';
import Link from 'next/link';
import { ProductRepository } from '@/lib/repositories/product.repository';
import ProductForm from '@/components/admin/ProductForm';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Edit Product | Admin Console',
  description: 'Edit product details, inventory, and specifications.',
};

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const product = ProductRepository.getById(id);

  if (!product) {
    return (
      <div className="p-12 text-center rounded-2xl bg-[#1E181A] border border-[#D4AF37]/20 space-y-4 max-w-md mx-auto my-12">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
        <h2 className="font-serif text-lg text-[#FAF7F2]">Product Not Found</h2>
        <p className="text-xs text-gray-400">
          The requested product ID (<code className="font-mono text-[#D4AF37]">{id}</code>) could not be located in the database.
        </p>
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#D4AF37] text-[#1A1315] text-xs font-semibold hover:bg-[#B8952B] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Products</span>
        </Link>
      </div>
    );
  }

  return <ProductForm mode="edit" initialProduct={product} />;
}

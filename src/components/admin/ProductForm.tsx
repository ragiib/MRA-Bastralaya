'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  DEPARTMENTS,
  DEPARTMENT_CATEGORIES,
  DepartmentType,
  ProductStatusType,
  SAREE_OCCASIONS,
  SUIT_SIZES,
  BED_SIZES,
} from '@/data/adminProductOptions';
import { ProductItem } from '@/types/product';
import {
  ArrowLeft,
  Upload,
  X,
  Sparkles,
  Info,
  CheckCircle,
  Shirt,
  Layers,
  Image as ImageIcon,
} from 'lucide-react';

interface ProductFormProps {
  mode: 'create' | 'edit';
  initialProduct?: ProductItem;
}

export default function ProductForm({ mode, initialProduct }: ProductFormProps) {
  const router = useRouter();

  // --- Form State ---
  // Section 1: Department & Category
  const [department, setDepartment] = useState<DepartmentType>(
    initialProduct?.department || 'Sarees'
  );
  const [categorySlug, setCategorySlug] = useState<string>(
    initialProduct?.categorySlug || 'printed-cotton'
  );

  // Section 2: Core Product Details
  const [name, setName] = useState(initialProduct?.name || '');
  const [price, setPrice] = useState<string>(
    initialProduct ? initialProduct.price.toString() : ''
  );
  const [salePrice, setSalePrice] = useState<string>(
    initialProduct?.salePrice ? initialProduct.salePrice.toString() : ''
  );
  const [stock, setStock] = useState<string>(
    initialProduct !== undefined ? initialProduct.stock.toString() : '10'
  );
  const [status, setStatus] = useState<ProductStatusType>(
    initialProduct?.status || 'Active'
  );
  const [description, setDescription] = useState(initialProduct?.description || '');

  // Section 3: Images
  const [images, setImages] = useState<string[]>(initialProduct?.images || []);
  const [imageError, setImageError] = useState('');
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  // Section 4: Department-Specific Attributes
  // Sarees
  const [fabric, setFabric] = useState(initialProduct?.fabric || 'Pure Cotton');
  const [blousePieceIncluded, setBlousePieceIncluded] = useState<boolean>(
    initialProduct?.blousePieceIncluded !== undefined
      ? initialProduct.blousePieceIncluded
      : true
  );
  const [workTechnique, setWorkTechnique] = useState(
    initialProduct?.workTechnique || 'Traditional Handloom Weave'
  );
  const [color, setColor] = useState(initialProduct?.color || '');
  const [occasion, setOccasion] = useState(
    initialProduct?.occasion || SAREE_OCCASIONS[0]
  );

  // Ladies Suits
  const [suitType, setSuitType] = useState<'Full Set' | 'Separate Pieces'>(
    initialProduct?.suitType || 'Full Set'
  );
  const [suitSize, setSuitSize] = useState(initialProduct?.size || SUIT_SIZES[0]);

  // Bed Sheets
  const [bedSize, setBedSize] = useState(initialProduct?.bedSize || BED_SIZES[3]);
  const [pillowCoversIncluded, setPillowCoversIncluded] = useState<boolean>(
    initialProduct?.pillowCoversIncluded !== undefined
      ? initialProduct.pillowCoversIncluded
      : true
  );

  // Form Validation & Feedback
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // When department changes, sync category & default fabric
  const handleDepartmentSelect = (dept: DepartmentType) => {
    setDepartment(dept);
    const availableCategories = DEPARTMENT_CATEGORIES[dept] || [];
    const exists = availableCategories.some((c) => c.slug === categorySlug);
    if (!exists && availableCategories.length > 0) {
      setCategorySlug(availableCategories[0].slug);
    }

    if (mode === 'create') {
      if (dept === 'Sarees') setFabric('Pure Cotton');
      if (dept === 'Ladies Suits') setFabric('Cotton');
      if (dept === 'Bed Sheets') setFabric('100% Pure Cotton (300 TC)');
    }
  };

  const handleCategoryChange = (slug: string) => {
    setCategorySlug(slug);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setImageError('');
    setIsUploadingImages(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
          setImageError('Only JPG, PNG, and WEBP image formats are supported.');
          break;
        }

        if (file.size > 5 * 1024 * 1024) {
          setImageError('Image size exceeds 5MB limit. Please upload a smaller image.');
          break;
        }

        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/admin/products/upload-image', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) {
          setImageError(data.error || 'Failed to upload image.');
          break;
        }

        if (data.url) {
          setImages((prev) => [...prev, data.url]);
        }
      }
    } catch {
      setImageError('Network error while uploading image.');
    } finally {
      setIsUploadingImages(false);
      e.target.value = '';
    }
  };

  const removeImage = async (indexToRemove: number) => {
    const urlToRemove = images[indexToRemove];
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));

    if (urlToRemove && urlToRemove.startsWith('/uploads/products/')) {
      try {
        await fetch('/api/admin/products/upload-image', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: urlToRemove }),
        });
      } catch {
        // Ignored
      }
    }
  };

  const makePrimary = (indexToPromote: number) => {
    if (indexToPromote === 0) return;
    setImages((prev) => {
      const copy = [...prev];
      const [selected] = copy.splice(indexToPromote, 1);
      return [selected, ...copy];
    });
  };

  const addSampleImage = (url: string) => {
    if (!images.includes(url)) {
      setImages((prev) => [...prev, url]);
    }
  };

  const getAvailableCategories = () => DEPARTMENT_CATEGORIES[department] || [];

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent, overrideStatus?: ProductStatusType) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim()) {
      setFormError('Please enter a product title/name.');
      return;
    }
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      setFormError('Please enter a valid regular price.');
      return;
    }

    const numSalePrice = salePrice ? parseFloat(salePrice) : null;
    if (numSalePrice !== null && numSalePrice >= numPrice) {
      setFormError('Sale price must be strictly less than the regular price.');
      return;
    }

    const numStock = parseInt(stock, 10);
    if (isNaN(numStock) || numStock < 0) {
      setFormError('Please specify a valid stock quantity.');
      return;
    }

    setIsSubmitting(true);

    const activeCat = getAvailableCategories().find((c) => c.slug === categorySlug);
    const categoryName = activeCat ? activeCat.name : categorySlug;

    const finalImages =
      images.length > 0
        ? images
        : department === 'Sarees'
        ? ['/images/sarees/01_printed_cotton.jpg']
        : department === 'Ladies Suits'
        ? ['/images/ladies-suits/cotton_batik.jpg']
        : ['/images/bed-sheets/phulkari_bedsheet_cat.jpg'];

    const payload = {
      name: name.trim(),
      department,
      category: categoryName,
      categorySlug,
      price: numPrice,
      salePrice: numSalePrice,
      stock: numStock,
      status: overrideStatus || status,
      description: description.trim() || 'Handcrafted traditional attire from MRA Bastralaya.',
      images: finalImages,

      // Sarees fields
      fabric: fabric.trim() || undefined,
      blousePieceIncluded: department === 'Sarees' ? blousePieceIncluded : undefined,
      workTechnique: department === 'Sarees' ? workTechnique.trim() : undefined,
      color: department === 'Sarees' || department === 'Ladies Suits' ? color.trim() : undefined,
      occasion: department === 'Sarees' ? occasion : undefined,

      // Ladies Suits fields
      suitType: department === 'Ladies Suits' ? suitType : undefined,
      size: department === 'Ladies Suits' ? suitSize : undefined,

      // Bed Sheets fields
      bedSize: department === 'Bed Sheets' ? bedSize : undefined,
      pillowCoversIncluded: department === 'Bed Sheets' ? pillowCoversIncluded : undefined,
    };

    try {
      if (mode === 'edit' && initialProduct) {
        const res = await fetch(`/api/admin/products/${initialProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok) {
          setFormError(data.error || 'Failed to update product.');
          setIsSubmitting(false);
          return;
        }

        router.push('/admin/products?updated=true');
        router.refresh();
      } else {
        const res = await fetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok) {
          setFormError(data.error || 'Failed to create product.');
          setIsSubmitting(false);
          return;
        }

        router.push('/admin/products?created=true');
        router.refresh();
      }
    } catch {
      setFormError('A network error occurred while saving the product.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/products"
            className="p-2.5 rounded-xl bg-[#1E181A] hover:bg-[#251D20] text-gray-300 hover:text-white border border-white/10 transition-colors"
            title="Return to products"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl text-[#FAF7F2] font-normal">
              {mode === 'edit' ? 'Edit Product' : 'Add New Product'}
            </h1>
            <p className="text-sm text-gray-300 mt-1">
              {mode === 'edit'
                ? `Updating "${initialProduct?.name || 'Product'}"`
                : 'Fill in the information below to add a new item to your store catalogue.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="px-4 py-2.5 rounded-xl border border-white/10 hover:bg-[#251D20] text-sm text-gray-300 font-medium transition-colors"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={(e) => handleSubmit(e)}
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#C29F2F] text-[#1A1315] text-sm font-semibold transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-60"
          >
            <CheckCircle className="w-4 h-4" />
            <span>
              {isSubmitting
                ? 'Saving...'
                : mode === 'edit'
                ? 'Save Changes'
                : 'Add Product'}
            </span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {formError && (
        <div className="p-4 rounded-xl bg-red-950/80 border border-red-800 text-red-200 text-sm flex items-center gap-2.5 animate-fadeIn">
          <Info className="w-5 h-5 text-red-400 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {/* Form Body */}
      <form onSubmit={(e) => handleSubmit(e)} className="space-y-8">
        {/* Section 1: Department & Category */}
        <div className="p-6 sm:p-7 rounded-2xl bg-[#1E181A] border border-[#D4AF37]/20 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-white/10">
            <div className="w-9 h-9 rounded-xl bg-[#251D20] text-[#D4AF37] flex items-center justify-center border border-[#D4AF37]/30">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-[#FAF7F2]">1. Department &amp; Category</h2>
              <p className="text-sm text-gray-400">Choose the type of product you are adding.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Department Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Department
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {DEPARTMENTS.map((dept) => {
                  const isSelected = department === dept;
                  return (
                    <button
                      key={dept}
                      type="button"
                      onClick={() => handleDepartmentSelect(dept)}
                      className={`py-3 px-2 rounded-xl text-sm font-medium border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#D4AF37] text-[#1A1315] border-[#D4AF37] font-bold shadow-sm'
                          : 'bg-[#140F11] border-white/10 text-gray-300 hover:border-[#D4AF37]/50'
                      }`}
                    >
                      {dept}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Category ({department})
              </label>
              <select
                value={categorySlug}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full bg-[#140F11] border border-white/10 rounded-xl px-4 py-3 text-sm text-[#FAF7F2] font-medium focus:outline-none focus:border-[#D4AF37] transition-all cursor-pointer"
              >
                {getAvailableCategories().map((cat) => (
                  <option key={cat.id} value={cat.slug} className="bg-[#1A1315] text-[#FAF7F2]">
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Name, Price & Stock */}
        <div className="p-6 sm:p-7 rounded-2xl bg-[#1E181A] border border-[#D4AF37]/20 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-white/10">
            <div className="w-9 h-9 rounded-xl bg-[#251D20] text-[#D4AF37] flex items-center justify-center border border-[#D4AF37]/30">
              <Shirt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-[#FAF7F2]">2. Product Name, Price &amp; Stock</h2>
              <p className="text-sm text-gray-400">Set the title, selling price, and inventory level.</p>
            </div>
          </div>

          <div className="space-y-5">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1.5">
                Product Title / Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Royal Crimson Handloom Kanjeevaram Silk Saree"
                className="w-full bg-[#140F11] border border-white/10 rounded-xl px-4 py-3 text-sm text-[#FAF7F2] placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] transition-all"
              />
            </div>

            {/* Price & Stock Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {/* Regular Price */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1.5">
                  Regular Price (₹) <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-gray-400 text-sm font-semibold">₹</span>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="3499"
                    className="w-full bg-[#140F11] border border-white/10 rounded-xl px-4 py-3 pl-8 text-sm text-[#FAF7F2] placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              {/* Sale Price */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1.5">
                  Sale Price (₹) <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-gray-400 text-sm font-semibold">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                    placeholder="2999"
                    className="w-full bg-[#140F11] border border-white/10 rounded-xl px-4 py-3 pl-8 text-sm text-[#FAF7F2] placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              {/* Stock */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1.5">
                  Stock Units Available <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="10"
                  className="w-full bg-[#140F11] border border-white/10 rounded-xl px-4 py-3 text-sm text-[#FAF7F2] placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            {/* Status & Description */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 items-start">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1.5">
                  Product Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ProductStatusType)}
                  className="w-full bg-[#140F11] border border-white/10 rounded-xl px-4 py-3 text-sm text-[#FAF7F2] font-medium focus:outline-none focus:border-[#D4AF37] cursor-pointer"
                >
                  <option value="Active" className="bg-[#1A1315]">Active (Available to buy)</option>
                  <option value="Draft" className="bg-[#1A1315]">Draft (Hidden from store)</option>
                  <option value="Sold Out" className="bg-[#1A1315]">Sold Out</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-200 mb-1.5">
                  Product Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the fabric feel, border design, occasion, and special qualities..."
                  className="w-full bg-[#140F11] border border-white/10 rounded-xl p-3 text-sm text-[#FAF7F2] placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Product Photos */}
        <div className="p-6 sm:p-7 rounded-2xl bg-[#1E181A] border border-[#D4AF37]/20 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#251D20] text-[#D4AF37] flex items-center justify-center border border-[#D4AF37]/30">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-medium text-[#FAF7F2]">3. Product Photos</h2>
                <p className="text-sm text-gray-400">
                  Upload photos of this item (the first photo is shown as the main picture).
                </p>
              </div>
            </div>

            <span className="text-sm text-[#D4AF37] font-medium">
              {images.length} {images.length === 1 ? 'photo' : 'photos'}
            </span>
          </div>

          {imageError && (
            <div className="p-3.5 rounded-xl bg-red-950/70 border border-red-800 text-red-300 text-sm">
              {imageError}
            </div>
          )}

          {/* Upload Box */}
          <div
            className={`border-2 border-dashed rounded-2xl p-6 text-center transition-colors bg-[#140F11]/50 ${
              isUploadingImages
                ? 'border-[#D4AF37] bg-[#D4AF37]/5'
                : 'border-[#D4AF37]/30 hover:border-[#D4AF37]/60'
            }`}
          >
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              id="image-upload-input"
              disabled={isUploadingImages}
              onChange={handleImageUpload}
              className="hidden"
            />
            <label
              htmlFor="image-upload-input"
              className={`flex flex-col items-center justify-center space-y-2.5 ${
                isUploadingImages ? 'cursor-wait' : 'cursor-pointer'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-[#251D20] text-[#D4AF37] flex items-center justify-center shadow-inner">
                {isUploadingImages ? (
                  <div className="w-5 h-5 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Upload className="w-6 h-6" />
                )}
              </div>
              <div className="text-sm text-gray-200">
                {isUploadingImages ? (
                  <span className="font-semibold text-[#D4AF37]">
                    Uploading photo to store...
                  </span>
                ) : (
                  <>
                    <span className="font-semibold text-[#D4AF37]">Choose photos from your device</span> or drag and drop here
                  </>
                )}
              </div>
              <p className="text-xs text-gray-400">JPG, PNG, or WEBP photos supported</p>
            </label>
          </div>

          {/* Quick Preset Samples */}
          <div className="space-y-2">
            <span className="text-xs font-medium text-gray-400 block">
              Sample photos (optional):
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => addSampleImage('/images/sarees/01_printed_cotton.jpg')}
                className="text-xs px-3 py-1.5 rounded-lg bg-[#251D20] text-gray-300 hover:text-[#D4AF37] border border-white/5 transition-colors cursor-pointer"
              >
                + Cotton Saree Photo
              </button>
              <button
                type="button"
                onClick={() => addSampleImage('/images/ladies-suits/cotton_batik.jpg')}
                className="text-xs px-3 py-1.5 rounded-lg bg-[#251D20] text-gray-300 hover:text-[#D4AF37] border border-white/5 transition-colors cursor-pointer"
              >
                + Suit Set Photo
              </button>
              <button
                type="button"
                onClick={() => addSampleImage('/images/bed-sheets/phulkari_bedsheet_cat.jpg')}
                className="text-xs px-3 py-1.5 rounded-lg bg-[#251D20] text-gray-300 hover:text-[#D4AF37] border border-white/5 transition-colors cursor-pointer"
              >
                + Bed Sheet Photo
              </button>
            </div>
          </div>

          {/* Photo Previews */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              {images.map((imgSrc, idx) => (
                <div
                  key={idx}
                  className="relative group rounded-xl overflow-hidden aspect-square border border-[#D4AF37]/30 bg-[#140F11]"
                >
                  <img
                    src={imgSrc}
                    alt={`Product photo ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {idx === 0 ? (
                    <span className="absolute bottom-2 left-2 bg-[#D4AF37] text-[#1A1315] text-xs font-bold px-2 py-0.5 rounded shadow-sm">
                      Cover Photo
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => makePrimary(idx)}
                      className="absolute bottom-2 left-2 bg-black/80 hover:bg-[#D4AF37] hover:text-[#1A1315] text-xs text-gray-200 font-medium px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      Make Cover
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/80 text-white flex items-center justify-center hover:bg-red-600 transition-colors cursor-pointer"
                    title="Remove photo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 4: Specifications */}
        <div className="p-6 sm:p-7 rounded-2xl bg-[#1E181A] border border-[#D4AF37]/20 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#251D20] text-[#D4AF37] flex items-center justify-center border border-[#D4AF37]/30">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-medium text-[#FAF7F2]">4. Fabric &amp; Details</h2>
                <p className="text-sm text-gray-400">Specifications for {department}.</p>
              </div>
            </div>
          </div>

          {/* Sarees */}
          {department === 'Sarees' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fadeIn">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1.5">
                  Fabric / Material
                </label>
                <input
                  type="text"
                  value={fabric}
                  onChange={(e) => setFabric(e.target.value)}
                  placeholder="e.g. Pure Mulberry Silk, Tant Cotton"
                  className="w-full bg-[#140F11] border border-white/10 rounded-xl px-4 py-3 text-sm text-[#FAF7F2] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1.5">
                  Work / Weaving Technique
                </label>
                <input
                  type="text"
                  value={workTechnique}
                  onChange={(e) => setWorkTechnique(e.target.value)}
                  placeholder="e.g. Pure Zari Brocade, Kantha Stitch"
                  className="w-full bg-[#140F11] border border-white/10 rounded-xl px-4 py-3 text-sm text-[#FAF7F2] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1.5">
                  Primary Color
                </label>
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="e.g. Royal Maroon, Mustard Yellow"
                  className="w-full bg-[#140F11] border border-white/10 rounded-xl px-4 py-3 text-sm text-[#FAF7F2] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1.5">
                  Suitable Occasion
                </label>
                <select
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value)}
                  className="w-full bg-[#140F11] border border-white/10 rounded-xl px-4 py-3 text-sm text-[#FAF7F2] focus:outline-none focus:border-[#D4AF37]"
                >
                  {SAREE_OCCASIONS.map((occ) => (
                    <option key={occ} value={occ} className="bg-[#1A1315]">
                      {occ}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2 p-4 rounded-xl bg-[#140F11] border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-[#FAF7F2] block">
                    Blouse Piece Included?
                  </span>
                  <span className="text-xs text-gray-400">
                    Does this saree package come with an unstitched blouse piece?
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setBlousePieceIncluded(true)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                      blousePieceIncluded
                        ? 'bg-[#D4AF37] text-[#1A1315] font-bold'
                        : 'bg-[#251D20] text-gray-400 hover:text-white'
                    }`}
                  >
                    Yes (Included)
                  </button>
                  <button
                    type="button"
                    onClick={() => setBlousePieceIncluded(false)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                      !blousePieceIncluded
                        ? 'bg-[#D4AF37] text-[#1A1315] font-bold'
                        : 'bg-[#251D20] text-gray-400 hover:text-white'
                    }`}
                  >
                    No (Saree Only)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Ladies Suits */}
          {department === 'Ladies Suits' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fadeIn">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1.5">
                  Suit Configuration
                </label>
                <select
                  value={suitType}
                  onChange={(e) =>
                    setSuitType(e.target.value as 'Full Set' | 'Separate Pieces')
                  }
                  className="w-full bg-[#140F11] border border-white/10 rounded-xl px-4 py-3 text-sm text-[#FAF7F2] focus:outline-none focus:border-[#D4AF37]"
                >
                  <option value="Full Set" className="bg-[#1A1315]">
                    Full Set (Kurti + Bottom + Dupatta)
                  </option>
                  <option value="Separate Pieces" className="bg-[#1A1315]">
                    Separate Pieces (Kurti Only / Bottom Only)
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1.5">
                  Size Specification
                </label>
                <select
                  value={suitSize}
                  onChange={(e) => setSuitSize(e.target.value)}
                  className="w-full bg-[#140F11] border border-white/10 rounded-xl px-4 py-3 text-sm text-[#FAF7F2] focus:outline-none focus:border-[#D4AF37]"
                >
                  {SUIT_SIZES.map((sz) => (
                    <option key={sz} value={sz} className="bg-[#1A1315]">
                      {sz}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1.5">
                  Fabric / Material
                </label>
                <input
                  type="text"
                  value={fabric}
                  onChange={(e) => setFabric(e.target.value)}
                  placeholder="e.g. Pure Cotton with Chanderi Dupatta"
                  className="w-full bg-[#140F11] border border-white/10 rounded-xl px-4 py-3 text-sm text-[#FAF7F2] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1.5">
                  Primary Color
                </label>
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="e.g. Indigo Blue, Mustard Yellow"
                  className="w-full bg-[#140F11] border border-white/10 rounded-xl px-4 py-3 text-sm text-[#FAF7F2] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>
          )}

          {/* Bed Sheets */}
          {department === 'Bed Sheets' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fadeIn">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1.5">
                  Bed Size
                </label>
                <select
                  value={bedSize}
                  onChange={(e) => setBedSize(e.target.value)}
                  className="w-full bg-[#140F11] border border-white/10 rounded-xl px-4 py-3 text-sm text-[#FAF7F2] focus:outline-none focus:border-[#D4AF37]"
                >
                  {BED_SIZES.map((bs) => (
                    <option key={bs} value={bs} className="bg-[#1A1315]">
                      {bs}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1.5">
                  Fabric &amp; Thread Count
                </label>
                <input
                  type="text"
                  value={fabric}
                  onChange={(e) => setFabric(e.target.value)}
                  placeholder="e.g. 100% Pure Cotton (300 Thread Count)"
                  className="w-full bg-[#140F11] border border-white/10 rounded-xl px-4 py-3 text-sm text-[#FAF7F2] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="md:col-span-2 p-4 rounded-xl bg-[#140F11] border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-[#FAF7F2] block">
                    Pillow Covers Included?
                  </span>
                  <span className="text-xs text-gray-400">
                    Includes 2 matching pillow covers.
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPillowCoversIncluded(true)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                      pillowCoversIncluded
                        ? 'bg-[#D4AF37] text-[#1A1315] font-bold'
                        : 'bg-[#251D20] text-gray-400 hover:text-white'
                    }`}
                  >
                    Yes (2 Covers)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPillowCoversIncluded(false)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                      !pillowCoversIncluded
                        ? 'bg-[#D4AF37] text-[#1A1315] font-bold'
                        : 'bg-[#251D20] text-gray-400 hover:text-white'
                    }`}
                  >
                    No (Sheet Only)
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Action Bar */}
        <div className="p-6 rounded-2xl bg-[#1E181A] border border-[#D4AF37]/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            href="/admin/products"
            className="w-full sm:w-auto text-center px-5 py-3 rounded-xl border border-white/10 hover:bg-[#251D20] text-sm text-gray-300 font-medium transition-colors"
          >
            Cancel &amp; Return to Products
          </Link>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={(e) => handleSubmit(e, 'Draft')}
              disabled={isSubmitting}
              className="flex-1 sm:flex-none px-5 py-3 rounded-xl bg-[#251D20] hover:bg-[#2F2428] border border-white/10 text-sm text-gray-200 font-medium transition-colors cursor-pointer disabled:opacity-60"
            >
              Save as Draft
            </button>
            <button
              type="button"
              onClick={(e) => handleSubmit(e)}
              disabled={isSubmitting}
              className="flex-1 sm:flex-none px-7 py-3 rounded-xl bg-[#D4AF37] hover:bg-[#C29F2F] text-[#1A1315] text-sm font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <CheckCircle className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? 'Saving...'
                  : mode === 'edit'
                  ? 'Save Changes'
                  : 'Add Product to Store'}
              </span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

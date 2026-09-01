'use client';

import React, { useState, useEffect } from 'react';
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

  // When department changes in the form, if the category doesn't exist in the new department, reset category & default fabric
  useEffect(() => {
    const availableCategories = DEPARTMENT_CATEGORIES[department];
    if (availableCategories && availableCategories.length > 0) {
      const existsInDept = availableCategories.some((c) => c.slug === categorySlug);
      if (!existsInDept) {
        setCategorySlug(availableCategories[0].slug);
        if (availableCategories[0].defaultFabric) {
          setFabric(availableCategories[0].defaultFabric);
        }
      }
    }
  }, [department, categorySlug]);

  const handleCategoryChange = (slug: string) => {
    setCategorySlug(slug);
    const cat = DEPARTMENT_CATEGORIES[department]?.find((c) => c.slug === slug);
    if (cat?.defaultFabric) {
      setFabric(cat.defaultFabric);
    }
  };

  const [isUploadingImages, setIsUploadingImages] = useState(false);

  // Image Upload Handling (Real Filesystem Storage via API)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError('');
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    const validMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    // Client-side quick check
    for (const file of fileList) {
      if (!validMimes.includes(file.type.toLowerCase())) {
        setImageError('Only image files (JPEG, PNG, WEBP) are supported.');
        e.target.value = '';
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setImageError(`File "${file.name}" exceeds the 5MB size limit.`);
        e.target.value = '';
        return;
      }
    }

    setIsUploadingImages(true);

    try {
      for (const file of fileList) {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/admin/products/upload-image', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) {
          setImageError(data.error || 'Failed to upload image to server.');
          break;
        }

        if (data.url) {
          setImages((prev) => [...prev, data.url]);
        }
      }
    } catch {
      setImageError('Network error while uploading image to storage.');
    } finally {
      setIsUploadingImages(false);
      e.target.value = '';
    }
  };

  const removeImage = async (indexToRemove: number) => {
    const urlToRemove = images[indexToRemove];
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));

    // If removing an uploaded file, trigger background cleanup
    if (urlToRemove && urlToRemove.startsWith('/uploads/products/')) {
      try {
        await fetch('/api/admin/products/upload-image', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: urlToRemove }),
        });
      } catch {
        // Silently ignore or let backend handle cleanup on save
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

  // Submit Handler -> Sends to secure server-side API
  const handleSubmit = async (e: React.FormEvent, overrideStatus?: ProductStatusType) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim()) {
      setFormError('Please enter a product title/name.');
      return;
    }
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      setFormError('Please enter a valid base price.');
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
        // PUT /api/admin/products/[id]
        const res = await fetch(`/api/admin/products/${initialProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok) {
          setFormError(data.error || 'Failed to update product in database.');
          setIsSubmitting(false);
          return;
        }

        router.push('/admin/products?updated=true');
        router.refresh();
      } else {
        // POST /api/admin/products
        const res = await fetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok) {
          setFormError(data.error || 'Failed to create product in database.');
          setIsSubmitting(false);
          return;
        }

        router.push('/admin/products?created=true');
        router.refresh();
      }
    } catch {
      setFormError('A network error occurred while communicating with the server.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Top Breadcrumb & Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
          <Link href="/admin/products" className="hover:text-[#D4AF37] flex items-center gap-1 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Products</span>
          </Link>
          <span>/</span>
          <span className="text-[#FAF7F2]">
            {mode === 'edit' ? 'Edit Product' : 'Add New Product'}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl text-[#FAF7F2] font-normal">
              {mode === 'edit' ? `Edit: ${initialProduct?.name || 'Product'}` : 'Add New Product Listing'}
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              {mode === 'edit'
                ? 'Update product details, department attributes, inventory, and images in database.'
                : 'Create new product listing with department-tailored specifications in database.'}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/admin/products"
              className="px-4 py-2.5 rounded-xl border border-white/10 hover:bg-[#251D20] text-xs text-gray-300 font-medium transition-colors"
            >
              Cancel
            </Link>
            <button
              type="button"
              onClick={(e) => handleSubmit(e, 'Draft')}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl bg-[#251D20] hover:bg-[#2F2529] border border-[#D4AF37]/30 text-xs text-[#D4AF37] font-medium transition-colors cursor-pointer"
            >
              Save as Draft
            </button>
            <button
              type="button"
              onClick={(e) => handleSubmit(e)}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#B8952B] text-[#1A1315] text-xs font-semibold uppercase tracking-wider transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              <CheckCircle className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? 'Saving to Database...'
                  : mode === 'edit'
                  ? 'Save Changes'
                  : 'Publish Product'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Database Security Status Banner */}
      <div className="p-4 rounded-2xl bg-[#1E181A] border border-[#D4AF37]/30 flex items-start gap-3 text-xs">
        <Sparkles className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold text-[#D4AF37] uppercase tracking-wider text-[11px] block">
            SQLite Database Persistence Active
          </span>
          <p className="text-gray-300 text-xs leading-relaxed">
            All changes are validated and committed directly to the persistent SQLite products database via server-authorized API routes.
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {formError && (
        <div className="p-4 rounded-xl bg-red-950/80 border border-red-800 text-red-200 text-xs flex items-center gap-2.5 animate-fadeIn">
          <Info className="w-4 h-4 text-red-400 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {/* Main Form — Multi-Section */}
      <form onSubmit={(e) => handleSubmit(e)} className="space-y-8">
        {/* =========================================================================
            SECTION 1: Department & Category Classification
        ========================================================================= */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#1E181A] border border-[#D4AF37]/20 space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-white/10">
            <div className="w-8 h-8 rounded-lg bg-[#251D20] text-[#D4AF37] flex items-center justify-center border border-[#D4AF37]/30">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-lg text-[#FAF7F2]">1. Department & Category</h2>
              <p className="text-xs text-gray-400">Select the store collection to tailor product specifications.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Department Selection */}
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-gray-300 mb-2">
                Department <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {DEPARTMENTS.map((dept) => {
                  const isSelected = department === dept;
                  return (
                    <button
                      key={dept}
                      type="button"
                      onClick={() => setDepartment(dept)}
                      className={`py-3 px-2 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#D4AF37] text-[#1A1315] border-[#D4AF37] font-semibold shadow-md'
                          : 'bg-[#140F11] border-white/10 text-gray-300 hover:border-[#D4AF37]/50'
                      }`}
                    >
                      {dept}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-gray-400 mt-2">
                Changing department dynamically updates the category list and specific product attributes below.
              </p>
            </div>

            {/* Dynamic Category Selection */}
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-gray-300 mb-2">
                Category ({department}) <span className="text-red-400">*</span>
              </label>
              <select
                value={categorySlug}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full bg-[#140F11] border border-[#D4AF37]/30 rounded-xl px-4 py-3 text-sm text-[#FAF7F2] focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
              >
                {getAvailableCategories().map((cat) => (
                  <option key={cat.id} value={cat.slug} className="bg-[#1A1315] text-[#FAF7F2]">
                    {cat.name}
                  </option>
                ))}
              </select>
              <span className="text-[11px] text-[#D4AF37]/80 mt-1.5 block">
                {getAvailableCategories().length} {department === 'Sarees' ? 'Traditional Saree' : ''} Categories Available
              </span>
            </div>
          </div>
        </div>

        {/* =========================================================================
            SECTION 2: Common Product Details
        ========================================================================= */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#1E181A] border border-[#D4AF37]/20 space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-white/10">
            <div className="w-8 h-8 rounded-lg bg-[#251D20] text-[#D4AF37] flex items-center justify-center border border-[#D4AF37]/30">
              <Shirt className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-lg text-[#FAF7F2]">2. Common Details</h2>
              <p className="text-xs text-gray-400">Core pricing, inventory, and descriptive information.</p>
            </div>
          </div>

          <div className="space-y-5">
            {/* Product Name */}
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-gray-300 mb-1.5">
                Product Title / Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Royal Crimson Handloom Kanjeevaram Silk Saree"
                className="w-full bg-[#140F11] border border-[#D4AF37]/30 rounded-xl px-4 py-3 text-sm text-[#FAF7F2] placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
              />
            </div>

            {/* Pricing & Stock Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {/* Regular Price */}
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-gray-300 mb-1.5">
                  Regular Price (₹) <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-gray-400 text-sm font-semibold">₹</span>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="3499"
                    className="w-full bg-[#140F11] border border-[#D4AF37]/30 rounded-xl px-4 py-2.5 pl-8 text-sm text-[#FAF7F2] placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                  />
                </div>
              </div>

              {/* Sale Price */}
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-gray-300 mb-1.5">
                  Sale Price (₹) <span className="text-gray-500 lowercase">(optional)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-gray-400 text-sm font-semibold">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                    placeholder="2999"
                    className="w-full bg-[#140F11] border border-[#D4AF37]/30 rounded-xl px-4 py-2.5 pl-8 text-sm text-[#FAF7F2] placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                  />
                </div>
              </div>

              {/* Stock Quantity */}
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-gray-300 mb-1.5">
                  Stock Quantity <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="10"
                  className="w-full bg-[#140F11] border border-[#D4AF37]/30 rounded-xl px-4 py-2.5 text-sm text-[#FAF7F2] placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                />
              </div>
            </div>

            {/* Status & Description */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 items-start">
              {/* Status */}
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-gray-300 mb-1.5">
                  Listing Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ProductStatusType)}
                  className="w-full bg-[#140F11] border border-[#D4AF37]/30 rounded-xl px-3.5 py-2.5 text-sm text-[#FAF7F2] focus:outline-none focus:border-[#D4AF37]"
                >
                  <option value="Active" className="bg-[#1A1315]">Active (Visible in Store)</option>
                  <option value="Draft" className="bg-[#1A1315]">Draft (Hidden from Catalog)</option>
                  <option value="Sold Out" className="bg-[#1A1315]">Sold Out</option>
                </select>
              </div>

              {/* Description */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium uppercase tracking-wider text-gray-300 mb-1.5">
                  Detailed Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the weaving technique, handfeel, border work, and styling recommendations..."
                  className="w-full bg-[#140F11] border border-[#D4AF37]/30 rounded-xl p-3 text-sm text-[#FAF7F2] placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            SECTION 3: Product Imagery
        ========================================================================= */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#1E181A] border border-[#D4AF37]/20 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#251D20] text-[#D4AF37] flex items-center justify-center border border-[#D4AF37]/30">
                <ImageIcon className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-serif text-lg text-[#FAF7F2]">3. Product Images</h2>
                <p className="text-xs text-gray-400">
                  Upload multiple photos from your device (first image acts as primary cover).
                </p>
              </div>
            </div>

            <span className="text-xs text-[#D4AF37] font-medium">
              {images.length} {images.length === 1 ? 'image' : 'images'} added
            </span>
          </div>

          {imageError && (
            <div className="p-3 rounded-lg bg-red-950/70 border border-red-800 text-red-300 text-xs">
              {imageError}
            </div>
          )}

          {/* Upload Dropzone */}
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
              className={`flex flex-col items-center justify-center space-y-2 ${
                isUploadingImages ? 'cursor-wait' : 'cursor-pointer'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-[#251D20] text-[#D4AF37] flex items-center justify-center shadow-inner">
                {isUploadingImages ? (
                  <div className="w-5 h-5 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Upload className="w-5 h-5" />
                )}
              </div>
              <div className="text-xs text-gray-300">
                {isUploadingImages ? (
                  <span className="font-semibold text-[#D4AF37]">
                    Uploading and saving image to server storage...
                  </span>
                ) : (
                  <>
                    <span className="font-semibold text-[#D4AF37]">Click to browse files</span> or drag and drop
                  </>
                )}
              </div>
              <p className="text-[11px] text-gray-500">Supports PNG, JPG, WEBP up to 5MB (stored on local server storage)</p>
            </label>
          </div>

          {/* Preset Sample Images for Fast Testing */}
          <div className="space-y-2">
            <span className="text-[11px] uppercase tracking-wider text-gray-400 block">
              Quick Sample Presets (Click to add):
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => addSampleImage('/images/sarees/01_printed_cotton.jpg')}
                className="text-[11px] px-3 py-1.5 rounded-lg bg-[#251D20] text-gray-300 hover:text-[#D4AF37] border border-white/5 transition-colors cursor-pointer"
              >
                + Printed Cotton Saree
              </button>
              <button
                type="button"
                onClick={() => addSampleImage('/images/sarees/02_tant_cotton.jpg')}
                className="text-[11px] px-3 py-1.5 rounded-lg bg-[#251D20] text-gray-300 hover:text-[#D4AF37] border border-white/5 transition-colors cursor-pointer"
              >
                + Tant Cotton Saree
              </button>
              <button
                type="button"
                onClick={() => addSampleImage('/images/ladies-suits/cotton_batik.jpg')}
                className="text-[11px] px-3 py-1.5 rounded-lg bg-[#251D20] text-gray-300 hover:text-[#D4AF37] border border-white/5 transition-colors cursor-pointer"
              >
                + Cotton Batik Suit Set
              </button>
              <button
                type="button"
                onClick={() => addSampleImage('/images/bed-sheets/phulkari_bedsheet_cat.jpg')}
                className="text-[11px] px-3 py-1.5 rounded-lg bg-[#251D20] text-gray-300 hover:text-[#D4AF37] border border-white/5 transition-colors cursor-pointer"
              >
                + Phulkari Bed Sheet Set
              </button>
            </div>
          </div>

          {/* Image Previews Grid */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 pt-2">
              {images.map((imgSrc, idx) => (
                <div
                  key={idx}
                  className="relative group rounded-xl overflow-hidden aspect-square border border-[#D4AF37]/30 bg-[#140F11]"
                >
                  <img
                    src={imgSrc}
                    alt={`Preview ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {idx === 0 ? (
                    <span className="absolute bottom-1.5 left-1.5 bg-[#D4AF37] text-[#1A1315] text-[9px] font-bold uppercase px-1.5 py-0.5 rounded shadow-sm">
                      Primary Cover
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => makePrimary(idx)}
                      className="absolute bottom-1.5 left-1.5 bg-black/80 hover:bg-[#D4AF37] hover:text-[#1A1315] text-[9px] text-gray-300 font-medium px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      title="Set as Primary Cover Image"
                    >
                      Set Primary
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center opacity-90 hover:bg-red-600 transition-colors cursor-pointer"
                    title="Remove image"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* =========================================================================
            SECTION 4: Department-Specific Specifications
        ========================================================================= */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#1E181A] border border-[#D4AF37]/30 relative overflow-hidden space-y-6">
          <div className="absolute top-0 right-0 w-48 h-48 bg-radial from-[#D4AF37]/10 via-transparent to-transparent pointer-events-none" />

          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center border border-[#D4AF37]/40">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-serif text-lg text-[#FAF7F2]">
                  4. {department} Specific Specifications
                </h2>
                <p className="text-xs text-gray-400">
                  Custom attributes relevant exclusively to {department.toLowerCase()}.
                </p>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[10px] uppercase font-bold tracking-wider text-[#D4AF37]">
              {department} Active
            </span>
          </div>

          {/* 4A. Sarees Specific Fields */}
          {department === 'Sarees' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fadeIn">
              {/* Fabric */}
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-gray-300 mb-1.5">
                  Fabric / Material
                </label>
                <input
                  type="text"
                  value={fabric}
                  onChange={(e) => setFabric(e.target.value)}
                  placeholder="e.g. Pure Mulberry Silk, Tant Handloom Cotton"
                  className="w-full bg-[#140F11] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-[#FAF7F2] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              {/* Work / Technique */}
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-gray-300 mb-1.5">
                  Work / Weaving Technique
                </label>
                <input
                  type="text"
                  value={workTechnique}
                  onChange={(e) => setWorkTechnique(e.target.value)}
                  placeholder="e.g. Pure Zari Kadwa Brocade, Kantha Stitch"
                  className="w-full bg-[#140F11] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-[#FAF7F2] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              {/* Color */}
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-gray-300 mb-1.5">
                  Primary Color & Palette
                </label>
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="e.g. Royal Maroon & Antique Gold"
                  className="w-full bg-[#140F11] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-[#FAF7F2] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              {/* Occasion */}
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-gray-300 mb-1.5">
                  Recommended Occasion Tag
                </label>
                <select
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value)}
                  className="w-full bg-[#140F11] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-[#FAF7F2] focus:outline-none focus:border-[#D4AF37]"
                >
                  {SAREE_OCCASIONS.map((occ) => (
                    <option key={occ} value={occ} className="bg-[#1A1315]">
                      {occ}
                    </option>
                  ))}
                </select>
              </div>

              {/* Blouse Piece Included Toggle */}
              <div className="md:col-span-2 p-4 rounded-xl bg-[#140F11] border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-[#FAF7F2] block">
                    Unstitched Matching Blouse Piece Included?
                  </span>
                  <span className="text-[11px] text-gray-400">
                    Indicates if the saree length includes an unstitched 0.8m blouse piece.
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setBlousePieceIncluded(true)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
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
                    className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      !blousePieceIncluded
                        ? 'bg-[#D4AF37] text-[#1A1315] font-bold'
                        : 'bg-[#251D20] text-gray-400 hover:text-white'
                    }`}
                  >
                    No (Without Blouse)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 4B. Ladies Suits Specific Fields */}
          {department === 'Ladies Suits' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fadeIn">
              {/* Sold as Set or Separate */}
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-gray-300 mb-1.5">
                  Package Configuration
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSuitType('Full Set')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-medium border text-center transition-colors cursor-pointer ${
                      suitType === 'Full Set'
                        ? 'bg-[#D4AF37] text-[#1A1315] border-[#D4AF37] font-semibold'
                        : 'bg-[#140F11] border-white/10 text-gray-300'
                    }`}
                  >
                    Full 3-Piece Set
                  </button>
                  <button
                    type="button"
                    onClick={() => setSuitType('Separate Pieces')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-medium border text-center transition-colors cursor-pointer ${
                      suitType === 'Separate Pieces'
                        ? 'bg-[#D4AF37] text-[#1A1315] border-[#D4AF37] font-semibold'
                        : 'bg-[#140F11] border-white/10 text-gray-300'
                    }`}
                  >
                    Separate Pieces
                  </button>
                </div>
                <span className="text-[11px] text-gray-500 mt-1 block">
                  {suitType === 'Full Set' ? 'Includes Kurta fabric, Bottom, and Dupatta' : 'Standalone Kurta or Dupatta only'}
                </span>
              </div>

              {/* Size */}
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-gray-300 mb-1.5">
                  Size / Fit Specifications
                </label>
                <select
                  value={suitSize}
                  onChange={(e) => setSuitSize(e.target.value)}
                  className="w-full bg-[#140F11] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-[#FAF7F2] focus:outline-none focus:border-[#D4AF37]"
                >
                  {SUIT_SIZES.map((sz) => (
                    <option key={sz} value={sz} className="bg-[#1A1315]">
                      {sz}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fabric Type */}
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-gray-300 mb-1.5">
                  Fabric Type
                </label>
                <input
                  type="text"
                  value={fabric}
                  onChange={(e) => setFabric(e.target.value)}
                  placeholder="e.g. Pure Cotton Batik, Phulkari Cotton"
                  className="w-full bg-[#140F11] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-[#FAF7F2] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              {/* Color */}
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-gray-300 mb-1.5">
                  Color / Shade
                </label>
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="e.g. Indigo Blue, Mustard Yellow"
                  className="w-full bg-[#140F11] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-[#FAF7F2] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>
          )}

          {/* 4C. Bed Sheets Specific Fields */}
          {department === 'Bed Sheets' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fadeIn">
              {/* Bed Size */}
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-gray-300 mb-1.5">
                  Bed Size Standard
                </label>
                <select
                  value={bedSize}
                  onChange={(e) => setBedSize(e.target.value)}
                  className="w-full bg-[#140F11] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-[#FAF7F2] focus:outline-none focus:border-[#D4AF37]"
                >
                  {BED_SIZES.map((bs) => (
                    <option key={bs} value={bs} className="bg-[#1A1315]">
                      {bs}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fabric Type */}
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-gray-300 mb-1.5">
                  Fabric Material & Thread Count
                </label>
                <input
                  type="text"
                  value={fabric}
                  onChange={(e) => setFabric(e.target.value)}
                  placeholder="e.g. 100% Pure Cotton with Silk Floss Embroidery (300 TC)"
                  className="w-full bg-[#140F11] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-[#FAF7F2] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              {/* Pillow Covers Toggle */}
              <div className="md:col-span-2 p-4 rounded-xl bg-[#140F11] border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-[#FAF7F2] block">
                    Matching Pillow Covers Included?
                  </span>
                  <span className="text-[11px] text-gray-400">
                    Includes 2 coordinating Phulkari embroidered pillow covers.
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPillowCoversIncluded(true)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
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
                    className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      !pillowCoversIncluded
                        ? 'bg-[#D4AF37] text-[#1A1315] font-bold'
                        : 'bg-[#251D20] text-gray-400 hover:text-white'
                    }`}
                  >
                    No (Bed Sheet Only)
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* =========================================================================
            BOTTOM ACTION BAR
        ========================================================================= */}
        <div className="p-6 rounded-2xl bg-[#1E181A] border border-[#D4AF37]/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-gray-400 flex items-center gap-2">
            <Info className="w-4 h-4 text-[#D4AF37]" />
            <span>
              {mode === 'edit'
                ? 'Changes are committed directly to the SQLite products table.'
                : 'Publishing will insert the record into the SQLite database.'}
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              href="/admin/products"
              className="flex-1 sm:flex-none text-center px-5 py-3 rounded-xl border border-white/10 hover:bg-[#251D20] text-xs text-gray-300 font-medium transition-colors"
            >
              Discard Changes
            </Link>
            <button
              type="button"
              onClick={(e) => handleSubmit(e, 'Draft')}
              disabled={isSubmitting}
              className="flex-1 sm:flex-none px-5 py-3 rounded-xl bg-[#251D20] hover:bg-[#2F2529] border border-[#D4AF37]/30 text-xs text-[#D4AF37] font-medium transition-colors cursor-pointer disabled:opacity-60"
            >
              Save as Draft
            </button>
            <button
              type="button"
              onClick={(e) => handleSubmit(e)}
              disabled={isSubmitting}
              className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-[#D4AF37] hover:bg-[#B8952B] text-[#1A1315] text-xs font-semibold uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <CheckCircle className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? 'Saving to Database...'
                  : mode === 'edit'
                  ? 'Save Changes'
                  : 'Publish Product'}
              </span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

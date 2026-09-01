'use client';

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ProductItem } from '@/types/product';
import { DepartmentType, ProductStatusType } from '@/data/adminProductOptions';
import {
  Plus,
  Search,
  Shirt,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  Eye,
  SlidersHorizontal,
  Pencil,
  Trash2,
  AlertTriangle,
  X,
} from 'lucide-react';

function ProductsListContent() {
  const searchParams = useSearchParams();
  const isCreatedJustNow = searchParams.get('created') === 'true';
  const isUpdatedJustNow = searchParams.get('updated') === 'true';

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewProduct, setPreviewProduct] = useState<ProductItem | null>(null);
  const [productToDelete, setProductToDelete] = useState<ProductItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletedToastMessage, setDeletedToastMessage] = useState('');

  // Fetch real products from the server-side API
  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const res = await fetch('/api/admin/products');
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to load products from server.');
        setIsLoading(false);
        return;
      }

      setProducts(data.products || []);
      setIsLoading(false);
    } catch {
      setError('Could not connect to database API.');
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    const deletedName = productToDelete.name;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/admin/products/${productToDelete.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Failed to delete product from database.');
        setIsDeleting(false);
        return;
      }

      // Refresh list
      await fetchProducts();
      setProductToDelete(null);
      setIsDeleting(false);
      setDeletedToastMessage(`"${deletedName}" was permanently removed from database.`);
      setTimeout(() => {
        setDeletedToastMessage('');
      }, 4500);
    } catch {
      alert('Network error while attempting to delete product.');
      setIsDeleting(false);
    }
  };

  // Filter products in memory for instant UX response
  const filteredProducts = products.filter((p) => {
    // Department filter
    if (selectedDepartment !== 'All' && p.department !== selectedDepartment) {
      return false;
    }
    // Status filter
    if (selectedStatus !== 'All' && p.status !== selectedStatus) {
      return false;
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchCategory = p.category.toLowerCase().includes(q);
      const matchFabric = p.fabric ? p.fabric.toLowerCase().includes(q) : false;
      const matchColor = p.color ? p.color.toLowerCase().includes(q) : false;
      return matchName || matchCategory || matchFabric || matchColor;
    }
    return true;
  });

  const getDepartmentBadgeStyle = (dept: DepartmentType) => {
    switch (dept) {
      case 'Sarees':
        return 'bg-[#6B0D2F]/30 text-[#FAF7F2] border-[#D4AF37]/40';
      case 'Ladies Suits':
        return 'bg-sky-950/50 text-sky-300 border-sky-600/40';
      case 'Bed Sheets':
        return 'bg-amber-950/50 text-amber-300 border-amber-600/40';
      default:
        return 'bg-gray-800 text-gray-300 border-gray-600';
    }
  };

  const getStatusBadgeStyle = (status: ProductStatusType) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'Draft':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'Sold Out':
        return 'bg-red-500/15 text-red-300 border-red-500/30';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif text-2xl sm:text-3xl text-[#FAF7F2] font-normal">
              Product Catalogue
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider">
              SQLite Database Connected
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Real persistent database records for Sarees, Ladies Suits, and Bed Sheets.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchProducts}
            title="Refresh database records"
            className="p-2.5 rounded-xl bg-[#1E181A] hover:bg-[#251D20] text-gray-400 hover:text-gray-200 border border-white/10 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <Link
            href="/admin/products/new"
            className="px-4 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#B8952B] text-[#1A1315] text-xs font-semibold uppercase tracking-wider transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      {/* Success Notifications */}
      {isCreatedJustNow && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-700 text-emerald-200 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>
              <strong>Product Committed to Database!</strong> The item was created in the SQLite products table and is listed below.
            </span>
          </div>
          <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
            DB Synchronized
          </span>
        </div>
      )}

      {isUpdatedJustNow && (
        <div className="p-4 rounded-xl bg-sky-950/60 border border-sky-700 text-sky-200 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-sky-400 shrink-0" />
            <span>
              <strong>Database Record Updated!</strong> Your changes were saved to the SQLite products table and are reflected below.
            </span>
          </div>
          <span className="text-[10px] uppercase font-bold text-sky-400 tracking-wider">
            DB Updated
          </span>
        </div>
      )}

      {deletedToastMessage && (
        <div className="p-4 rounded-xl bg-amber-950/60 border border-amber-700 text-amber-200 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <Trash2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{deletedToastMessage}</span>
          </div>
          <button
            onClick={() => setDeletedToastMessage('')}
            className="text-gray-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchProducts} className="underline text-red-300 ml-2">
            Retry
          </button>
        </div>
      )}

      {/* Filter and Search Controls Bar */}
      <div className="p-4 rounded-2xl bg-[#1E181A] border border-[#D4AF37]/20 space-y-4">
        {/* Department Pills */}
        <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-white/5">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {['All', 'Sarees', 'Ladies Suits', 'Bed Sheets'].map((dept) => {
              const count =
                dept === 'All'
                  ? products.length
                  : products.filter((p) => p.department === dept).length;
              const isSelected = selectedDepartment === dept;
              return (
                <button
                  key={dept}
                  onClick={() => setSelectedDepartment(dept)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#D4AF37] text-[#1A1315] font-bold shadow-sm'
                      : 'bg-[#140F11] text-gray-400 hover:text-gray-200 border border-white/5'
                  }`}
                >
                  <span>{dept}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected
                        ? 'bg-[#1A1315]/20 text-[#1A1315]'
                        : 'bg-white/10 text-gray-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="text-xs text-gray-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>
              Showing {filteredProducts.length} of {products.length} products
            </span>
          </div>
        </div>

        {/* Search & Status Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search Input */}
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, category, fabric, or color..."
              className="w-full bg-[#140F11] border border-[#D4AF37]/20 rounded-xl py-2.5 pl-10 pr-4 text-xs text-[#FAF7F2] placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-xs text-gray-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Status Select */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-gray-400 shrink-0 hidden sm:block" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-[#140F11] border border-[#D4AF37]/20 rounded-xl px-3 py-2.5 text-xs text-[#FAF7F2] focus:outline-none focus:border-[#D4AF37]"
            >
              <option value="All" className="bg-[#1A1315]">All Statuses</option>
              <option value="Active" className="bg-[#1A1315]">Active</option>
              <option value="Draft" className="bg-[#1A1315]">Draft</option>
              <option value="Sold Out" className="bg-[#1A1315]">Sold Out</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="p-12 text-center rounded-2xl bg-[#1E181A] border border-[#D4AF37]/20 space-y-3">
          <div className="w-6 h-6 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-gray-400">Loading products from database...</p>
        </div>
      )}

      {/* Products Table */}
      {!isLoading && filteredProducts.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#1E181A] border border-[#D4AF37]/20 space-y-4">
          <Shirt className="w-10 h-10 text-gray-500 mx-auto" />
          <h2 className="font-serif text-lg text-[#FAF7F2]">No Products Found</h2>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            No products match the selected department or search filter. Try clearing filters or create a new product.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => {
                setSelectedDepartment('All');
                setSelectedStatus('All');
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-xl border border-white/10 text-xs text-gray-300 hover:bg-white/5 cursor-pointer"
            >
              Clear Filters
            </button>
            <Link
              href="/admin/products/new"
              className="px-4 py-2 rounded-xl bg-[#D4AF37] text-[#1A1315] text-xs font-semibold cursor-pointer"
            >
              Add Product
            </Link>
          </div>
        </div>
      ) : (
        !isLoading && (
          <div className="rounded-2xl bg-[#1E181A] border border-[#D4AF37]/20 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-[#251D20] text-[#D4AF37] uppercase tracking-wider text-[10px] font-semibold border-b border-white/10">
                  <tr>
                    <th className="py-3.5 px-4 sm:px-6">Product</th>
                    <th className="py-3.5 px-4">Department & Category</th>
                    <th className="py-3.5 px-4">Specifications</th>
                    <th className="py-3.5 px-4">Price</th>
                    <th className="py-3.5 px-4">Stock</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredProducts.map((prod) => (
                    <tr key={prod.id} className="hover:bg-[#251D20]/50 transition-colors">
                      {/* Image & Title */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3.5">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[#140F11] border border-white/10 shrink-0">
                            {prod.images && prod.images[0] ? (
                              <img
                                src={prod.images[0]}
                                alt={prod.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-600">
                                <Shirt className="w-5 h-5" />
                              </div>
                            )}
                            {prod.images && prod.images.length > 1 && (
                              <span className="absolute bottom-0 right-0 bg-black/80 text-[9px] px-1 text-white font-bold rounded-tl">
                                +{prod.images.length - 1}
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-[#FAF7F2] text-xs line-clamp-1 max-w-xs">
                              {prod.name}
                            </div>
                            <div className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1.5">
                              <span className="font-mono text-gray-400">{prod.id}</span>
                              {prod.color && (
                                <>
                                  <span>•</span>
                                  <span className="text-[#D4AF37]/90">{prod.color}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Department & Category */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getDepartmentBadgeStyle(
                              prod.department
                            )}`}
                          >
                            {prod.department}
                          </span>
                          <div className="text-[11px] text-gray-300 font-medium">
                            {prod.category}
                          </div>
                        </div>
                      </td>

                      {/* Department-Tailored Specifications */}
                      <td className="py-3.5 px-4 text-[11px] text-gray-400">
                        {prod.department === 'Sarees' && (
                          <div className="space-y-0.5">
                            <div>
                              <span className="text-gray-400">Fabric:</span>{' '}
                              <span className="text-gray-200">{prod.fabric || 'Pure Silk/Cotton'}</span>
                            </div>
                            <div className="text-[10px]">
                              <span className="text-gray-400">Blouse:</span>{' '}
                              <span className={prod.blousePieceIncluded ? 'text-emerald-400 font-semibold' : 'text-gray-400'}>
                                {prod.blousePieceIncluded ? 'Included' : 'No Blouse'}
                              </span>
                              {prod.occasion && (
                                <span className="ml-1.5 text-[#D4AF37]">({prod.occasion})</span>
                              )}
                            </div>
                          </div>
                        )}

                        {prod.department === 'Ladies Suits' && (
                          <div className="space-y-0.5">
                            <div>
                              <span className="text-gray-400">Set:</span>{' '}
                              <span className="text-gray-200">{prod.suitType || 'Full Set'}</span>
                            </div>
                            <div className="text-[10px]">
                              <span className="text-gray-400">Size:</span>{' '}
                              <span className="text-sky-300 font-semibold">{prod.size || 'Free Size'}</span>
                            </div>
                          </div>
                        )}

                        {prod.department === 'Bed Sheets' && (
                          <div className="space-y-0.5">
                            <div>
                              <span className="text-gray-400">Size:</span>{' '}
                              <span className="text-amber-300 font-semibold">{prod.bedSize || 'King'}</span>
                            </div>
                            <div className="text-[10px]">
                              <span className="text-gray-400">Pillow Covers:</span>{' '}
                              <span className={prod.pillowCoversIncluded ? 'text-emerald-400 font-semibold' : 'text-gray-400'}>
                                {prod.pillowCoversIncluded ? '2 Included' : 'None'}
                              </span>
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {prod.salePrice ? (
                          <div>
                            <div className="font-semibold text-emerald-400 text-xs">
                              ₹{prod.salePrice.toLocaleString('en-IN')}
                            </div>
                            <div className="text-[10px] text-gray-500 line-through">
                              ₹{prod.price.toLocaleString('en-IN')}
                            </div>
                          </div>
                        ) : (
                          <div className="font-semibold text-[#FAF7F2] text-xs">
                            ₹{prod.price.toLocaleString('en-IN')}
                          </div>
                        )}
                      </td>

                      {/* Stock */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`text-xs font-semibold ${
                            prod.stock === 0
                              ? 'text-red-400'
                              : prod.stock < 5
                              ? 'text-amber-400'
                              : 'text-gray-200'
                          }`}
                        >
                          {prod.stock} {prod.stock === 1 ? 'unit' : 'units'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadgeStyle(
                            prod.status
                          )}`}
                        >
                          {prod.status}
                        </span>
                      </td>

                      {/* Action Buttons: Preview, Edit, Delete */}
                      <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* 1. Quick Snapshot Preview */}
                          <button
                            onClick={() => setPreviewProduct(prod)}
                            className="p-1.5 text-gray-400 hover:text-[#D4AF37] hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                            title="View Attributes Snapshot"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* 2. Edit Product */}
                          <Link
                            href={`/admin/products/${prod.id}/edit`}
                            className="p-1.5 text-gray-400 hover:text-sky-400 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                            title="Edit Product"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>

                          {/* 3. Delete Product (Trigger confirmation dialog) */}
                          <button
                            onClick={() => setProductToDelete(prod)}
                            className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {/* Snapshot Preview Modal for Business Owner Review */}
      {previewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#1E181A] border border-[#D4AF37]/30 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-start justify-between pb-3 border-b border-white/10">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">
                  {previewProduct.department} Specification Snapshot
                </span>
                <h3 className="font-serif text-lg text-[#FAF7F2] mt-0.5">{previewProduct.name}</h3>
              </div>
              <button
                onClick={() => setPreviewProduct(null)}
                className="text-gray-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            {previewProduct.images && previewProduct.images[0] && (
              <div className="w-full h-44 rounded-xl overflow-hidden bg-[#140F11]">
                <img
                  src={previewProduct.images[0]}
                  alt={previewProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-[#140F11]">
                <span className="text-[10px] text-gray-500 uppercase block">Category</span>
                <span className="text-gray-200 font-medium">{previewProduct.category}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#140F11]">
                <span className="text-[10px] text-gray-500 uppercase block">Status</span>
                <span className="text-gray-200 font-medium">{previewProduct.status}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#140F11]">
                <span className="text-[10px] text-gray-500 uppercase block">Price</span>
                <span className="text-emerald-400 font-bold">
                  ₹{previewProduct.salePrice || previewProduct.price}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#140F11]">
                <span className="text-[10px] text-gray-500 uppercase block">Stock Quantity</span>
                <span className="text-gray-200 font-medium">{previewProduct.stock} units</span>
              </div>

              {previewProduct.fabric && (
                <div className="col-span-2 p-2.5 rounded-lg bg-[#140F11]">
                  <span className="text-[10px] text-gray-500 uppercase block">Fabric / Material</span>
                  <span className="text-gray-200">{previewProduct.fabric}</span>
                </div>
              )}

              {previewProduct.department === 'Sarees' && (
                <div className="col-span-2 p-2.5 rounded-lg bg-[#140F11] flex justify-between">
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase block">Blouse Piece</span>
                    <span className="text-gray-200 font-medium">
                      {previewProduct.blousePieceIncluded ? 'Yes, Included' : 'No Blouse'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase block">Occasion</span>
                    <span className="text-[#D4AF37] font-medium">{previewProduct.occasion || '—'}</span>
                  </div>
                </div>
              )}

              {previewProduct.department === 'Ladies Suits' && (
                <div className="col-span-2 p-2.5 rounded-lg bg-[#140F11] flex justify-between">
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase block">Configuration</span>
                    <span className="text-gray-200 font-medium">{previewProduct.suitType}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase block">Size</span>
                    <span className="text-sky-300 font-medium">{previewProduct.size}</span>
                  </div>
                </div>
              )}

              {previewProduct.department === 'Bed Sheets' && (
                <div className="col-span-2 p-2.5 rounded-lg bg-[#140F11] flex justify-between">
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase block">Bed Size</span>
                    <span className="text-amber-300 font-medium">{previewProduct.bedSize}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase block">Pillow Covers</span>
                    <span className="text-gray-200 font-medium">
                      {previewProduct.pillowCoversIncluded ? 'Included (2)' : 'Not Included'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <Link
                href={`/admin/products/${previewProduct.id}/edit`}
                className="flex-1 py-2.5 rounded-xl bg-[#251D20] hover:bg-[#2F2529] border border-[#D4AF37]/30 text-[#D4AF37] text-center font-semibold text-xs uppercase tracking-wider transition-colors"
              >
                Edit Listing
              </Link>
              <button
                onClick={() => setPreviewProduct(null)}
                className="flex-1 py-2.5 rounded-xl bg-[#D4AF37] text-[#1A1315] font-semibold text-xs uppercase tracking-wider hover:bg-[#B8952B] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#1E181A] border border-red-900/60 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-start gap-3.5 pb-4 border-b border-white/10">
              <div className="w-10 h-10 rounded-xl bg-red-950/70 border border-red-800 text-red-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg text-[#FAF7F2]">Delete Product Listing?</h3>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  Are you sure you want to delete this product? This will remove the record permanently from the SQLite database.
                </p>
              </div>
            </div>

            {/* Target Product Summary Box */}
            <div className="p-3.5 rounded-xl bg-[#140F11] border border-white/5 flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#1E181A] shrink-0 border border-white/10">
                {productToDelete.images && productToDelete.images[0] ? (
                  <img
                    src={productToDelete.images[0]}
                    alt={productToDelete.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600">
                    <Shirt className="w-4 h-4" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-medium text-[#FAF7F2] text-xs truncate">
                  {productToDelete.name}
                </div>
                <div className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-2">
                  <span className="text-gray-300">{productToDelete.department}</span>
                  <span>•</span>
                  <span className="text-[#D4AF37]">{productToDelete.category}</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-semibold">
                    ₹{(productToDelete.salePrice || productToDelete.price).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Confirmation Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl border border-white/10 text-xs text-gray-300 hover:bg-white/5 font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold uppercase tracking-wider transition-colors shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Deleting...' : 'Yes, Delete Product'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminProductsPage() {
  return (
    <Suspense fallback={<div className="text-xs text-gray-400 p-8">Loading catalogue...</div>}>
      <ProductsListContent />
    </Suspense>
  );
}

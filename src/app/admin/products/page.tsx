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
  RotateCcw,
  CheckCircle2,
  Eye,
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

  // Fetch real products from server-side API
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
      setError('Could not connect to database.');
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
        alert(data.error || 'Failed to delete product.');
        setIsDeleting(false);
        return;
      }

      await fetchProducts();
      setProductToDelete(null);
      setIsDeleting(false);
      setDeletedToastMessage(`"${deletedName}" was removed from your store.`);
      setTimeout(() => {
        setDeletedToastMessage('');
      }, 4500);
    } catch {
      alert('Network error while attempting to delete product.');
      setIsDeleting(false);
    }
  };

  // Filter products in memory
  const filteredProducts = products.filter((p) => {
    if (selectedDepartment !== 'All' && p.department !== selectedDepartment) {
      return false;
    }
    if (selectedStatus !== 'All' && p.status !== selectedStatus) {
      return false;
    }
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
          <h1 className="font-serif text-2xl sm:text-3xl text-[#FAF7F2] font-normal">
            Product Catalogue
          </h1>
          <p className="text-sm text-gray-300 mt-1">
            Manage your store&apos;s Sarees, Ladies Suits, and Bed Sheets ({products.length} total items).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchProducts}
            disabled={isLoading}
            className="px-3.5 py-2.5 rounded-xl bg-[#1E181A] hover:bg-[#251D20] text-gray-300 hover:text-white border border-white/10 text-sm font-medium transition-colors cursor-pointer flex items-center gap-2"
          >
            <RotateCcw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#D4AF37]' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <Link
            href="/admin/products/new"
            className="px-5 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#C29F2F] text-[#1A1315] text-sm font-semibold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      {/* Notifications */}
      {isCreatedJustNow && (
        <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-700 text-emerald-200 text-sm flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>
              <strong>Product Added Successfully!</strong> The new item is now saved and available in your store.
            </span>
          </div>
        </div>
      )}

      {isUpdatedJustNow && (
        <div className="p-4 rounded-xl bg-sky-950/70 border border-sky-700 text-sky-200 text-sm flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-sky-400 shrink-0" />
            <span>
              <strong>Product Updated!</strong> Your changes were saved successfully.
            </span>
          </div>
        </div>
      )}

      {deletedToastMessage && (
        <div className="p-4 rounded-xl bg-amber-950/70 border border-amber-700 text-amber-200 text-sm flex items-center justify-between animate-fadeIn">
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
        <div className="p-4 rounded-xl bg-red-950/70 border border-red-800 text-red-200 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchProducts} className="underline text-red-300 ml-2">
            Retry
          </button>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="p-5 rounded-2xl bg-[#1E181A] border border-[#D4AF37]/20 space-y-4">
        {/* Department Filter Tabs */}
        <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-white/5">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
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
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                    isSelected
                      ? 'bg-[#D4AF37] text-[#1A1315] font-bold shadow-sm'
                      : 'bg-[#140F11] text-gray-300 hover:text-white border border-white/5'
                  }`}
                >
                  <span>{dept}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      isSelected
                        ? 'bg-[#1A1315]/20 text-[#1A1315] font-bold'
                        : 'bg-white/10 text-gray-300'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Status Dropdown */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-300 font-medium">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-[#140F11] border border-white/10 rounded-xl px-3 py-1.5 text-sm text-[#FAF7F2] font-medium focus:outline-none focus:border-[#D4AF37] cursor-pointer"
            >
              <option value="All">All Statuses ({products.length})</option>
              <option value="Active">
                Active ({products.filter((p) => p.status === 'Active').length})
              </option>
              <option value="Draft">
                Draft ({products.filter((p) => p.status === 'Draft').length})
              </option>
              <option value="Sold Out">
                Sold Out ({products.filter((p) => p.status === 'Sold Out').length})
              </option>
            </select>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by product name, category, fabric, or color..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#140F11] border border-white/10 rounded-xl pl-11 pr-10 py-3 text-sm text-[#FAF7F2] placeholder-gray-400 focus:outline-none focus:border-[#D4AF37] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Loading Spinner */}
      {isLoading && (
        <div className="p-12 text-center rounded-2xl bg-[#1E181A] border border-[#D4AF37]/20 space-y-3">
          <div className="inline-block w-8 h-8 border-2 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin" />
          <p className="text-sm text-gray-300">Loading products...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredProducts.length === 0 && (
        <div className="p-12 text-center rounded-2xl bg-[#1E181A] border border-[#D4AF37]/20 space-y-4">
          <Shirt className="w-12 h-12 text-gray-500 mx-auto" />
          <h2 className="font-serif text-xl text-[#FAF7F2]">No Products Found</h2>
          <p className="text-sm text-gray-300 max-w-md mx-auto leading-relaxed">
            {searchQuery || selectedDepartment !== 'All' || selectedStatus !== 'All'
              ? 'No products match your current search or filter criteria. Try clearing the search or selecting "All".'
              : 'You have not added any products yet. Click "Add New Product" to create your first item.'}
          </p>
          {(searchQuery || selectedDepartment !== 'All' || selectedStatus !== 'All') && (
            <button
              onClick={() => {
                setSelectedDepartment('All');
                setSelectedStatus('All');
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-xl bg-[#251D20] text-sm text-[#D4AF37] hover:bg-[#2F2428] border border-[#D4AF37]/30 font-medium cursor-pointer"
            >
              Clear All Filters
            </button>
          )}
        </div>
      )}

      {/* Products Table */}
      {!isLoading && filteredProducts.length > 0 && (
        <div className="rounded-2xl bg-[#1E181A] border border-[#D4AF37]/20 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-200">
              <thead className="bg-[#251D20] text-gray-300 uppercase tracking-wider text-xs font-semibold border-b border-white/10">
                <tr>
                  <th className="py-4 px-5 sm:px-6">Product</th>
                  <th className="py-4 px-4">Category</th>
                  <th className="py-4 px-4">Price</th>
                  <th className="py-4 px-4">Stock</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-5 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 bg-[#1E181A]">
                {filteredProducts.map((prod) => (
                  <tr key={prod.id} className="hover:bg-[#251D20]/60 transition-colors">
                    {/* Image & Title */}
                    <td className="py-4 px-5 sm:px-6">
                      <div className="flex items-center gap-4">
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-[#140F11] border border-white/10 shrink-0">
                          {prod.images && prod.images[0] ? (
                            <img
                              src={prod.images[0]}
                              alt={prod.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500">
                              <Shirt className="w-6 h-6" />
                            </div>
                          )}
                          {prod.images && prod.images.length > 1 && (
                            <span className="absolute bottom-0 right-0 bg-black/80 text-[10px] px-1.5 py-0.5 text-white font-bold rounded-tl">
                              +{prod.images.length - 1}
                            </span>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="font-semibold text-[#FAF7F2] text-sm line-clamp-1 max-w-xs sm:max-w-sm">
                            {prod.name}
                          </div>
                          <div className="text-xs text-gray-400 mt-1 flex items-center gap-2">
                            <span>{prod.department}</span>
                            {prod.color && (
                              <>
                                <span>•</span>
                                <span className="text-[#D4AF37]">{prod.color}</span>
                              </>
                            )}
                            {prod.fabric && (
                              <>
                                <span className="hidden sm:inline">•</span>
                                <span className="hidden sm:inline text-gray-400">{prod.fabric}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Department & Category */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getDepartmentBadgeStyle(
                            prod.department
                          )}`}
                        >
                          {prod.category}
                        </span>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      {prod.salePrice ? (
                        <div>
                          <div className="font-bold text-emerald-400 text-sm">
                            ₹{prod.salePrice.toLocaleString('en-IN')}
                          </div>
                          <div className="text-xs text-gray-500 line-through">
                            ₹{prod.price.toLocaleString('en-IN')}
                          </div>
                        </div>
                      ) : (
                        <div className="font-bold text-[#FAF7F2] text-sm">
                          ₹{prod.price.toLocaleString('en-IN')}
                        </div>
                      )}
                    </td>

                    {/* Stock */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span
                        className={`text-sm font-semibold ${
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
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeStyle(
                          prod.status
                        )}`}
                      >
                        {prod.status}
                      </span>
                    </td>

                    {/* Action Buttons: Edit, Delete, View - All Clearly Labeled! */}
                    <td className="py-4 px-5 sm:px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {/* 1. View Button */}
                        <button
                          onClick={() => setPreviewProduct(prod)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#251D20] hover:bg-[#2F2428] text-gray-300 hover:text-white border border-white/10 text-xs font-medium transition-colors cursor-pointer"
                          title="View Product Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>

                        {/* 2. Edit Button */}
                        <Link
                          href={`/admin/products/${prod.id}/edit`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#251D20] hover:bg-[#2F2428] text-[#D4AF37] hover:text-[#E5C358] border border-[#D4AF37]/30 text-xs font-semibold transition-colors cursor-pointer"
                          title="Edit Product"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </Link>

                        {/* 3. Delete Button */}
                        <button
                          onClick={() => setProductToDelete(prod)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/30 hover:bg-red-950/60 text-red-300 border border-red-900/40 text-xs font-medium transition-colors cursor-pointer"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Snapshot Preview Modal */}
      {previewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#1E181A] border border-[#D4AF37]/30 rounded-2xl max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl relative">
            <div className="flex items-start justify-between pb-3 border-b border-white/10">
              <div>
                <span className="text-xs font-semibold text-[#D4AF37]">
                  {previewProduct.department}
                </span>
                <h3 className="font-serif text-xl text-[#FAF7F2] mt-0.5">{previewProduct.name}</h3>
              </div>
              <button
                onClick={() => setPreviewProduct(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {previewProduct.images && previewProduct.images[0] && (
              <div className="w-full h-52 rounded-xl overflow-hidden bg-[#140F11]">
                <img
                  src={previewProduct.images[0]}
                  alt={previewProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 rounded-xl bg-[#140F11]">
                <span className="text-xs text-gray-400 block">Category</span>
                <span className="text-gray-200 font-medium">{previewProduct.category}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#140F11]">
                <span className="text-xs text-gray-400 block">Status</span>
                <span className="text-gray-200 font-medium">{previewProduct.status}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#140F11]">
                <span className="text-xs text-gray-400 block">Price</span>
                <span className="text-emerald-400 font-bold">
                  ₹{(previewProduct.salePrice || previewProduct.price).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#140F11]">
                <span className="text-xs text-gray-400 block">In Stock</span>
                <span className="text-gray-200 font-medium">{previewProduct.stock} units</span>
              </div>

              {previewProduct.fabric && (
                <div className="col-span-2 p-3 rounded-xl bg-[#140F11]">
                  <span className="text-xs text-gray-400 block">Fabric</span>
                  <span className="text-gray-200">{previewProduct.fabric}</span>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Link
                href={`/admin/products/${previewProduct.id}/edit`}
                className="flex-1 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#C29F2F] text-[#1A1315] text-center font-semibold text-sm transition-colors"
              >
                Edit Product
              </Link>
              <button
                onClick={() => setPreviewProduct(null)}
                className="flex-1 py-2.5 rounded-xl bg-[#251D20] text-gray-300 font-medium text-sm hover:bg-[#2F2428] border border-white/10 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#1E181A] border border-red-900/60 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-start gap-3.5 pb-4 border-b border-white/10">
              <div className="w-10 h-10 rounded-xl bg-red-950/70 border border-red-800 text-red-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg text-[#FAF7F2]">Delete This Product?</h3>
                <p className="text-sm text-gray-300 mt-1 leading-relaxed">
                  Are you sure you want to delete this product? It will be permanently removed from your store website.
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
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    <Shirt className="w-5 h-5" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-medium text-[#FAF7F2] text-sm truncate">
                  {productToDelete.name}
                </div>
                <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-2">
                  <span>{productToDelete.department}</span>
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
                className="px-4 py-2.5 rounded-xl border border-white/10 text-sm text-gray-300 hover:bg-white/5 font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-60"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeleting ? 'Deleting...' : 'Delete Product'}</span>
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
    <Suspense fallback={<div className="text-sm text-gray-300 p-8">Loading products...</div>}>
      <ProductsListContent />
    </Suspense>
  );
}

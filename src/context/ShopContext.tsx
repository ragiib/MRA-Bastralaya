'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { Product } from '../types';
import { ProductItem } from '@/types/product';
import { CartItem, CartItemProduct } from '@/types/cart';

interface ShopContextType {
  cartItems: CartItem[];
  wishlistIds: string[];
  isCartOpen: boolean;
  quickViewProduct: Product | null;
  toastMessage: string | null;
  addToCart: (product: Product | ProductItem, quantity?: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  openQuickView: (product: Product) => void;
  closeQuickView: () => void;
  toggleCart: (isOpen?: boolean) => void;
  totalCartCount: number;
  totalCartPrice: number;
  refreshCart: () => Promise<void>;
  isAuthenticated: boolean;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

const GUEST_CART_KEY = 'mra_guest_cart';

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>(['p-101', 'p-103']); // pre-fill 2 items for visual showcase
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  /**
   * Refreshes cart state and auth status:
   * - Checks auth state directly via /api/auth/me.
   * - If user is logged in: merges any local guest items into DB and fetches server cart.
   * - If guest: loads from localStorage and validates live stock with server.
   */
  const refreshCart = useCallback(async () => {
    try {
      // 1. Directly check authentication status (independent of profile completeness)
      try {
        const authRes = await fetch('/api/auth/me');
        if (authRes.ok) {
          const authData = await authRes.json();
          setIsAuthenticated(Boolean(authData.user));
        }
      } catch {
        // ignore error
      }

      const res = await fetch('/api/cart');
      if (!res.ok) return;
      const data = await res.json();

      if (data.authenticated) {
        setIsAuthenticated(true);
        // Check if there are local guest items to merge
        if (typeof window !== 'undefined') {
          const rawGuest = localStorage.getItem(GUEST_CART_KEY);
          if (rawGuest) {
            try {
              const guestItems: CartItem[] = JSON.parse(rawGuest);
              if (Array.isArray(guestItems) && guestItems.length > 0) {
                const mergePayload = guestItems.map((item) => ({
                  productId: item.productId,
                  quantity: item.quantity,
                  priceAtAdd: item.priceAtAdd,
                }));

                const mergeRes = await fetch('/api/cart/merge', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ guestItems: mergePayload }),
                });

                if (mergeRes.ok) {
                  const mergeData = await mergeRes.json();
                  localStorage.removeItem(GUEST_CART_KEY);
                  setCartItems(mergeData.items || []);
                  return;
                }
              }
            } catch (e) {
              console.error('Failed to parse guest cart for merge', e);
            }
          }
        }
        setCartItems(data.items || []);
      } else {
        setIsAuthenticated(false);
        // Load guest cart from localStorage
        if (typeof window !== 'undefined') {
          const raw = localStorage.getItem(GUEST_CART_KEY);
          if (raw) {
            try {
              const items: CartItem[] = JSON.parse(raw);
              if (Array.isArray(items) && items.length > 0) {
                // Fetch fresh stock and status for guest items
                const productIds = items.map((i) => i.productId);
                const validateRes = await fetch('/api/cart/validate', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ productIds }),
                });

                if (validateRes.ok) {
                  const valData = await validateRes.json();
                  const updated = items.map((item) => {
                    const fresh = valData.products?.[item.productId];
                    if (fresh) {
                      return {
                        ...item,
                        product: {
                          ...item.product,
                          stock: fresh.stock,
                          status: fresh.status,
                        },
                      };
                    }
                    return item;
                  });
                  setCartItems(updated);
                  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(updated));
                  return;
                }
                setCartItems(items);
                return;
              }
            } catch (e) {
              console.error('Failed to load guest cart from localStorage', e);
            }
          }
        }
        setCartItems([]);
      }
    } catch (error) {
      console.error('Failed to refresh cart', error);
    }
  }, []);

  // Initialize and refresh cart + auth status on mount and whenever the route changes
  useEffect(() => {
    refreshCart();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === GUEST_CART_KEY) {
        refreshCart();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [refreshCart, pathname]);

  /**
   * Adds an item to the shopping cart (supporting both ProductItem and legacy Product).
   */
  const addToCart = async (product: Product | ProductItem, quantity = 1) => {
    const isProductItem = 'department' in product;

    const availableStock = isProductItem
      ? product.stock
      : 'inStock' in product && product.inStock
      ? 99
      : 0;

    const currentStatus = isProductItem
      ? product.status
      : 'inStock' in product && product.inStock
      ? 'Active'
      : 'Sold Out';

    if (currentStatus === 'Sold Out' || currentStatus === 'Draft' || availableStock <= 0) {
      showNotification('This item is currently Sold Out and cannot be added.');
      return;
    }

    // Determine unit price at time of adding
    let unitPrice = product.price;
    if (isProductItem) {
      if (product.salePrice && product.salePrice < product.price) {
        unitPrice = product.salePrice;
      }
    }

    const primaryImage = isProductItem
      ? product.images && product.images.length > 0
        ? product.images[0]
        : '/images/sarees/01_printed_cotton.jpg'
      : product.image || '/images/sarees/01_printed_cotton.jpg';

    const normalizedProduct: CartItemProduct = {
      id: product.id,
      name: product.name,
      department: (isProductItem ? product.department : 'Sarees') as any,
      category: product.category,
      categorySlug:
        'categorySlug' in product && product.categorySlug ? product.categorySlug : 'sarees',
      price: product.price,
      salePrice: isProductItem ? product.salePrice : undefined,
      stock: availableStock,
      status: currentStatus as any,
      images: [primaryImage],
      fabric: product.fabric,
    };

    // Calculate updated cart
    const existing = cartItems.find((i) => i.productId === product.id);
    const currentQty = existing ? existing.quantity : 0;
    const addQty = Math.min(Math.max(1, quantity), availableStock);
    const targetQty = Math.min(currentQty + addQty, availableStock);

    if (currentQty >= availableStock) {
      showNotification(
        `All available units (${availableStock}) of this item are already in your cart.`
      );
      return;
    }

    let updatedList: CartItem[];
    if (existing) {
      updatedList = cartItems.map((item) =>
        item.productId === product.id ? { ...item, quantity: targetQty } : item
      );
    } else {
      const newItem: CartItem = {
        id: `ci-${Date.now()}-${product.id}`,
        productId: product.id,
        quantity: addQty,
        priceAtAdd: unitPrice,
        product: normalizedProduct,
      };
      updatedList = [...cartItems, newItem];
    }

    setCartItems(updatedList);
    showNotification(
      `"${addQty > 1 ? `${addQty} × ` : ''}${product.name}" added to your Cart!`
    );

    // Persist changes
    if (isAuthenticated) {
      try {
        const res = await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: product.id,
            quantity: addQty,
            priceAtAdd: unitPrice,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.items) setCartItems(data.items);
        }
      } catch (err) {
        console.error('Failed to sync cart with server', err);
      }
    } else {
      // Guest localStorage persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem(GUEST_CART_KEY, JSON.stringify(updatedList));
      }
    }
  };

  /**
   * Updates line item quantity.
   */
  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    const item = cartItems.find((i) => i.productId === productId);
    if (!item) return;

    const maxStock = item.product.stock;
    const validQty = Math.min(quantity, Math.max(1, maxStock));

    const updatedList = cartItems.map((i) =>
      i.productId === productId ? { ...i, quantity: validQty } : i
    );

    setCartItems(updatedList);

    if (isAuthenticated) {
      try {
        const res = await fetch('/api/cart', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId, quantity: validQty }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.items) setCartItems(data.items);
        }
      } catch (err) {
        console.error('Failed to update quantity on server', err);
      }
    } else {
      if (typeof window !== 'undefined') {
        localStorage.setItem(GUEST_CART_KEY, JSON.stringify(updatedList));
      }
    }
  };

  /**
   * Removes an item from the cart.
   */
  const removeFromCart = async (productId: string) => {
    const updatedList = cartItems.filter((item) => item.productId !== productId);
    setCartItems(updatedList);
    showNotification('Item removed from your cart');

    if (isAuthenticated) {
      try {
        const res = await fetch(`/api/cart?productId=${encodeURIComponent(productId)}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          const data = await res.json();
          if (data.items) setCartItems(data.items);
        }
      } catch (err) {
        console.error('Failed to remove item on server', err);
      }
    } else {
      if (typeof window !== 'undefined') {
        localStorage.setItem(GUEST_CART_KEY, JSON.stringify(updatedList));
      }
    }
  };

  /**
   * Clears the cart.
   */
  const clearCart = async () => {
    setCartItems([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(GUEST_CART_KEY);
    }
    if (isAuthenticated) {
      try {
        await fetch('/api/cart?all=true', { method: 'DELETE' });
      } catch (err) {
        console.error('Failed to clear server cart', err);
      }
    }
  };

  const toggleWishlist = (productId: string) => {
    setWishlistIds((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        showNotification('Removed from Wishlist');
        return prev.filter((id) => id !== productId);
      } else {
        showNotification('Saved to your Wishlist ♥');
        return [...prev, productId];
      }
    });
  };

  const isWishlisted = (productId: string) => wishlistIds.includes(productId);

  const openQuickView = (product: Product) => {
    setQuickViewProduct(product);
  };

  const closeQuickView = () => {
    setQuickViewProduct(null);
  };

  const toggleCart = (isOpen?: boolean) => {
    setIsCartOpen((prev) => (typeof isOpen === 'boolean' ? isOpen : !prev));
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalCartPrice = cartItems.reduce(
    (acc, item) => acc + item.priceAtAdd * item.quantity,
    0
  );

  return (
    <ShopContext.Provider
      value={{
        cartItems,
        wishlistIds,
        isCartOpen,
        quickViewProduct,
        toastMessage,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        toggleWishlist,
        isWishlisted,
        openQuickView,
        closeQuickView,
        toggleCart,
        totalCartCount,
        totalCartPrice,
        refreshCart,
        isAuthenticated,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
}

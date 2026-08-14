'use client';

import React, { createContext, useContext, useState } from 'react';
import { Product, CartItem } from '../types';

interface ShopContextType {
  cartItems: CartItem[];
  wishlistIds: string[];
  isCartOpen: boolean;
  quickViewProduct: Product | null;
  toastMessage: string | null;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  openQuickView: (product: Product) => void;
  closeQuickView: () => void;
  toggleCart: (isOpen?: boolean) => void;
  totalCartCount: number;
  totalCartPrice: number;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>(['p-101', 'p-103']); // pre-fill 2 items for visual demonstration
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const addToCart = (product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    showNotification(`"${product.name}" added to your Cart!`);
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const toggleWishlist = (productId: string) => {
    setWishlistIds(prev => {
      const exists = prev.includes(productId);
      if (exists) {
        showNotification('Removed from Wishlist');
        return prev.filter(id => id !== productId);
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
    setIsCartOpen(prev => (typeof isOpen === 'boolean' ? isOpen : !prev));
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalCartPrice = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  return (
    <ShopContext.Provider
      value={{
        cartItems,
        wishlistIds,
        isCartOpen,
        quickViewProduct,
        toastMessage,
        addToCart,
        removeFromCart,
        toggleWishlist,
        isWishlisted,
        openQuickView,
        closeQuickView,
        toggleCart,
        totalCartCount,
        totalCartPrice,
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

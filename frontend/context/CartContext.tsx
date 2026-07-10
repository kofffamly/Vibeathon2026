import React, { createContext, useContext, useState } from 'react';
import type { Listing } from '@/data/mockData';

export type CartItem = {
  listing: Listing;
  qty:     number;
};

type CartContextType = {
  cartItems:  CartItem[];
  addToCart:  (listing: Listing) => void;
  updateQty:  (id: string, qty: number) => void;
  clearCart:  () => void;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addToCart = (listing: Listing) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.listing.id === listing.id);
      if (existing) {
        return prev.map(i => i.listing.id === listing.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { listing, qty: 1 }];
    });
  };

  const updateQty = (id: string, qty: number) => {
    if (qty < 1) {
      setCartItems(prev => prev.filter(i => i.listing.id !== id));
    } else {
      setCartItems(prev => prev.map(i => i.listing.id === id ? { ...i, qty } : i));
    }
  };

  const clearCart = () => setCartItems([]);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, updateQty, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextType {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}

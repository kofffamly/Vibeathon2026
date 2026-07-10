import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Listing } from '@/data/mockData';

export type CartItem = {
  listing: Listing;
  qty:     number;
};

type CartStore = {
  items:      CartItem[];
  addItem:    (listing: Listing) => void;
  updateQty:  (id: string, qty: number) => void;
  clearCart:  () => void;
  total:      () => number;
  totalItems: () => number;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (listing) => {
        const existing = get().items.find(i => i.listing.id === listing.id);
        if (existing) {
          set(s => ({
            items: s.items.map(i =>
              i.listing.id === listing.id ? { ...i, qty: i.qty + 1 } : i
            ),
          }));
        } else {
          set(s => ({ items: [...s.items, { listing, qty: 1 }] }));
        }
      },

      updateQty: (id, qty) => {
        if (qty < 1) {
          set(s => ({ items: s.items.filter(i => i.listing.id !== id) }));
        } else {
          set(s => ({ items: s.items.map(i => i.listing.id === id ? { ...i, qty } : i) }));
        }
      },

      clearCart: () => set({ items: [] }),

      total: () => get().items.reduce(
        (sum, i) => {
          const raw = i.listing.price;
          const numericPrice = typeof raw === 'number'
            ? raw
            : parseInt(String(raw).replace(/[^\d]/g, ''), 10) || 0;
          return sum + numericPrice * i.qty;
        }, 0
      ),

      totalItems: () => get().items.reduce((sum, i) => sum + i.qty, 0),
    }),
    {
      name:    'agromarket-cart',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

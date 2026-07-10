import { create } from 'zustand';
import { Recolte } from '../lib/supabase';

interface CartItem { recolte: Recolte; quantity: number }

interface CartState {
  items: CartItem[];
  addItem: (recolte: Recolte, quantity: number) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, quantity: number) => void;
  clearCart: () => void;
  total: () => number;
  totalItems: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addItem: (recolte, quantity) => {
    const existing = get().items.find(i => i.recolte.id === recolte.id);
    if (existing) {
      set({ items: get().items.map(i => i.recolte.id === recolte.id ? { ...i, quantity: i.quantity + quantity } : i) });
    } else {
      set({ items: [...get().items, { recolte, quantity }] });
    }
  },

  removeItem: (id) => set({ items: get().items.filter(i => i.recolte.id !== id) }),

  updateQty: (id, quantity) => set({ items: get().items.map(i => i.recolte.id === id ? { ...i, quantity } : i) }),

  clearCart: () => set({ items: [] }),

  total: () => get().items.reduce((sum, i) => sum + i.recolte.prix_fcfa_kg * i.quantity, 0),

  totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
}));

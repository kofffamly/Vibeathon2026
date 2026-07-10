import { create } from 'zustand';

export type CartItem = {
  id: string;
  nom: string;
  localisation: string;
  prixUnit: number;
  quantite: number;
  emoji: string;
};

type CartStore = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantite'>) => void;
  removeItem: (id: string) => void;
  updateQte: (id: string, quantite: number) => void;
  clearCart: () => void;
  total: () => number;
  totalItems: () => number;
};

export const useCartStore = create<CartStore>((set, get) => ({
  items: [
    {
      id: '1',
      nom: 'Bœufs zébus — race locale',
      localisation: 'Bouaké',
      prixUnit: 180000,
      quantite: 1,
      emoji: '🐄',
    },
  ],

  addItem: (item) => {
    const existing = get().items.find(i => i.id === item.id);
    if (existing) {
      set(s => ({
        items: s.items.map(i =>
          i.id === item.id ? { ...i, quantite: i.quantite + 1 } : i
        ),
      }));
    } else {
      set(s => ({ items: [...s.items, { ...item, quantite: 1 }] }));
    }
  },

  removeItem: (id) =>
    set(s => ({ items: s.items.filter(i => i.id !== id) })),

  updateQte: (id, quantite) => {
    if (quantite < 1) {
      get().removeItem(id);
      return;
    }
    set(s => ({
      items: s.items.map(i => (i.id === id ? { ...i, quantite } : i)),
    }));
  },

  clearCart: () => set({ items: [] }),

  total: () =>
    get().items.reduce((sum, i) => sum + i.prixUnit * i.quantite, 0),

  totalItems: () =>
    get().items.reduce((sum, i) => sum + i.quantite, 0),
}));

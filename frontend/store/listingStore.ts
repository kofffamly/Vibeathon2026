import { create } from 'zustand';
import { apiClient } from '../api/client';
import type { Listing } from '@/data/mockData';

type ListingStore = {
  listings:   Listing[];
  isLoading: boolean;
  error: string | null;
  fetchListings: (params?: Record<string, string>) => Promise<void>;
  addListing: (listing: Partial<Listing>) => Promise<{ success: boolean; error?: string }>;
};

export const useListingStore = create<ListingStore>((set) => ({
  listings: [],
  isLoading: false,
  error: null,
  
  fetchListings: async (params) => {
    set({ isLoading: true, error: null });
    try {
      let url = '/products';
      if (params) {
        const query = new URLSearchParams(params).toString();
        if (query) url += `?${query}`;
      }
      const data = await apiClient(url);
      const mapped = data.map((item: any) => ({
        id: item.id,
        title: item.titre,
        description: item.description,
        price: item.prixUnit,
        location: item.localisation,
        category: item.category,
        seller: item.sellerId || 'Vendeur Inconnu',
        image: item.imageUrl || 'https://images.unsplash.com/photo-1601593346740-925612772716?w=400&h=300&fit=crop&auto=format',
        emoji: item.emoji,
        lat: item.lat,
        lng: item.lng,
      }));
      set({ listings: mapped, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },
  
  addListing: async (listing) => {
    try {
      const payload = {
        titre: listing.title,
        description: listing.description,
        prixUnit: listing.price,
        localisation: listing.location,
        category: listing.category,
        emoji: listing.emoji,
        imageUrl: listing.image,
      };
      const data = await apiClient('/products', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      const mappedListing = {
        id: data.id,
        title: data.titre,
        description: data.description,
        price: data.prixUnit,
        location: data.localisation,
        category: data.category,
        seller: data.sellerId,
        image: data.imageUrl,
        emoji: data.emoji,
      };
      set((s) => ({ listings: [mappedListing, ...s.listings] }));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },
}));


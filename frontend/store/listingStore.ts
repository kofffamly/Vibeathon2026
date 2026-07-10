import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Listing } from '@/data/mockData';

type ListingStore = {
  listings:   Listing[];
  addListing: (listing: Listing) => void;
};

export const useListingStore = create<ListingStore>()(
  persist(
    (set) => ({
      listings: [],
      addListing: (listing) =>
        set(s => ({ listings: [listing, ...s.listings] })),
    }),
    {
      name:    'agromarket-listings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

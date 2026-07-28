import { create } from "zustand";
import type { MarketplaceListing } from "@/lib/api/mock-db";
import { mockMarketplace } from "@/lib/api/mock-db";

interface MarketplaceState {
  listings: MarketplaceListing[];
  selectedListing: MarketplaceListing | null;
  filters: { type: string; location: string; minRating: number };
  selectListing: (id: string) => void;
  setFilter: (key: string, value: string | number) => void;
  contactProfessional: (id: string, message: string) => Promise<boolean>;
  submitReview: (id: string, rating: number, review: string) => Promise<void>;
}

export const useMarketplaceStore = create<MarketplaceState>((set, get) => ({
  listings: mockMarketplace,
  selectedListing: null,
  filters: { type: "all", location: "all", minRating: 0 },

  selectListing: (id) => {
    set({ selectedListing: get().listings.find((l) => l.id === id) || null });
  },

  setFilter: (key, value) => {
    set((state) => ({ filters: { ...state.filters, [key]: value } }));
  },

  contactProfessional: async (_id, _message) => {
    await new Promise((r) => setTimeout(r, 800));
    return true;
  },

  submitReview: async (_id, _rating, _review) => {
    await new Promise((r) => setTimeout(r, 600));
  },
}));

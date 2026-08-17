import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getStorageKey = (userId: number) => `products_user_${userId}`;

export interface MergeResult {
  added: number;
  updated: number;
}

/** Smart upsert — match by SKU first, then name+category */
export const mergeProducts = (existing: any[], incoming: any[]): { merged: any[]; result: MergeResult } => {
  const merged = [...existing];
  let added = 0;
  let updated = 0;

  incoming.forEach((newProduct) => {
    const existingIndex = merged.findIndex((p) => {
      // Match by SKU if both have it
      if (newProduct.sku && p.sku) return p.sku === newProduct.sku;
      // Fallback: match by name + category (case-insensitive)
      return (
        p.name.toLowerCase().trim() === newProduct.name.toLowerCase().trim() &&
        p.category.toLowerCase().trim() === newProduct.category.toLowerCase().trim()
      );
    });

    if (existingIndex !== -1) {
      // Update existing, preserve original id
      merged[existingIndex] = {
        ...merged[existingIndex],
        ...newProduct,
        id: merged[existingIndex].id,
        lastUpdated: 'Just updated',
      };
      updated++;
    } else {
      merged.push(newProduct);
      added++;
    }
  });

  return { merged, result: { added, updated } };
};

interface ProductState {
  products: any[];
  setProducts: (products: any[]) => void;
  loadProducts: (userId: number) => Promise<void>;
  saveProducts: (userId: number, products: any[]) => Promise<void>;
  mergeAndSave: (userId: number, incoming: any[]) => Promise<MergeResult>;
  clearProducts: () => void;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],

  setProducts: (products) => set({ products }),

  loadProducts: async (userId: number) => {
    try {
      const stored = await AsyncStorage.getItem(getStorageKey(userId));
      if (stored) {
        set({ products: JSON.parse(stored) });
      } else {
        set({ products: [] });
      }
    } catch {
      set({ products: [] });
    }
  },

  saveProducts: async (userId: number, products: any[]) => {
    try {
      set({ products });
      await AsyncStorage.setItem(getStorageKey(userId), JSON.stringify(products));
    } catch {
      // Fail silently
    }
  },

  mergeAndSave: async (userId: number, incoming: any[]) => {
    const existing = get().products;
    const { merged, result } = mergeProducts(existing, incoming);
    try {
      set({ products: merged });
      await AsyncStorage.setItem(getStorageKey(userId), JSON.stringify(merged));
    } catch {
      // Fail silently
    }
    return result;
  },

  clearProducts: () => set({ products: [] }),
}));

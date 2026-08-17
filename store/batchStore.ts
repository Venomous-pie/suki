import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getStorageKey = (userId: number) => `batches_user_${userId}`;

export type OrderStatus = 'pending' | 'confirmed' | 'packed' | 'out_for_delivery' | 'delivered' | 'cancelled';
export type BatchStatus = 'open' | 'closed' | 'delivered';

export interface OrderItem {
  productId: string;
  productName: string;
  qty: number;
  unit: string;
  price: string;
}

export interface Order {
  id: string;
  batchId: string;
  storeName: string;
  storeOwnerPhone: string;
  items: OrderItem[];
  total: string;
  payment: 'Cash on Delivery' | 'GCash' | 'Maya' | 'Bank Transfer';
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Batch {
  id: string;
  route: string;
  cutoffTime: string;   // ISO string
  deliveryDate: string; // ISO string
  status: BatchStatus;
  orders: Order[];
  createdAt: string;
}

/** Auto-compute consolidated items across all orders in a batch */
export const getConsolidatedItems = (batch: Batch) => {
  const map: Record<string, { name: string; qty: number; unit: string }> = {};
  batch.orders
    .filter(o => o.status !== 'cancelled')
    .forEach(order => {
      order.items.forEach(item => {
        if (map[item.productId]) {
          map[item.productId].qty += item.qty;
        } else {
          map[item.productId] = { name: item.productName, qty: item.qty, unit: item.unit };
        }
      });
    });
  return Object.values(map);
};

/** Compute active order count for a batch */
export const getActiveOrderCount = (batch: Batch) =>
  batch.orders.filter(o => o.status !== 'cancelled').length;

/** Compute total value for a batch */
export const getBatchTotal = (batch: Batch): string => {
  const total = batch.orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, order) => {
      const raw = order.total.replace(/[₱,]/g, '');
      return sum + (parseFloat(raw) || 0);
    }, 0);
  return `₱${total.toLocaleString()}`;
};

interface BatchState {
  batches: Batch[];
  loadBatches: (userId: number) => Promise<void>;
  saveBatches: (userId: number, batches: Batch[]) => Promise<void>;
  createBatch: (userId: number, route: string, cutoffTime: string, deliveryDate: string) => Promise<Batch>;
  updateBatchStatus: (userId: number, batchId: string, status: BatchStatus) => Promise<void>;
  addOrder: (userId: number, order: Order) => Promise<void>;
  updateOrderStatus: (userId: number, batchId: string, orderId: string, status: OrderStatus) => Promise<void>;
  deleteBatch: (userId: number, batchId: string) => Promise<void>;
}

export const useBatchStore = create<BatchState>((set, get) => ({
  batches: [],

  loadBatches: async (userId) => {
    try {
      const stored = await AsyncStorage.getItem(getStorageKey(userId));
      set({ batches: stored ? JSON.parse(stored) : [] });
    } catch {
      set({ batches: [] });
    }
  },

  saveBatches: async (userId, batches) => {
    try {
      set({ batches });
      await AsyncStorage.setItem(getStorageKey(userId), JSON.stringify(batches));
    } catch { /* silent */ }
  },

  createBatch: async (userId, route, cutoffTime, deliveryDate) => {
    const newBatch: Batch = {
      id: `batch_${Date.now()}`,
      route,
      cutoffTime,
      deliveryDate,
      status: 'open',
      orders: [],
      createdAt: new Date().toISOString(),
    };
    const updated = [newBatch, ...get().batches];
    await get().saveBatches(userId, updated);
    return newBatch;
  },

  updateBatchStatus: async (userId, batchId, status) => {
    const updated = get().batches.map(b =>
      b.id === batchId ? { ...b, status } : b
    );
    await get().saveBatches(userId, updated);
  },

  addOrder: async (userId, order) => {
    const updated = get().batches.map(b =>
      b.id === order.batchId ? { ...b, orders: [...b.orders, order] } : b
    );
    await get().saveBatches(userId, updated);
  },

  updateOrderStatus: async (userId, batchId, orderId, status) => {
    const updated = get().batches.map(b =>
      b.id === batchId
        ? {
            ...b,
            orders: b.orders.map(o =>
              o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o
            ),
          }
        : b
    );
    await get().saveBatches(userId, updated);
  },

  deleteBatch: async (userId, batchId) => {
    const updated = get().batches.filter(b => b.id !== batchId);
    await get().saveBatches(userId, updated);
  },
}));

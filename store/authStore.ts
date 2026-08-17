import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const REMEMBER_ME_KEY = 'suki_remember_me';

type Role = 'supplier' | 'store_owner' | null;

interface AuthUser {
  id: number;
  role: Role;
  name?: string;
  phone?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  role: Role;
  token: string | null;
  user: AuthUser | null;
  loginSupplier: (name: string, phone: string) => Promise<void>;
  requestStoreOwnerOtp: (phone: string) => Promise<string | null>;
  loginStoreOwner: (phone: string, otp: string) => Promise<void>;
  logout: () => void;
  // Remember Me
  savedPhone: string | null;
  loadSavedPhone: () => Promise<void>;
  savePhone: (phone: string) => Promise<void>;
  clearSavedPhone: () => Promise<void>;
}

// Ensure you run `npm run tunnel` in the backend folder!
const API_URL = 'https://suki-auth-api.onrender.com/api/auth';

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  role: null,
  token: null,
  user: null,
  savedPhone: null,

  loadSavedPhone: async () => {
    try {
      const phone = await AsyncStorage.getItem(REMEMBER_ME_KEY);
      set({ savedPhone: phone });
    } catch { /* ignore */ }
  },

  savePhone: async (phone: string) => {
    try {
      await AsyncStorage.setItem(REMEMBER_ME_KEY, phone);
      set({ savedPhone: phone });
    } catch { /* ignore */ }
  },

  clearSavedPhone: async () => {
    try {
      await AsyncStorage.removeItem(REMEMBER_ME_KEY);
      set({ savedPhone: null });
    } catch { /* ignore */ }
  },

  loginSupplier: async (name: string, phone: string) => {
    try {
      const response = await fetch(`${API_URL}/supplier/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Bypass-Tunnel-Reminder': 'true' },
        body: JSON.stringify({ name, phone })
      });
      const data = await response.json();
      if (data.token) {
        set({ isAuthenticated: true, role: 'supplier', token: data.token, user: data.user ?? null });
      } else {
        console.error('Login failed:', data.error);
        throw new Error(data.error || 'Login failed');
      }
    } catch (e) {
      console.error('Network error during Supplier login:', e);
      throw e;
    }
  },

  requestStoreOwnerOtp: async (phone: string) => {
    try {
      const response = await fetch(`${API_URL}/store-owner/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Bypass-Tunnel-Reminder': 'true' },
        body: JSON.stringify({ phone })
      });
      const data = await response.json();
      if (response.ok) {
        return data._mockOtp || null;
      } else {
        throw new Error(data.error || 'Failed to request OTP');
      }
    } catch (e) {
      console.error('Network error requesting OTP:', e);
      throw e;
    }
  },

  loginStoreOwner: async (phone: string, otp: string) => {
    try {
      const response = await fetch(`${API_URL}/store-owner/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Bypass-Tunnel-Reminder': 'true' },
        body: JSON.stringify({ phone, otp })
      });
      const data = await response.json();
      if (data.token) {
        set({ isAuthenticated: true, role: 'store_owner', token: data.token, user: data.user ?? null });
      } else {
        console.error('Login failed:', data.error);
        throw new Error(data.error || 'Invalid OTP');
      }
    } catch (e) {
      console.error('Network error during Store Owner login:', e);
      throw e;
    }
  },

  logout: () => set({ isAuthenticated: false, role: null, token: null, user: null }),
}));

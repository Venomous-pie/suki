import { create } from 'zustand';

type Role = 'supplier' | 'store_owner' | null;

interface AuthState {
  isAuthenticated: boolean;
  role: Role;
  token: string | null;
  loginSupplier: () => Promise<void>;
  loginStoreOwner: () => Promise<void>;
  logout: () => void;
}

// Ensure you run `npm run tunnel` in the backend folder!
const API_URL = 'https://suki-auth-api.loca.lt/api/auth';

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  role: null,
  token: null,

  loginSupplier: async () => {
    try {
      const response = await fetch(`${API_URL}/supplier/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Bypass-Tunnel-Reminder': 'true' },
        body: JSON.stringify({ name: 'Demo Supplier', phone: '1234567890' })
      });
      const data = await response.json();
      if (data.token) {
        set({ isAuthenticated: true, role: 'supplier', token: data.token });
      } else {
        console.error('Login failed:', data.error);
      }
    } catch (e) {
      console.error('Network error during Supplier login:', e);
    }
  },

  loginStoreOwner: async () => {
    try {
      // Simulating a fast-track OTP verification for the UI demo
      const response = await fetch(`${API_URL}/store-owner/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Bypass-Tunnel-Reminder': 'true' },
        body: JSON.stringify({ phone: '9876543210', otp: '000000' })
      });
      const data = await response.json();
      if (data.token) {
        set({ isAuthenticated: true, role: 'store_owner', token: data.token });
      } else {
        console.error('Login failed:', data.error);
      }
    } catch (e) {
      console.error('Network error during Store Owner login:', e);
    }
  },

  logout: () => set({ isAuthenticated: false, role: null, token: null }),
}));

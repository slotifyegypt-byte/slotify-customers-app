import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import type { CustomerProfile } from '@/api/types';

// ── SecureStore adapter for zustand persist ───────────────────────────────────
const secureStorage = createJSONStorage(() => ({
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
}));

// ── Store shape ───────────────────────────────────────────────────────────────
interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  customer: CustomerProfile | null;
  _hasHydrated: boolean;

  setTokens: (access: string, refresh: string) => void;
  setCustomer: (customer: CustomerProfile) => void;
  clearAuth: () => void;
  setHasHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      customer: null,
      _hasHydrated: false,

      setTokens: (access, refresh) => set({ accessToken: access, refreshToken: refresh }),
      setCustomer: (customer) => set({ customer }),
      clearAuth: () => set({ accessToken: null, refreshToken: null, customer: null }),
      setHasHydrated: (value) => set({ _hasHydrated: value }),
    }),
    {
      name: 'slotify-auth',
      storage: secureStorage,
      // Only persist tokens — customer profile is re-fetched on launch
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

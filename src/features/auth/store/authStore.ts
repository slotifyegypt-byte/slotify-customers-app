import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const secureStorage = createJSONStorage(() => ({
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
}));

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  _hasHydrated: boolean;

  setTokens: (access: string, refresh: string) => void;
  clearAuth: () => void;
  setHasHydrated: (value: boolean) => void;
}

// Server-derived data (the customer profile) is never stored here — React
// Query owns it (see features/profile/api/queries.ts). This store only ever
// holds the session token pair plus small client-only UI state added later.
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      _hasHydrated: false,

      setTokens: (access, refresh) => set({ accessToken: access, refreshToken: refresh }),
      clearAuth: () => set({ accessToken: null, refreshToken: null }),
      setHasHydrated: (value) => set({ _hasHydrated: value }),
    }),
    {
      name: 'slotify-auth',
      storage: secureStorage,
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

export const isAuthenticated = () => Boolean(useAuthStore.getState().accessToken);

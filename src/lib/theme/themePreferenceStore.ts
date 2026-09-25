import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ThemePreference = 'system' | 'light' | 'dark';

// Reuses expo-secure-store (already linked for auth — see
// features/auth/store/authStore.ts) rather than adding a new native
// dependency like async-storage just for a UI preference.
const secureStorage = createJSONStorage(() => ({
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
}));

interface ThemePreferenceState {
  preference: ThemePreference;
  _hasHydrated: boolean;
  setPreference: (preference: ThemePreference) => void;
  setHasHydrated: (value: boolean) => void;
}

export const useThemePreferenceStore = create<ThemePreferenceState>()(
  persist(
    (set) => ({
      // Default is light, not system — the product wants a stable default
      // appearance regardless of the device's OS setting; users opt into
      // "System" or "Dark" explicitly from the Appearance setting.
      preference: 'light',
      _hasHydrated: false,
      setPreference: (preference) => set({ preference }),
      setHasHydrated: (value) => set({ _hasHydrated: value }),
    }),
    {
      name: 'slotify-theme-preference',
      storage: secureStorage,
      partialize: (state) => ({ preference: state.preference }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

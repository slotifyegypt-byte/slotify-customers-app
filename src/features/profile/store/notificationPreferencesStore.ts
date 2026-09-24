import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const storage = createJSONStorage(() => ({
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
}));

interface NotificationPreferencesState {
  bookingReminders: boolean;
  promotions: boolean;
  orderUpdates: boolean;
  chatMessages: boolean;
  setPreference: (key: keyof NotificationPreferences, value: boolean) => void;
}

type NotificationPreferences = Pick<
  NotificationPreferencesState,
  'bookingReminders' | 'promotions' | 'orderUpdates' | 'chatMessages'
>;

// customer-app-api-map.md §11 — "Notification Settings toggles: ❌ no
// preferences model" on the backend. Persisted locally (same storage
// mechanism as the auth store) so the toggles are real and survive app
// restarts, rather than faking a server round-trip that doesn't exist yet.
export const useNotificationPreferencesStore = create<NotificationPreferencesState>()(
  persist(
    (set) => ({
      bookingReminders: true,
      promotions: false,
      orderUpdates: true,
      chatMessages: true,
      setPreference: (key, value) => set({ [key]: value } as Pick<NotificationPreferencesState, typeof key>),
    }),
    {
      name: 'slotify-notification-preferences',
      storage,
    },
  ),
);

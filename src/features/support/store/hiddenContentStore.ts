import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { ReportKind } from '../api/report';

const storage = createJSONStorage(() => ({
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
}));

export const hiddenKey = (kind: ReportKind, id: string) => `${kind}:${id}`;

// SecureStore refuses values over about 2 KB on iOS, so only the most recent reports are remembered.
export const MAX_HIDDEN = 30;

interface HiddenContentState {
  hidden: Record<string, true>;
  hide: (kind: ReportKind, id: string) => void;
  /** Forgets everything: the list belongs to the signed-in customer, not to the phone. */
  clear: () => void;
}

// The device-local "block" for reports: a reviewer or business message the
// user reported disappears for them straight away, without waiting for
// moderation. Only opaque ids are kept, and only on this device.
export const useHiddenContentStore = create<HiddenContentState>()(
  persist(
    (set) => ({
      hidden: {},
      hide: (kind, id) =>
        set((s) => {
          const next = { ...s.hidden, [hiddenKey(kind, id)]: true as const };
          const keys = Object.keys(next);
          // Object keys keep insertion order, so the front of the list is the oldest report.
          const kept = keys.slice(Math.max(0, keys.length - MAX_HIDDEN));
          return { hidden: Object.fromEntries(kept.map((key) => [key, true as const])) };
        }),
      clear: () => set({ hidden: {} }),
    }),
    { name: 'slotify-hidden-content', storage },
  ),
);

export const useIsHidden = (kind: ReportKind, id: string) =>
  useHiddenContentStore((s) => s.hidden[hiddenKey(kind, id)] === true);

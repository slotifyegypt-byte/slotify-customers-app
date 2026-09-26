import 'react-native-url-polyfill/auto';

import { createClient, processLock } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { AppState, Platform } from 'react-native';

import { appConfig } from '@/lib/config';

// SecureStore caps each value at ~2 KB, and a Supabase session (access +
// refresh token + user) is larger than that — so values are split across
// numbered keys, with `<key>.n` holding the chunk count.
const CHUNK_SIZE = 1800;

async function removeChunks(key: string, fromIndex = 0) {
  const count = Number((await SecureStore.getItemAsync(`${key}.n`)) ?? 0);
  await Promise.all(
    Array.from({ length: Math.max(count - fromIndex, 0) }, (_, i) =>
      SecureStore.deleteItemAsync(`${key}.${fromIndex + i}`),
    ),
  );
}

const chunkedSecureStorage = {
  async getItem(key: string): Promise<string | null> {
    const count = await SecureStore.getItemAsync(`${key}.n`);
    if (count === null) return null;
    const chunks = await Promise.all(
      Array.from({ length: Number(count) }, (_, i) => SecureStore.getItemAsync(`${key}.${i}`)),
    );
    return chunks.some((chunk) => chunk === null) ? null : chunks.join('');
  },
  async setItem(key: string, value: string): Promise<void> {
    const chunks = value.match(new RegExp(`[\\s\\S]{1,${CHUNK_SIZE}}`, 'g')) ?? [''];
    await removeChunks(key, chunks.length);
    await Promise.all(chunks.map((chunk, i) => SecureStore.setItemAsync(`${key}.${i}`, chunk)));
    await SecureStore.setItemAsync(`${key}.n`, String(chunks.length));
  },
  async removeItem(key: string): Promise<void> {
    await removeChunks(key);
    await SecureStore.deleteItemAsync(`${key}.n`);
  },
};

// expo-secure-store has no web implementation (its `getValueWithKeyAsync`
// binding is native-only), and Expo Router also runs this module during SSR
// where `window` doesn't exist yet — so the web storage falls back to a
// no-op until `window.localStorage` is actually available.
const webStorage = {
  async getItem(key: string): Promise<string | null> {
    return typeof window === 'undefined' ? null : window.localStorage.getItem(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    if (typeof window !== 'undefined') window.localStorage.setItem(key, value);
  },
  async removeItem(key: string): Promise<void> {
    if (typeof window !== 'undefined') window.localStorage.removeItem(key);
  },
};

// Supabase Auth owns sign-in, token storage and refresh. The backend only
// verifies the access token this client hands out.
export const supabase = createClient(appConfig.supabaseUrl, appConfig.supabasePublishableKey, {
  auth: {
    storage: Platform.OS === 'web' ? webStorage : chunkedSecureStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
    lock: processLock,
  },
});

// Only refresh tokens in the background while the app is in the foreground.
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

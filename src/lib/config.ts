import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};

export const appConfig = {
  env: (extra.appEnv as 'development' | 'staging' | 'production') ?? 'development',
  apiBaseUrl: (extra.apiBaseUrl as string) ?? 'https://api.slotify-eg.com/api/v1',
  supabaseUrl: (extra.supabaseUrl as string) ?? '',
  // The publishable key is meant to ship in the app; access control lives in
  // the backend and in Supabase (the app tables aren't reachable with it).
  supabasePublishableKey: (extra.supabasePublishableKey as string) ?? '',
} as const;

export const isDev = __DEV__;

import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};

export const appConfig = {
  env: (extra.appEnv as 'development' | 'staging' | 'production') ?? 'development',
  supabaseUrl: (extra.supabaseUrl as string) ?? '',
  // The publishable key is meant to ship in the app; access control lives in
  // the backend and in Supabase (the app tables aren't reachable with it).
  supabasePublishableKey: (extra.supabasePublishableKey as string) ?? '',
  // OAuth client IDs from the Slotify Google Cloud project (not secrets). Empty = Google sign-in uses
  // Supabase's browser flow instead of the native sheet (src/features/auth/api/googleSignIn.ts).
  googleWebClientId: (extra.googleWebClientId as string) ?? '',
  googleIosClientId: (extra.googleIosClientId as string) ?? '',
} as const;

export const isDev = __DEV__;

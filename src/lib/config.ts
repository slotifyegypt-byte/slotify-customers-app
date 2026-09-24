import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};

export const appConfig = {
  env: (extra.appEnv as 'development' | 'staging' | 'production') ?? 'development',
  apiBaseUrl: (extra.apiBaseUrl as string) ?? 'https://api.slotify-eg.com/api/v1',
} as const;

export const isDev = __DEV__;

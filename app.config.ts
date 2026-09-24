import type { ExpoConfig, ConfigContext } from 'expo/config';

type AppEnv = 'development' | 'staging' | 'production';

const APP_ENV = (process.env.APP_ENV as AppEnv) ?? 'development';

const ENV_SUFFIX: Record<AppEnv, string> = {
  development: '.dev',
  staging: '.staging',
  production: '',
};

const DISPLAY_NAME: Record<AppEnv, string> = {
  development: 'Slotify (Dev)',
  staging: 'Slotify (Staging)',
  production: 'Slotify',
};

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: DISPLAY_NAME[APP_ENV],
  slug: 'slotify-customers',
  scheme: 'slotify',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  userInterfaceStyle: 'automatic',
  ios: {
    supportsTablet: true,
    bundleIdentifier: `com.slotify.customers${ENV_SUFFIX[APP_ENV]}`,
    infoPlist: {
      // Required for Linking.canOpenURL('comgooglemaps://') in the Explore
      // screen's "Directions" action (src/features/explore-search/screens/ExploreScreen.tsx)
      // — iOS refuses to even check for an external app's URL scheme unless
      // it's declared here first.
      LSApplicationQueriesSchemes: ['comgooglemaps'],
    },
  },
  android: {
    package: `com.slotify.customers${ENV_SUFFIX[APP_ENV]}`,
    adaptiveIcon: {
      backgroundColor: '#F6F7F8',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
    config: {
      googleMaps: {
        apiKey: process.env.GOOGLE_MAPS_API_KEY,
      },
    },
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        image: './assets/images/splash-icon.png',
        resizeMode: 'contain',
        backgroundColor: '#FFFFFF',
      },
    ],
    [
      'expo-notifications',
      {
        icon: './assets/images/android-icon-foreground.png',
        color: '#3A246B',
      },
    ],
    // '@sentry/react-native/expo' is intentionally left out of the plugin
    // list — it adds a native build step that uploads source maps and fails
    // the build without a real Sentry org/project configured. Re-add it
    // (with SENTRY_ORG/SENTRY_PROJECT set) once there's an actual Sentry
    // account; the JS-side Sentry.init() in src/lib/sentry.ts already no-ops
    // safely without a DSN, so nothing depends on this plugin today.
    [
      'expo-location',
      {
        locationWhenInUsePermission: 'Slotify uses your location to show nearby stores and distances.',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    appEnv: APP_ENV,
    apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://api.slotify-eg.com/api/v1',
    eas: {
      // Created via `eas build` under the @slotify-eg.com account (2026-09-19)
      // — dynamic app.config.ts can't be auto-written by the EAS CLI, so this
      // is hardcoded rather than read from an env var.
      projectId: 'b2bfa9c0-1b4e-49b6-b691-e4609db0a2cf',
    },
  },
});

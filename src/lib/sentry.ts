import * as Sentry from '@sentry/react-native';

import { appConfig, isDev } from './config';

export function initSentry() {
  if (isDev) return; // noisy in local dev; rely on Metro/console instead

  Sentry.init({
    dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
    environment: appConfig.env,
    enabled: Boolean(process.env.EXPO_PUBLIC_SENTRY_DSN),
    tracesSampleRate: appConfig.env === 'production' ? 0.2 : 1.0,
  });
}

export { Sentry };

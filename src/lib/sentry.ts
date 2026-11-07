import * as Sentry from '@sentry/react-native';

import { appConfig, isDev } from './config';
import { redact } from './redact';

/**
 * No personal data leaves the device: every event and breadcrumb passes through `redact` (emails,
 * phones, tokens), and the only thing ever kept about the user is their id. Never email, name,
 * phone or IP address.
 */
export function scrubEvent<T extends Sentry.Event>(event: T): T {
  const scrubbed = redact(event) as T;
  if (scrubbed.user) scrubbed.user = scrubbed.user.id ? { id: scrubbed.user.id } : undefined;
  return scrubbed;
}

export function scrubBreadcrumb<T extends Sentry.Breadcrumb>(breadcrumb: T): T {
  return redact(breadcrumb) as T;
}

export function initSentry() {
  if (isDev) return; // noisy in local dev; rely on Metro/console instead

  Sentry.init({
    dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
    environment: appConfig.env,
    enabled: Boolean(process.env.EXPO_PUBLIC_SENTRY_DSN),
    sendDefaultPii: false,
    tracesSampleRate: appConfig.env === 'production' ? 0.2 : 1.0,
    beforeSend: scrubEvent,
    beforeSendTransaction: scrubEvent,
    beforeBreadcrumb: scrubBreadcrumb,
  });
}

export { Sentry };

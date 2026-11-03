import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { Sentry } from '@/lib/sentry';
import { supabase } from '@/lib/supabase';

type DevicePlatform = 'ios' | 'android' | 'web';

function devicePlatform(): DevicePlatform {
  if (Platform.OS === 'ios' || Platform.OS === 'android') return Platform.OS;
  return 'web';
}

// The token this session registered, so sign-out can remove exactly it.
let registeredToken: string | null = null;

function logPushFailure(step: string, error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  Sentry.addBreadcrumb({ category: 'push', level: 'warning', message: `${step}: ${message}` });
  if (__DEV__) console.warn(`[push] ${step}:`, message);
}

/**
 * Asks for permission, fetches the Expo push token and stores it through
 * `register_push_token` (developer-guide.md §12; the RPC upserts, so calling it
 * on every sign-in is fine). Push is best-effort: a simulator, a denied
 * permission, a missing EAS project id or a network error is logged and
 * swallowed, never thrown.
 */
export async function registerForPush(): Promise<void> {
  try {
    let { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') ({ status } = await Notifications.requestPermissionsAsync());
    if (status !== 'granted') {
      logPushFailure('permission', 'not granted');
      return;
    }

    const projectId = Constants.expoConfig?.extra?.eas?.projectId as string | undefined;
    if (!projectId) {
      logPushFailure('token', 'no EAS projectId in app config');
      return;
    }

    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
    const { error } = await supabase.rpc('register_push_token', {
      p_token: token,
      p_platform: devicePlatform(),
      p_app: 'customer',
    });
    if (error) logPushFailure('register_push_token', error.message);
    else registeredToken = token;
  } catch (error) {
    logPushFailure('register', error);
  }
}

const UNREGISTER_TIMEOUT_MS = 3000;

/**
 * Deletes this device's token from `push_tokens` (own-row DELETE policy) so a
 * signed-out device stops receiving the previous user's pushes. Must run while
 * the session is still valid, i.e. before `signOut`. Best-effort and bounded:
 * never throws, and gives up after `timeoutMs` so an offline logout is never
 * blocked. Zero rows deleted (already gone) is fine. Uses the token cached by
 * `registerForPush`, else re-reads it from Expo.
 */
export async function unregisterPush(timeoutMs: number = UNREGISTER_TIMEOUT_MS): Promise<void> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const work = (async () => {
    try {
      let token = registeredToken;
      if (!token) {
        const projectId = Constants.expoConfig?.extra?.eas?.projectId as string | undefined;
        if (!projectId) return;
        token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      }
      const { error } = await supabase.from('push_tokens').delete().eq('token', token);
      if (error) logPushFailure('unregister', error.message);
      else registeredToken = null;
    } catch (error) {
      logPushFailure('unregister', error);
    }
  })();
  const timeout = new Promise<void>((resolve) => {
    timer = setTimeout(resolve, timeoutMs);
  });
  try {
    await Promise.race([work, timeout]);
  } finally {
    clearTimeout(timer);
  }
}

// Push payloads carry the same `data` jsonb as the notifications row.
export function routeForNotificationData(
  data: unknown,
): `/(tabs)/activity/${string}` | `/venue/${string}` | null {
  if (typeof data !== 'object' || data === null) return null;
  const { booking_id: bookingId, branch_id: branchId } = data as Record<string, unknown>;
  if (typeof bookingId === 'string' && bookingId) return `/(tabs)/activity/${bookingId}`;
  if (typeof branchId === 'string' && branchId) return `/venue/${branchId}`;
  return null;
}

let lastHandledResponseId: string | null = null;

function handleResponse(response: Notifications.NotificationResponse | null) {
  if (!response) return;
  const id = response.notification.request.identifier;
  if (id !== undefined && id === lastHandledResponseId) return;
  const route = routeForNotificationData(response.notification.request.content.data);
  if (!route) return;
  lastHandledResponseId = id ?? null;
  router.push(route);
}

/**
 * Shows pushes while the app is open and deep-links a tapped push: a booking
 * notification opens that booking, a branch one opens the venue. Also handles
 * the tap that cold-started the app. Mount once, signed in.
 */
export function useNotificationResponseRouting(): void {
  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });

    handleResponse(Notifications.getLastNotificationResponse());
    const subscription = Notifications.addNotificationResponseReceivedListener(handleResponse);
    return () => subscription.remove();
  }, []);
}

import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

export interface LocationState {
  latitude: number;
  longitude: number;
  status: 'loading' | 'granted' | 'denied';
}

// Cairo center — used as the initial value so Home/Explore/etc. can render
// (and fire their nearby-stores query) on first paint instead of waiting on
// permission + GPS. Screens that show a real map re-center themselves once
// `status` moves past 'loading' with real coordinates.
const FALLBACK = { latitude: 30.0444, longitude: 31.2357 };

// A first-ever fresh GPS fix (no cached location, no assistance data yet)
// can take 15-30s+ on a real device — bounding it means we never wait that
// long before giving up on a more accurate fix and keeping whatever we have.
const FRESH_FIX_TIMEOUT_MS = 8000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('location-timeout')), ms)),
  ]);
}

// Module-level cache + a single shared in-flight resolution: every screen
// that calls useCustomerLocation() used to re-run the full permission + GPS
// sequence from scratch on its own mount (up to ~12s each, observed on
// Explore). Resolving once per app session and broadcasting the result to
// every mounted consumer means only the very first screen pays that cost;
// every screen after it (including a re-mounted one) gets the cached fix
// instantly.
let cachedState: LocationState = { ...FALLBACK, status: 'loading' };
let inFlight: Promise<void> | null = null;
const listeners = new Set<(state: LocationState) => void>();

function publish(next: LocationState) {
  cachedState = next;
  listeners.forEach((listener) => listener(next));
}

function resolveLocation(): Promise<void> {
  if (inFlight) return inFlight;

  inFlight = (async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      publish({ ...FALLBACK, status: 'denied' });
      return;
    }

    // Resolve fast with whatever cached fix the OS already has (usually
    // near-instant) so the map/nearby-stores can refine immediately, instead
    // of blocking on a fresh GPS fix below.
    const cached = await Location.getLastKnownPositionAsync().catch(() => null);
    if (cached) {
      publish({ latitude: cached.coords.latitude, longitude: cached.coords.longitude, status: 'granted' });
    }

    // Then get (or wait for) a fresh, more accurate fix, bounded by a
    // timeout. On timeout/failure, silently keep the cached fix if we got
    // one above; only fall back to the Cairo default if we never had any
    // real position at all.
    try {
      const fresh = await withTimeout(
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
        FRESH_FIX_TIMEOUT_MS,
      );
      publish({ latitude: fresh.coords.latitude, longitude: fresh.coords.longitude, status: 'granted' });
    } catch {
      if (!cached) publish({ ...FALLBACK, status: 'denied' });
    }
  })();

  return inFlight;
}

export function useCustomerLocation(): LocationState {
  const [state, setState] = useState(cachedState);

  useEffect(() => {
    listeners.add(setState);
    resolveLocation();
    return () => {
      listeners.delete(setState);
    };
  }, []);

  return state;
}

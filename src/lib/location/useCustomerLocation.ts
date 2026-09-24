import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  status: 'loading' | 'granted' | 'denied';
}

// Cairo center — used only as a fallback so Home/Explore render something
// sensible before permission is granted or if it's denied outright.
const FALLBACK = { latitude: 30.0444, longitude: 31.2357 };

// A first-ever fresh GPS fix (no cached location, no assistance data yet)
// can take 15-30s+ on a real device — bounding it means the UI never waits
// that long; it renders with a cached/fallback position immediately instead.
const FRESH_FIX_TIMEOUT_MS = 8000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('location-timeout')), ms)),
  ]);
}

export function useCustomerLocation() {
  const [state, setState] = useState<LocationState>({
    latitude: null,
    longitude: null,
    status: 'loading',
  });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (cancelled) return;

      if (status !== 'granted') {
        setState({ ...FALLBACK, status: 'denied' });
        return;
      }

      // Resolve fast with whatever cached fix the OS already has (usually
      // near-instant) so the map/nearby-stores can render immediately,
      // instead of blocking on a fresh GPS fix below.
      const cached = await Location.getLastKnownPositionAsync().catch(() => null);
      if (cancelled) return;
      if (cached) {
        setState({ latitude: cached.coords.latitude, longitude: cached.coords.longitude, status: 'granted' });
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
        if (cancelled) return;
        setState({ latitude: fresh.coords.latitude, longitude: fresh.coords.longitude, status: 'granted' });
      } catch {
        if (cancelled) return;
        setState((prev) => (prev.latitude !== null ? prev : { ...FALLBACK, status: 'denied' }));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

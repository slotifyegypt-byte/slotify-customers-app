import * as Location from 'expo-location';

/** Why the phone could not say where the customer is. */
export class LocationUnavailableError extends Error {
  constructor(readonly reason: 'denied' | 'unavailable') {
    super(`location-${reason}`);
    this.name = 'LocationUnavailableError';
  }
}

const FIX_TIMEOUT_MS = 10_000;
/** A last known position this recent still says where they are now (they are standing at the branch). */
const RECENT_MS = 2 * 60_000;

/**
 * Where the customer is right now, for checking in at a branch. Unlike useCustomerLocation (a cached,
 * app-wide fix for browsing), this asks for a fresh position: a fix from home an hour ago must not check
 * anyone in. Falls back to a very recent last-known position when a fresh fix is slow.
 */
export async function getHereNow(): Promise<{ latitude: number; longitude: number }> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') throw new LocationUnavailableError('denied');
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const fix = await Promise.race([
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error('location-timeout')), FIX_TIMEOUT_MS);
      }),
    ]);
    return { latitude: fix.coords.latitude, longitude: fix.coords.longitude };
  } catch {
    const last = await Location.getLastKnownPositionAsync({ maxAge: RECENT_MS }).catch(() => null);
    if (last) return { latitude: last.coords.latitude, longitude: last.coords.longitude };
    throw new LocationUnavailableError('unavailable');
  } finally {
    clearTimeout(timer);
  }
}

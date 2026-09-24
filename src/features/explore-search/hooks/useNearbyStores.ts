import { useQuery } from '@tanstack/react-query';

import { getNearbyStores, type NearbyParams } from '../api/exploreApi';
import { exploreKeys } from '../api/queryKeys';

export function useNearbyStores(params: NearbyParams) {
  // Rounded to ~3 decimal places (~110m) for the cache key, same reasoning
  // as useStoreDetail's locationKey: useCustomerLocation publishes up to two
  // updates per app session (cached fix, then fresh fix) and the raw floats
  // rarely match between them, which would otherwise mint a fresh cache
  // entry — and a fresh network request — for each one. The request itself
  // still uses the exact coordinates.
  const locationKey = `${params.latitude.toFixed(3)},${params.longitude.toFixed(3)}`;

  return useQuery({
    queryKey: exploreKeys.nearby({ locationKey, radius_km: params.radius_km, limit: params.limit }),
    queryFn: () => getNearbyStores(params),
  });
}

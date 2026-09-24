import { useQuery } from '@tanstack/react-query';

import { getFavourites } from '../api/favouritesApi';
import { favouriteKeys } from '../api/queryKeys';

export function useFavourites(params?: { limit?: number; offset?: number }) {
  return useQuery({
    queryKey: favouriteKeys.list(params),
    queryFn: () => getFavourites(params),
  });
}

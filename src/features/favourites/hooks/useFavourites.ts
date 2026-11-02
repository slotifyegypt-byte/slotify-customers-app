import { useQuery } from '@tanstack/react-query';

import { getFavourites } from '../api/favouritesApi';
import { favouriteKeys } from '../api/queryKeys';

export function useFavourites() {
  return useQuery({
    queryKey: favouriteKeys.list(),
    queryFn: getFavourites,
  });
}

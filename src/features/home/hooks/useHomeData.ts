import { useQuery } from '@tanstack/react-query';

import { getCategories, getHomeOffers } from '../api/homeApi';
import { homeKeys } from '../api/queryKeys';

export function useCategories() {
  // The category list changes a few times a year: an hour is plenty.
  return useQuery({
    queryKey: homeKeys.categories,
    queryFn: getCategories,
    staleTime: 60 * 60_000,
  });
}

export function useHomeOffers() {
  return useQuery({ queryKey: homeKeys.offers, queryFn: getHomeOffers });
}

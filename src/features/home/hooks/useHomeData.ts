import { useQuery } from '@tanstack/react-query';

import { getCategories, getHomeOffers } from '../api/homeApi';
import { homeKeys } from '../api/queryKeys';

export function useCategories() {
  return useQuery({ queryKey: homeKeys.categories, queryFn: getCategories });
}

export function useHomeOffers() {
  return useQuery({ queryKey: homeKeys.offers, queryFn: getHomeOffers });
}

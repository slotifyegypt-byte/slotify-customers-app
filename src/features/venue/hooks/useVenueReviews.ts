import { useQuery } from '@tanstack/react-query';

import { venueKeys } from '../api/queryKeys';
import { getStoreReviewStats, getStoreReviews, type ReviewListParams } from '../api/venueApi';

export function useVenueReviewStats(storeId: string) {
  return useQuery({
    queryKey: venueKeys.reviewStats(storeId),
    queryFn: () => getStoreReviewStats(storeId),
  });
}

export function useVenueReviews(storeId: string, params?: ReviewListParams) {
  return useQuery({
    queryKey: venueKeys.reviews(storeId, params),
    queryFn: () => getStoreReviews(storeId, params),
  });
}

import type { QueryClient } from '@tanstack/react-query';

import { bookingKeys } from '@/features/booking/api/queryKeys';
import { exploreKeys } from '@/features/explore-search/api/queryKeys';
import { venueKeys } from '@/features/venue/api/queryKeys';

import { reviewKeys } from './queryKeys';

// A review write changes: the customer's review list, the venue's review list
// and stats, the branch's rating on its card (a trigger recomputes it), and
// `has_review`/`review_id` on bookings. Prefixes cover every branch/filter —
// only mounted queries refetch, the rest are just marked stale.
export function invalidateReviewQueries(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: reviewKeys.all }),
    queryClient.invalidateQueries({ queryKey: [...venueKeys.all, 'reviews'] }),
    queryClient.invalidateQueries({ queryKey: [...venueKeys.all, 'review-stats'] }),
    queryClient.invalidateQueries({ queryKey: exploreKeys.all }),
    queryClient.invalidateQueries({ queryKey: [...bookingKeys.all, 'mine'] }),
    queryClient.invalidateQueries({ queryKey: [...bookingKeys.all, 'detail'] }),
  ]);
}

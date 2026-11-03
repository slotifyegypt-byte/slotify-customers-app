import { QueryClient } from '@tanstack/react-query';

import { bookingKeys } from '@/features/booking/api/queryKeys';
import { venueKeys } from '@/features/venue/api/queryKeys';

import { invalidateReviewQueries } from './invalidate';
import { reviewKeys } from './queryKeys';

describe('invalidateReviewQueries', () => {
  it('marks my reviews, venue reviews + stats, bookings list and detail stale, and leaves others alone', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { gcTime: Infinity } } });
    const keys = {
      mine: reviewKeys.byCustomer('c1'),
      venueReviews: venueKeys.reviews('b1', { limit: 20, offset: 0 }),
      venueStats: venueKeys.reviewStats('b1'),
      bookingList: bookingKeys.myBookings('completed'),
      bookingDetail: bookingKeys.detail('bk1'),
      gallery: venueKeys.gallery('b1'),
    };
    Object.values(keys).forEach((key) => client.setQueryData(key, []));

    await invalidateReviewQueries(client);

    const stale = (key: readonly unknown[]) => client.getQueryState(key)?.isInvalidated;
    expect(stale(keys.mine)).toBe(true);
    expect(stale(keys.venueReviews)).toBe(true);
    expect(stale(keys.venueStats)).toBe(true);
    expect(stale(keys.bookingList)).toBe(true);
    expect(stale(keys.bookingDetail)).toBe(true);
    expect(stale(keys.gallery)).toBe(false);
  });
});

import { useQuery } from '@tanstack/react-query';

import { reviewKeys } from '../api/queryKeys';
import { getCustomerReviews } from '../api/reviewsApi';

export function useMyReviews(customerId: string | undefined) {
  return useQuery({
    queryKey: reviewKeys.byCustomer(customerId ?? ''),
    queryFn: () => getCustomerReviews(customerId!),
    enabled: Boolean(customerId),
  });
}

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { reviewKeys } from '../api/queryKeys';
import { createReview, deleteReview, updateReview } from '../api/reviewsApi';

export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.all });
    },
  });
}

export function useUpdateReview(customerId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reviewId, payload }: { reviewId: number; payload: { rating?: number; comment?: string } }) =>
      updateReview(reviewId, payload),
    onSuccess: () => {
      if (customerId) {
        queryClient.invalidateQueries({ queryKey: reviewKeys.byCustomer(customerId) });
      }
    },
  });
}

export function useDeleteReview(customerId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reviewId: number) => deleteReview(reviewId),
    onSuccess: () => {
      if (customerId) {
        queryClient.invalidateQueries({ queryKey: reviewKeys.byCustomer(customerId) });
      }
    },
  });
}

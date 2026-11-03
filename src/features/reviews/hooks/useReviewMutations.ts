import { useMutation, useQueryClient } from '@tanstack/react-query';

import { invalidateReviewQueries } from '../api/invalidate';
import { createReview, deleteReview, updateReview } from '../api/reviewsApi';
import type { UpdateReviewPayload } from '../api/schemas';

export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createReview,
    onSuccess: () => invalidateReviewQueries(queryClient),
  });
}

export function useUpdateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reviewId, payload }: { reviewId: string; payload: UpdateReviewPayload }) =>
      updateReview(reviewId, payload),
    onSuccess: () => invalidateReviewQueries(queryClient),
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reviewId: string) => deleteReview(reviewId),
    onSuccess: () => invalidateReviewQueries(queryClient),
  });
}

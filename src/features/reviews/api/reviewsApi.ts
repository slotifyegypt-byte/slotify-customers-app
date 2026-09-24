import { z } from 'zod';

import { apiClient } from '@/lib/api/client';
import { validateResponse } from '@/lib/api/zodFetch';

import { reviewSchema } from './schemas';

export interface CreateReviewPayload {
  store_id: string;
  rating: number;
  comment?: string;
  // VERIFIED against live /openapi.json (2026-09-20): `ReviewCreate` now
  // accepts an optional `booking_id`, which must be one of the customer's
  // own COMPLETED bookings at `store_id` — the backend 400s otherwise, so
  // callers should only pass this when that's already guaranteed (see
  // WriteReviewScreen, the sole place reviews are created from).
  booking_id?: string;
}

export interface UpdateReviewPayload {
  rating?: number;
  comment?: string;
}

// customer-app-api-map.md §11
export async function getCustomerReviews(
  customerId: string,
  params?: { limit?: number; offset?: number },
) {
  const response = await apiClient.get(`/reviews/customer/${customerId}`, { params });
  return validateResponse(z.array(reviewSchema), response, `GET /reviews/customer/${customerId}`);
}

// §5 — `ReviewCreate` now optionally carries `booking_id` (VERIFIED against
// live /openapi.json, 2026-09-20), tying the review to the specific
// completed booking it was written for. Note: the live backend's create
// route is registered with a trailing slash (`POST /reviews/`) — calling
// `POST /reviews` 307-redirects there, so this calls the canonical path
// directly to skip the round trip.
export async function createReview(payload: CreateReviewPayload) {
  const response = await apiClient.post('/reviews/', payload);
  return validateResponse(reviewSchema, response, 'POST /reviews/');
}

export async function updateReview(reviewId: number, payload: UpdateReviewPayload) {
  const response = await apiClient.put(`/reviews/${reviewId}`, payload);
  return validateResponse(reviewSchema, response, `PUT /reviews/${reviewId}`);
}

export async function deleteReview(reviewId: number) {
  await apiClient.delete(`/reviews/${reviewId}`);
}

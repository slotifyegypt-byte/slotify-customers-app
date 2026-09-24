import { z } from 'zod';

// customer-app-api-map.md §5/§11 + verified directly against the live
// backend's /openapi.json (ReviewRead/ReviewCreate/ReviewUpdate) and a real
// GET /reviews/store/{store_id} response — the doc itself has no full
// sample payload for reviews. `ReviewRead`'s only required fields are
// id/store_id/customer_id/rating/created_at; everything else is optional
// and comes back explicit `null` (not omitted) when unset.
// VERIFIED against live /openapi.json (2026-09-20): both `ReviewCreate` and
// `ReviewRead` now carry `booking_id` — a review can optionally be tied to
// the specific completed booking it was written for.
export const reviewSchema = z.object({
  id: z.number(),
  store_id: z.string(),
  customer_id: z.string(),
  customer_name: z.string().nullable().optional(),
  rating: z.number(),
  comment: z.string().nullable().optional(),
  owner_reply: z.string().nullable().optional(),
  owner_reply_at: z.string().nullable().optional(),
  created_at: z.string(),
  review_date_str: z.string().nullable().optional(),
  booking_id: z.string().nullable().optional(),
});
export type Review = z.infer<typeof reviewSchema>;

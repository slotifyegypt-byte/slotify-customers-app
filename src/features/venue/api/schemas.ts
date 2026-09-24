import { z } from 'zod';

// customer-app-api-map.md §5 — every schema below was cross-checked against
// the live OpenAPI spec at https://api.slotify-eg.com/openapi.json
// (2026-09-18), not just guessed from the doc's prose, since most of these
// endpoints return empty arrays on every seed store we could reach.

// ── Photo gallery ───────────────────────────────────────────────────────
// Doc says `GET /stores/{store_id}/galleries` — that 404s live. The real,
// public route is singular `GET /stores/{store_id}/gallery` (confirmed via
// openapi.json's `StoreGalleryRead` schema and a live 200 w/ `[]`). Backend
// has a typo'd field name (`image_String`, capital S) — transformed to
// `imageUrl` here so callers don't have to carry that typo around.
export const galleryItemSchema = z
  .object({
    id: z.string(),
    store_id: z.string(),
    image_String: z.string(),
    created_at: z.string(),
  })
  .transform((item) => ({
    id: item.id,
    storeId: item.store_id,
    imageUrl: item.image_String,
    createdAt: item.created_at,
  }));
export type GalleryItem = z.infer<typeof galleryItemSchema>;

// ── Meet the team ───────────────────────────────────────────────────────
// Matches doc §5 sample and openapi.json's `StoreEmployeeTeamRead` exactly.
export const teamMemberSchema = z.object({
  id: z.string(),
  first_name: z.string(),
  last_name: z.string().nullish(),
  profile_picture: z.string().nullish(),
  role_name: z.string().nullish(),
});
export type TeamMember = z.infer<typeof teamMemberSchema>;

// ── Services tab — category names (services themselves come from
// src/features/booking/api/schemas.ts's `serviceSchema` via useStoreServices) ──
// Verified live against GET /stores/{store_id}/service-categories.
export const serviceCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  store_id: z.string(),
  created_at: z.string(),
  updated_at: z.string().nullable(),
});
export type VenueServiceCategory = z.infer<typeof serviceCategorySchema>;

// ── About tab — hours ───────────────────────────────────────────────────
// Verified live + against openapi.json's `StoreCalendarRead` (status is a
// plain string in the spec, not an enum, though live data only shows
// "open"/"closed").
export const calendarDaySchema = z.object({
  id: z.number(),
  store_id: z.string(),
  week_day: z.string(),
  opening_hour: z.string(),
  closing_hour: z.string(),
  status: z.string(),
  hours_str: z.string().optional(),
});
export type CalendarDay = z.infer<typeof calendarDaySchema>;

// Verified against openapi.json's `StoreSpecialDayRead` (every seed store
// returns `[]` live, so field *names* are confirmed via the spec but never
// seen populated).
export const specialDaySchema = z.object({
  id: z.number(),
  store_id: z.string(),
  date: z.string(),
  opening_hour: z.string().optional(),
  closing_hour: z.string().optional(),
  status: z.enum(['open', 'closed']),
  reason: z.string().optional(),
});
export type SpecialDay = z.infer<typeof specialDaySchema>;

// ── Reviews tab ─────────────────────────────────────────────────────────
// Verified live (populated data on real seed stores) + openapi.json's
// `ReviewRead`.
export const reviewSchema = z.object({
  id: z.number(),
  store_id: z.string(),
  customer_id: z.string(),
  customer_name: z.string().optional(),
  rating: z.number(),
  comment: z.string().nullish(),
  owner_reply: z.string().nullish(),
  owner_reply_at: z.string().nullish(),
  created_at: z.string(),
  review_date_str: z.string().optional(),
});
export type VenueReview = z.infer<typeof reviewSchema>;

// VERIFIED against a live GET /reviews/store/{store_id}/stats response
// (2026-09-20): `{ store_id, average_rating, total_reviews,
// rating_distribution }`. `rating_distribution`'s keys are the JSON-object
// STRINGS "1".."5" (not numbers, not an array), and it's the true full
// distribution across every review for the store — not just whatever page
// of reviews the client happens to have loaded. The previous "no breakdown
// field" note here is stale; ReviewsTab now reads this directly instead of
// deriving counts from the loaded reviews page.
export const ratingDistributionSchema = z.object({
  '1': z.number(),
  '2': z.number(),
  '3': z.number(),
  '4': z.number(),
  '5': z.number(),
});
export type RatingDistribution = z.infer<typeof ratingDistributionSchema>;

export const reviewStatsSchema = z.object({
  store_id: z.string(),
  average_rating: z.number(),
  total_reviews: z.number(),
  rating_distribution: ratingDistributionSchema,
});
export type VenueReviewStats = z.infer<typeof reviewStatsSchema>;

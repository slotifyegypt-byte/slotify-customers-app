import { z } from 'zod';

// View model for `categories` rows (developer-guide.md §5). `id` is a uuid;
// icons and display labels are derived from `slug` in the app. `description`
// is not selected, so it is always null.
export interface StoreCategory {
  id: string;
  slug: string;
  name: string;
  description: null;
}

// §2 — cross-checked against the live OpenAPI spec's `HomePageOfferRead`
// (2026-09-20, re-verified after the backend added discount pricing): only
// id/category_id/store_id/valid_from/valid_to/created_at are actually
// required server-side — store_name/store_rating/description/offer_image/
// original_price/discounted_price/discount_percentage can all be absent or
// null. No `price_symbol` field exists on this schema (unlike `Service`) —
// EGP is hardcoded at the display layer since this backend is Egypt-only.
export const homePageOfferSchema = z.object({
  id: z.number(),
  category_id: z.string().nullable(),
  store_id: z.string(),
  store_name: z.string().nullable().optional(),
  store_rating: z.number().nullable().optional(),
  description: z.string().nullable().optional(),
  offer_image: z.string().nullable().optional(),
  original_price: z.number().nullable().optional(),
  discounted_price: z.number().nullable().optional(),
  discount_percentage: z.number().nullable().optional(),
  valid_from: z.string(),
  valid_to: z.string(),
  created_at: z.string(),
});
export type HomePageOffer = z.infer<typeof homePageOfferSchema>;

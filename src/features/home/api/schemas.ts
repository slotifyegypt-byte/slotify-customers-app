import { z } from 'zod';

// customer-app-api-map.md §2 — no full sample in the doc (described only as
// "6 seeded categories" matching design icon keys: barbers/salons/spa/
// carcare/tailors/repair). LIVE-VERIFIED shape (2026-09-18, re-checked after
// an earlier 500 turned out to be transient): `{id, name, description,
// created_at, updated_at}` — no `key`/`label`/`icon_url` as originally
// assumed, and only 3 of the 6 design categories are seeded so far
// (ids 5/6/7 = salon/barber/automotive). Screens should treat `name` as the
// display label and derive an icon from a local key→icon map, not from data.
export const storeCategorySchema = z
  .object({
    id: z.number(),
    name: z.string(),
    description: z.string().nullable().optional(),
    created_at: z.string(),
    updated_at: z.string().nullable().optional(),
  })
  .passthrough();
export type StoreCategory = z.infer<typeof storeCategorySchema>;

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

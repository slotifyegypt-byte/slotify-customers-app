import { z } from 'zod';

// customer-app-api-map.md §3 — verified live against
// GET /stores/search/nearby?latitude=&longitude=&radius_km=&limit= (2026-09-18):
// matches the doc's sample field-for-field, except `share_link` is
// nullable in practice (the doc's sample happened to show a non-null one).
export const nearbyStoreSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  category_id: z.number(),
  logo: z.string().nullable(),
  address: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  phone_country_code: z.string().nullable(),
  phone_number: z.string().nullable(),
  rating: z.number(),
  share_link: z.string().nullable(),
  created_at: z.string(),
  status: z.enum(['open', 'closed']),
  distance_km: z.number().nullable(),
});
export type NearbyStore = z.infer<typeof nearbyStoreSchema>;

// §4 — verified live against GET /search?... (2026-09-18): confirmed
// accurate. NOTE this is a genuinely different shape from nearbyStoreSchema
// above (store_-prefixed fields, no `description`) — the backend does not
// use one consistent store shape across endpoints. Do not merge these types.
export const searchStoreSchema = z.object({
  store_id: z.string(),
  store_name: z.string(),
  store_address: z.string(),
  store_rating: z.number(),
  store_distance_km: z.number().nullable(),
  store_logo: z.string().nullable(),
  store_category_id: z.number(),
  latitude: z.number(),
  longitude: z.number(),
  status: z.enum(['open', 'closed']),
});
export type SearchStore = z.infer<typeof searchStoreSchema>;

export const searchResponseSchema = z.object({
  stores: z.array(searchStoreSchema),
  total_count: z.number(),
  limit: z.number(),
  offset: z.number(),
  customer_latitude: z.number().nullable(),
  customer_longitude: z.number().nullable(),
});
export type SearchResponse = z.infer<typeof searchResponseSchema>;

// §5 — verified live against GET /stores/{store_id} (2026-09-20): the real
// response is a superset of the doc's description (adds `business_id`,
// `map_location`) and omits gallery/services/team/reviews (those are
// separate endpoint calls, per the doc). `.passthrough()` so undocumented
// extra fields don't fail validation.
//
// `amenities` and `distance_km` VERIFIED against the live backend
// (2026-09-20): `amenities` is a real enum (`parking` | `card_payments` |
// `wheelchair_accessible`) that can come back as `[]` — do not assume it's
// populated. `distance_km` is only present when the request includes the
// new `customer_latitude`/`customer_longitude` query params (see
// `getStoreDetail`); it's simply absent otherwise, so both are optional.
export const storeDetailSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    category_id: z.number(),
    logo: z.string().nullable(),
    address: z.string(),
    latitude: z.number(),
    longitude: z.number(),
    phone_country_code: z.string().nullable(),
    phone_number: z.string().nullable(),
    rating: z.number(),
    share_link: z.string().nullable(),
    created_at: z.string(),
    status: z.enum(['open', 'closed']),
    amenities: z.array(z.enum(['parking', 'card_payments', 'wheelchair_accessible'])).optional(),
    distance_km: z.number().nullable().optional(),
  })
  .passthrough();
export type StoreDetail = z.infer<typeof storeDetailSchema>;

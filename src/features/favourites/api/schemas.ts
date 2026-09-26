import { z } from 'zod';

import { storeDetailSchema } from '@/features/explore-search/api/schemas';

// customer-app-api-map.md §11 — VERIFIED live against GET /favourites/
// (2026-09-20): each row now embeds the full store object (`store:
// StoreRead`) in one query, replacing the old bare-array shape that forced
// a per-row GET /stores/{store_id} (the N+1 the previous comment here
// documented).
export const favouriteSchema = z.object({
  id: z.number(),
  customer_id: z.string(),
  store_id: z.string(),
  created_at: z.string(),
  store: storeDetailSchema,
});
export type Favourite = z.infer<typeof favouriteSchema>;

// §5 — the create response is the bare new row, with no joined `store`
// (that join only happens on the list endpoint above). Reusing
// `favouriteSchema` here made every POST /favourites/ throw an "API
// contract drift" error in dev, since `store` was never actually present.
export const favouriteCreateSchema = z.object({
  id: z.number(),
  customer_id: z.string(),
  store_id: z.string(),
  created_at: z.string(),
});

// §5 — VERIFIED against the backend source (2026-09-18): raw `{is_favourite: bool}`, nothing else.
export const favouriteCheckSchema = z.object({
  is_favourite: z.boolean(),
});
export type FavouriteCheck = z.infer<typeof favouriteCheckSchema>;

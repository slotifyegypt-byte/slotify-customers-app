import type { NearbyStore } from '@/features/explore-search/api/schemas';

// Favourites have a composite key (customer_id, branch_id) and no row id, so
// `id` is the branch id; `store_id` is the same value, kept for callers.
export interface Favourite {
  id: string;
  store_id: string;
  created_at: string;
  store: NearbyStore;
}

export interface FavouriteCheck {
  is_favourite: boolean;
}

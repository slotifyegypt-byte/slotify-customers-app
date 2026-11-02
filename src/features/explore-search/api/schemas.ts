import type { Database } from '@/lib/database.types';

export type Amenity = Database['public']['Enums']['amenity'];

// One branch view model shared by nearby, search, favourites and (via
// StoreDetail) the detail screen. Built by `toStore` in ./mappers from either
// a `branch_cards` row or a `search_branches` row. `id` is the branch uuid.
export interface NearbyStore {
  id: string;
  business_id: string;
  /** `${business_name} – ${branch_name}` */
  name: string;
  /** null for search rows — the rpc does not return it. */
  description: string | null;
  /** A branch can belong to several categories; match against `StoreCategory.slug`. */
  category_slugs: string[];
  /** Built public URL, not a storage path. */
  logo: string | null;
  address: string;
  latitude: number | null;
  longitude: number | null;
  /** E.164, null for search rows. */
  phone: string | null;
  rating: number;
  rating_count: number;
  share_slug: string | null;
  timezone: string;
  status: 'open' | 'closed';
  distance_km: number | null;
}

// A store with known coordinates — what map pins and clustering need.
export type MappableStore = NearbyStore & { latitude: number; longitude: number };

// The search rpc returns the same card fields as nearby, so the two share one
// shape (the legacy API's `store_`-prefixed search shape is gone).
export type SearchStore = NearbyStore;

export interface StoreDetail extends NearbyStore {
  amenities: Amenity[];
  currency: string;
}

// View model for `categories` rows (developer-guide.md §5). `id` is a uuid;
// icons and display labels are derived from `slug` in the app. `description`
// is not selected, so it is always null.
export interface StoreCategory {
  id: string;
  slug: string;
  name: string;
  description: null;
}

// View model for an `offers` row joined to its branch card (developer-guide.md
// §5). `category_id` is an `offer_categories` id (platform-curated home-page
// offer groups), NOT a store `categories` id — the Home category chips are
// store categories, so deals are filtered through `store_category_slugs` (the
// offer's branch's category slugs) instead. Prices are in the branch's
// `currency`.
export interface HomePageOffer {
  id: string;
  store_id: string;
  store_name: string;
  store_rating: number | null;
  store_category_slugs: string[];
  title: string;
  description: string | null;
  offer_image: string | null;
  original_price: number | null;
  discounted_price: number | null;
  discount_percentage: number | null;
  valid_from: string;
  valid_to: string;
  category_id: string | null;
  currency: string;
}

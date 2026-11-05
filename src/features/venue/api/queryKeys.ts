export const venueKeys = {
  all: ['venue'] as const,
  gallery: (storeId: string) => [...venueKeys.all, 'gallery', storeId] as const,
  team: (storeId: string) => [...venueKeys.all, 'team', storeId] as const,
  calendar: (storeId: string) => [...venueKeys.all, 'calendar', storeId] as const,
  specialDays: (storeId: string, timezone?: string) =>
    [...venueKeys.all, 'special-days', storeId, timezone] as const,
  reviewStats: (storeId: string) => [...venueKeys.all, 'review-stats', storeId] as const,
  reviews: (storeId: string, params?: unknown) =>
    [...venueKeys.all, 'reviews', storeId, params ?? {}] as const,
};

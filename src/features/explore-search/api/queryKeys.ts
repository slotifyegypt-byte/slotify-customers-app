export const exploreKeys = {
  all: ['explore'] as const,
  nearby: (params: unknown) => [...exploreKeys.all, 'nearby', params] as const,
  search: (params: unknown) => [...exploreKeys.all, 'search', params] as const,
  // `locationKey` is `undefined` for callers that don't pass a customer
  // location (the common case) so their cache entry/key shape is unchanged;
  // see useStoreDetail for why it's rounded rather than the raw coordinates.
  storeDetail: (storeId: string, locationKey?: string) =>
    [...exploreKeys.all, 'store', storeId, locationKey] as const,
};

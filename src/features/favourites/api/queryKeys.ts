export const favouriteKeys = {
  all: ['favourites'] as const,
  list: (params?: unknown) => [...favouriteKeys.all, 'list', params] as const,
  check: (storeId: string) => [...favouriteKeys.all, 'check', storeId] as const,
};

export const favouriteKeys = {
  all: ['favourites'] as const,
  list: () => [...favouriteKeys.all, 'list'] as const,
  check: (storeId: string) => [...favouriteKeys.all, 'check', storeId] as const,
};

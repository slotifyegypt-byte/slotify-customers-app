export const loyaltyKeys = {
  all: ['loyalty'] as const,
  cards: () => [...loyaltyKeys.all, 'cards'] as const,
  capabilities: () => [...loyaltyKeys.all, 'wallet', 'capabilities'] as const,
};

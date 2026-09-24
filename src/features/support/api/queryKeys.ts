export const supportKeys = {
  all: ['support-tickets'] as const,
  list: () => [...supportKeys.all, 'list'] as const,
};

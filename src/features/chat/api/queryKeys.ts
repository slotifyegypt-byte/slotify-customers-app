export const chatKeys = {
  all: ['chat'] as const,
  messages: (bookingId: string) => [...chatKeys.all, 'messages', bookingId] as const,
  unreadCount: (bookingId: string) => [...chatKeys.all, 'unread-count', bookingId] as const,
};

export const bookingKeys = {
  all: ['bookings'] as const,
  myBookings: (status?: string) => [...bookingKeys.all, 'mine', status ?? 'all'] as const,
  detail: (bookingId: string) => [...bookingKeys.all, 'detail', bookingId] as const,
  availability: (params: unknown) => [...bookingKeys.all, 'availability', params] as const,
  storeServices: (storeId: string) => [...bookingKeys.all, 'services', storeId] as const,
  storeEmployees: (storeId: string, serviceId: string) =>
    [...bookingKeys.all, 'employees', storeId, serviceId] as const,
};

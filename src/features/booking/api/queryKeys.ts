export const bookingKeys = {
  all: ['bookings'] as const,
  myBookings: (status?: string) => [...bookingKeys.all, 'mine', status ?? 'all'] as const,
  detail: (bookingId: string) => [...bookingKeys.all, 'detail', bookingId] as const,
  /** The customer's place in the branch's queue for this booking (today). */
  queue: (bookingId: string) => [...bookingKeys.all, 'queue', bookingId] as const,
  /** Prefix of every availability query — invalidate it to distrust all cached grids. */
  availabilityAll: () => [...bookingKeys.all, 'availability'] as const,
  availability: (params: unknown) => [...bookingKeys.availabilityAll(), params] as const,
  storeServices: (storeId: string) => [...bookingKeys.all, 'services', storeId] as const,
  storeEmployees: (storeId: string, serviceId: string) =>
    [...bookingKeys.all, 'employees', storeId, serviceId] as const,
};

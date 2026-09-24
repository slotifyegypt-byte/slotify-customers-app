export const reviewKeys = {
  all: ['reviews'] as const,
  byCustomer: (customerId: string) => [...reviewKeys.all, 'customer', customerId] as const,
};

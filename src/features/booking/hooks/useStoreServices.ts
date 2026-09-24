import { useQuery } from '@tanstack/react-query';

import { getStoreEmployeesForService, getStoreServices } from '../api/bookingApi';
import { bookingKeys } from '../api/queryKeys';

export function useStoreServices(storeId: string) {
  return useQuery({
    queryKey: bookingKeys.storeServices(storeId),
    queryFn: () => getStoreServices(storeId),
  });
}

export function useStoreEmployeesForService(storeId: string, serviceId: string | null) {
  return useQuery({
    queryKey: bookingKeys.storeEmployees(storeId, serviceId ?? ''),
    queryFn: () => getStoreEmployeesForService(storeId, serviceId!),
    enabled: serviceId !== null,
  });
}

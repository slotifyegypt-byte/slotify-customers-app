import { z } from 'zod';

import { apiClient } from '@/lib/api/client';
import { validateResponse } from '@/lib/api/zodFetch';

import { teamMemberSchema } from './schemas';

// customer-app-api-map.md §5 — any authenticated customer can view any
// store's team roster (not scoped per-customer).
export async function getStoreTeam(storeId: string) {
  const response = await apiClient.get(`/stores/${storeId}/team`);
  return validateResponse(z.array(teamMemberSchema), response, `GET /stores/${storeId}/team`);
}

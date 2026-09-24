import { apiClient } from '@/lib/api/client';
import { validateResponse } from '@/lib/api/zodFetch';

import { customerProfileSchema, type CustomerProfile } from './schemas';

// customer-app-api-map.md §2/§11
export async function getMe() {
  const response = await apiClient.get('/customers/me');
  return validateResponse(customerProfileSchema, response, 'GET /customers/me');
}

// §11 — overwrites email/phone directly with no OTP/verification step (a
// documented gap, not something this app can fix client-side).
export async function updateMe(
  payload: Partial<
    Pick<CustomerProfile, 'first_name' | 'last_name' | 'gender' | 'date_of_birth' | 'phone_number' | 'phone_country_code'>
  >,
) {
  const response = await apiClient.put('/customers/me', payload);
  return validateResponse(customerProfileSchema, response, 'PUT /customers/me');
}

export async function deleteMe() {
  await apiClient.delete('/customers/me');
}

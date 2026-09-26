import { isAxiosError } from 'axios';

import { takePendingProfileName } from '@/features/auth/pendingProfile';
import { apiClient } from '@/lib/api/client';
import { validateResponse } from '@/lib/api/zodFetch';
import { supabase } from '@/lib/supabase';

import { customerProfileSchema, type CustomerProfile } from './schemas';

const hasStatus = (err: unknown, status: number) => isAxiosError(err) && err.response?.status === status;

// customer-app-api-map.md §2/§11. A signed-in user has no customer profile
// until the app creates one, so a 404 here means "first sign-in": create it
// from the Google/Apple account and return that instead.
export async function getMe(): Promise<CustomerProfile> {
  try {
    const response = await apiClient.get('/customers/me');
    return validateResponse(customerProfileSchema, response, 'GET /customers/me');
  } catch (err) {
    if (hasStatus(err, 404)) return createMe();
    throw err;
  }
}

async function createMe(): Promise<CustomerProfile> {
  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;
  const meta: Record<string, unknown> = user?.user_metadata ?? {};
  const str = (value: unknown) => (typeof value === 'string' && value.trim() ? value.trim() : undefined);

  // Google puts the name in the user metadata; Apple only hands it to the
  // app on first sign-in (see features/auth/pendingProfile.ts).
  const pending = takePendingProfileName();
  const [fullFirst, ...fullRest] = (str(meta.full_name) ?? str(meta.name) ?? '').split(/\s+/);
  const firstName =
    str(pending?.first_name) ?? str(meta.given_name) ?? str(fullFirst) ?? user?.email?.split('@')[0] ?? 'Guest';
  const lastName = str(pending?.last_name) ?? str(meta.family_name) ?? str(fullRest.join(' '));

  try {
    const response = await apiClient.post('/customers/me', {
      first_name: firstName,
      last_name: lastName,
      profile_picture: str(meta.avatar_url) ?? str(meta.picture),
    });
    return validateResponse(customerProfileSchema, response, 'POST /customers/me');
  } catch (err) {
    // Another request created it first (e.g. two screens fetched at once).
    if (hasStatus(err, 409)) {
      const response = await apiClient.get('/customers/me');
      return validateResponse(customerProfileSchema, response, 'GET /customers/me');
    }
    throw err;
  }
}

// §11 — overwrites the phone number directly with no OTP/verification step.
// Email is owned by Supabase Auth and can't be changed through this API.
export async function updateMe(
  payload: Partial<
    Pick<CustomerProfile, 'first_name' | 'last_name' | 'gender' | 'date_of_birth' | 'phone_number' | 'phone_country_code'>
  >,
) {
  const response = await apiClient.put('/customers/me', payload);
  return validateResponse(customerProfileSchema, response, 'PUT /customers/me');
}

// Also deletes the Supabase login server-side; the caller signs out locally.
export async function deleteMe() {
  await apiClient.delete('/customers/me');
}

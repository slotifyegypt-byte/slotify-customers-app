import { takePendingProfileName } from '@/features/auth/pendingProfile';
import { ApiError, fromPostgrest } from '@/lib/api/errors';
import { callFunction } from '@/lib/api/functions';
import { supabase } from '@/lib/supabase';

import { toCustomerProfile } from './mappers';
import type { CustomerProfile } from './schemas';

// developer-guide.md §3: `phone` must be E.164 (+201001234567).
export const isE164 = (value: string) => /^\+[1-9]\d{6,14}$/.test(value);

// A signed-in user has no customer row until the app creates one, so "no row"
// means first sign-in: create it from the Google/Apple account and return
// that instead. RLS scopes the select to the caller's own row.
export async function getMe(): Promise<CustomerProfile> {
  const { data, error } = await supabase.from('customers').select('*').maybeSingle();
  if (error) throw fromPostgrest(error);
  return data ? toCustomerProfile(data) : createMe();
}

async function createMe(): Promise<CustomerProfile> {
  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData.session?.user;
  const meta: Record<string, unknown> = user?.user_metadata ?? {};
  const str = (value: unknown) => (typeof value === 'string' && value.trim() ? value.trim() : undefined);

  // Google puts the name in the user metadata; Apple only hands it to the
  // app on first sign-in (see features/auth/pendingProfile.ts).
  const pending = takePendingProfileName();
  const [fullFirst, ...fullRest] = (str(meta.full_name) ?? str(meta.name) ?? '').split(/\s+/);
  const firstName =
    str(pending?.first_name) ?? str(meta.given_name) ?? str(fullFirst) ?? user?.email?.split('@')[0] ?? 'Guest';
  const lastName = str(pending?.last_name) ?? str(meta.family_name) ?? str(fullRest.join(' '));

  // `user_id` and `email` are filled in server-side from the login. The OAuth
  // picture is a remote URL, not a storage path, so it is not stored.
  const { data, error } = await supabase
    .from('customers')
    .insert({ first_name: firstName, last_name: lastName })
    .select()
    .single();

  if (error) {
    // Another request created it first (e.g. two screens fetched at once).
    if (error.code === '23505') {
      const refetch = await supabase.from('customers').select('*').single();
      if (refetch.error) throw fromPostgrest(refetch.error);
      return toCustomerProfile(refetch.data);
    }
    throw fromPostgrest(error);
  }
  return toCustomerProfile(data);
}

// Phone is overwritten directly with no OTP/verification step. Email is owned
// by Supabase Auth and isn't editable here.
export async function updateMe(
  patch: Partial<Pick<CustomerProfile, 'first_name' | 'last_name' | 'gender' | 'date_of_birth' | 'phone'>>,
): Promise<CustomerProfile> {
  if (patch.phone != null && !isE164(patch.phone)) {
    throw new ApiError('invalid_field', 400, 'phone must be E.164, e.g. +201001234567');
  }

  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  if (!userId) throw new ApiError('not_signed_in', 401);

  const { data, error } = await supabase
    .from('customers')
    .update(patch)
    .eq('user_id', userId)
    .select();
  if (error) throw fromPostgrest(error);
  // RLS filters rather than errors: no visible row means nothing was updated.
  if (!data || data.length === 0) throw new ApiError('forbidden', 403);
  return toCustomerProfile(data[0]);
}

// The customer row is anonymised server-side. `login_deleted` is ignored: a
// customer who is also a partner keeps their login, but this app's session
// must end either way, so the caller always signs out locally afterwards.
export async function deleteMe(): Promise<void> {
  await callFunction('account/me', { method: 'DELETE' });
}

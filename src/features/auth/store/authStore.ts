import type { Session } from '@supabase/supabase-js';
import { create } from 'zustand';

import { supabase } from '@/lib/supabase';

interface AuthState {
  accessToken: string | null;
  _hasHydrated: boolean;
}

// A read-only mirror of the Supabase session, which owns persistence and
// token refresh (see lib/supabase.ts). Kept as a zustand store so the route
// guards, the chat socket and query `enabled` flags can subscribe to it.
// Server-derived data (the customer profile) is never stored here — React
// Query owns it (see features/profile/api/queries.ts).
export const useAuthStore = create<AuthState>()(() => ({
  accessToken: null,
  _hasHydrated: false,
}));

function applySession(session: Session | null) {
  useAuthStore.setState({ accessToken: session?.access_token ?? null, _hasHydrated: true });
}

supabase.auth.getSession().then(
  ({ data }) => applySession(data.session),
  () => applySession(null),
);

// Fires on sign-in, sign-out and every token refresh, so the mirrored access
// token never goes stale.
supabase.auth.onAuthStateChange((_event, session) => applySession(session));

export const isAuthenticated = () => Boolean(useAuthStore.getState().accessToken);

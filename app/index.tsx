import { Redirect } from 'expo-router';

import { useAuthStore } from '@/features/auth/store/authStore';

// Stack.Protected conditionally includes/excludes screens, but doesn't by
// itself define what the bare "/" path resolves to — this explicit index
// route is what "/" actually matches, and it immediately redirects to
// whichever guarded branch is currently reachable.
export default function Index() {
  const isAuthed = Boolean(useAuthStore((s) => s.accessToken));
  return <Redirect href={isAuthed ? '/(tabs)/home' : '/sign-in'} />;
}

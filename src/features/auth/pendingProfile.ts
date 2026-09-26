// Apple shares the user's name only on their very first sign-in, and only
// with the app (it isn't in the identity token Supabase sees). Hold it here
// until the customer profile is created (profile/api/profileApi.ts).
export interface PendingProfileName {
  first_name?: string;
  last_name?: string;
}

let pending: PendingProfileName | null = null;

export function setPendingProfileName(name: PendingProfileName) {
  pending = name;
}

export function takePendingProfileName(): PendingProfileName | null {
  const name = pending;
  pending = null;
  return name;
}

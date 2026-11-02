// View model for the signed-in customer, built from a `customers` row by
// `mappers.ts`. Phone is a single E.164 string; the avatar is a display URL
// derived from the stored `avatar_path`.
export interface CustomerProfile {
  id: string;
  first_name: string;
  last_name: string | null;
  gender: 'male' | 'female' | null;
  date_of_birth: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
}

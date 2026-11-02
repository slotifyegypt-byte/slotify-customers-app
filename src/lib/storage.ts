import { supabase } from '@/lib/supabase';

// Tables store the file *path*, not a URL (developer-guide.md §8); both
// buckets are public, so a display URL is derived locally with no request.
export function publicUrl(
  path: string | null | undefined,
  bucket: 'public-media' | 'avatars' = 'public-media',
): string | null {
  if (!path) return null;
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

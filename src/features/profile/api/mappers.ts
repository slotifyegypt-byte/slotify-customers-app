import type { Tables } from '@/lib/database.types';
import { publicUrl } from '@/lib/storage';

import type { CustomerProfile } from './schemas';

export function toCustomerProfile(row: Tables<'customers'>): CustomerProfile {
  return {
    id: row.id,
    first_name: row.first_name,
    last_name: row.last_name,
    gender: row.gender,
    date_of_birth: row.date_of_birth,
    email: row.email,
    phone: row.phone,
    avatar_url: publicUrl(row.avatar_path, 'avatars'),
  };
}

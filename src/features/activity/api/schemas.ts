import { z } from 'zod';

// customer-app-api-map.md §5 — "meet the team". Used from booking detail
// (§9) purely to resolve a specialist-mode service's `employee_id` to a
// display name: `BookingServiceRead` only carries `employee_id` (verified
// against the live /openapi.json — no `employee_name` field comes back on
// a booking, unlike the `GET /availability` employee-mode payload), so the
// name has to be looked up from the store's roster instead.
export const teamMemberSchema = z.object({
  id: z.string(),
  first_name: z.string(),
  last_name: z.string().nullable().optional(),
  profile_picture: z.string().nullable().optional(),
  role_name: z.string().nullable().optional(),
});
export type TeamMember = z.infer<typeof teamMemberSchema>;

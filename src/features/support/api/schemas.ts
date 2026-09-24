import { z } from 'zod';

// customer-app-api-map.md §11 — VERIFIED against the live backend's
// /openapi.json (2026-09-20): a real support-ticket endpoint now exists,
// replacing the previously documented "❌ no support-ticket endpoint" gap
// that made Contact Us's Send button open a mailto: link instead.
export const supportTicketSchema = z.object({
  id: z.string(),
  customer_id: z.string(),
  subject: z.string(),
  message: z.string(),
  status: z.enum(['open', 'resolved']),
  created_at: z.string(),
  updated_at: z.string().nullable().optional(),
});
export type SupportTicket = z.infer<typeof supportTicketSchema>;

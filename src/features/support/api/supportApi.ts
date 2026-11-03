import { ApiError, fromPostgrest } from '@/lib/api/errors';
import { supabase } from '@/lib/supabase';

import type { SupportTicket } from './schemas';

export interface CreateSupportTicketPayload {
  subject: string;
  message: string;
}

// `authenticated` is only granted INSERT on (app, subject, message). `user_id`
// defaults to the login and a trigger forces `status` to 'open'. `admin_note`
// is staff-internal, so it is deliberately not selected.
const TICKET_COLUMNS = 'id, subject, message, status, created_at, updated_at';

// Contact Us files tickets for the customer app.
export async function createSupportTicket(payload: CreateSupportTicketPayload): Promise<SupportTicket> {
  const { data, error } = await supabase
    .from('support_tickets')
    .insert({ app: 'customer', subject: payload.subject, message: payload.message })
    .select(TICKET_COLUMNS);
  if (error) throw fromPostgrest(error);
  // RLS refusal shows up as an insert that returns no row.
  if (!data?.length) throw new ApiError('forbidden', 403, 'ticket not created');
  return data[0];
}

// Lists the caller's own tickets, newest first. Not surfaced in the UI yet
// (Contact Us only creates tickets today).
export async function getSupportTickets(): Promise<SupportTicket[]> {
  const { data, error } = await supabase
    .from('support_tickets')
    .select(TICKET_COLUMNS)
    .order('created_at', { ascending: false });
  if (error) throw fromPostgrest(error);
  return data ?? [];
}

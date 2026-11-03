// View model for a `support_tickets` row (developer-guide.md §12). `user_id`
// is filled in server-side, and `admin_note` is internal, so neither is
// exposed. `in_progress` is a backend-only intermediate state.
export interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved';
  created_at: string;
  updated_at: string;
}

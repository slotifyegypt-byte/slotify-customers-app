// developer-guide.md §7 — one thread per booking. The screen keys bubble
// alignment off `sender`; `message` is the table's `body` column.
export type SenderType = 'customer' | 'branch';

export type BookingMessage = {
  id: string;
  booking_id: string;
  sender: SenderType;
  message: string;
  read_at: string | null;
  created_at: string;
};

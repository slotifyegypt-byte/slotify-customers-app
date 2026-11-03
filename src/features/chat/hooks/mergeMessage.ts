import type { BookingMessage } from '../api/schemas';

// Adds one message to the cached thread. Deduped by `id` — a message this
// client just sent also arrives over Realtime, and a catch-up refetch can race
// a push. Kept in chronological order by instant (not string) so an
// out-of-order arrival lands in the right place; equal instants keep insertion order.
export function mergeMessage(prev: BookingMessage[] | undefined, incoming: BookingMessage): BookingMessage[] {
  if (!prev) return [incoming];
  if (prev.some((m) => m.id === incoming.id)) return prev;
  const at = Date.parse(incoming.created_at);
  let index = prev.length;
  while (index > 0 && Date.parse(prev[index - 1].created_at) > at) index -= 1;
  return [...prev.slice(0, index), incoming, ...prev.slice(index)];
}

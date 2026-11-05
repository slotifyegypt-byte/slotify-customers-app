import type { BookingMessage } from '../api/schemas';

import { mergeMessage } from './mergeMessage';

const msg = (
  id: string,
  created_at: string,
  overrides: Partial<BookingMessage> = {},
): BookingMessage => ({
  id,
  booking_id: 'bk1',
  sender: 'customer',
  message: `message ${id}`,
  read_at: null,
  created_at,
  ...overrides,
});

describe('mergeMessage', () => {
  it('starts a list when there is no cache yet', () => {
    const a = msg('a', '2026-11-01T10:00:00Z');
    expect(mergeMessage(undefined, a)).toEqual([a]);
  });

  it('ignores a message whose id is already present (own-send echo)', () => {
    const a = msg('a', '2026-11-01T10:00:00Z');
    const prev = [a];
    expect(mergeMessage(prev, { ...a })).toBe(prev);
  });

  it('appends a newer message', () => {
    const a = msg('a', '2026-11-01T10:00:00Z');
    const b = msg('b', '2026-11-01T10:05:00Z');
    expect(mergeMessage([a], b)).toEqual([a, b]);
  });

  it('places an out-of-order arrival chronologically', () => {
    const a = msg('a', '2026-11-01T10:00:00Z');
    const c = msg('c', '2026-11-01T10:10:00Z');
    const b = msg('b', '2026-11-01T10:05:00Z');
    expect(mergeMessage([a, c], b).map((m) => m.id)).toEqual(['a', 'b', 'c']);
  });

  it('compares instants, not strings (different offsets/precision)', () => {
    const a = msg('a', '2026-11-01T10:00:00.5+00:00');
    const b = msg('b', '2026-11-01T12:00:00+02:00'); // 10:00:00Z, earlier than a
    expect(mergeMessage([a], b).map((m) => m.id)).toEqual(['b', 'a']);
  });

  it('keeps insertion order for identical timestamps', () => {
    const a = msg('a', '2026-11-01T10:00:00Z');
    const b = msg('b', '2026-11-01T10:00:00Z');
    expect(mergeMessage([a], b).map((m) => m.id)).toEqual(['a', 'b']);
  });
});

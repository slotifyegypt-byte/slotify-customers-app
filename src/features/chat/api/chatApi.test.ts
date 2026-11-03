import { isApiError } from '@/lib/api/errors';
import { mockQuery } from '@/test/mockSupabase';

import { getBookingMessages, markBookingMessagesRead, sendBookingMessage, toBookingMessage, type MessageRow } from './chatApi';

const mockFrom = jest.fn();
const mockRpc = jest.fn();

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: (...args: unknown[]) => mockFrom(...args),
    rpc: (...args: unknown[]) => mockRpc(...args),
  },
}));

beforeEach(() => {
  mockFrom.mockReset();
  mockRpc.mockReset();
});

const row = (id: string, overrides: Record<string, unknown> = {}): MessageRow => ({
  id,
  booking_id: 'bk1',
  sender: 'branch',
  body: `message ${id}`,
  read_at: null,
  created_at: '2026-11-01T10:00:00Z',
  ...overrides,
});

describe('toBookingMessage', () => {
  it('maps body to message and drops the sender ids', () => {
    expect(toBookingMessage(row('m1', { read_at: '2026-11-01T11:00:00Z' }))).toEqual({
      id: 'm1',
      booking_id: 'bk1',
      sender: 'branch',
      message: 'message m1',
      read_at: '2026-11-01T11:00:00Z',
      created_at: '2026-11-01T10:00:00Z',
    });
  });
});

describe('getBookingMessages', () => {
  it('asks for the newest page and returns it oldest-first with body mapped to message', async () => {
    const { builder, calls } = mockQuery({
      data: [
        row('m3', { created_at: '2026-11-01T12:00:00Z' }),
        row('m2', { created_at: '2026-11-01T11:00:00Z' }),
        row('m1', { created_at: '2026-11-01T10:00:00Z' }),
      ],
    });
    mockFrom.mockReturnValue(builder);

    const messages = await getBookingMessages('bk1');

    expect(mockFrom).toHaveBeenCalledWith('booking_messages');
    expect(calls).toContainEqual(['eq', ['booking_id', 'bk1']]);
    expect(calls).toContainEqual(['order', ['created_at', { ascending: false }]]);
    expect(calls).toContainEqual(['limit', [50]]);
    expect(messages.map((m) => m.id)).toEqual(['m1', 'm2', 'm3']);
    expect(messages[0].message).toBe('message m1');
  });

  it('passes a custom limit through', async () => {
    const { builder, calls } = mockQuery({ data: [] });
    mockFrom.mockReturnValue(builder);
    await getBookingMessages('bk1', 10);
    expect(calls).toContainEqual(['limit', [10]]);
  });

  it('only selects columns the authenticated role may read', async () => {
    const { builder, calls } = mockQuery({ data: [] });
    mockFrom.mockReturnValue(builder);
    await getBookingMessages('bk1');
    expect(calls).toContainEqual(['select', ['id, booking_id, sender, body, read_at, created_at']]);
  });

  it('maps a postgrest error', async () => {
    const { builder } = mockQuery({ error: { code: '42501', message: 'denied' } });
    mockFrom.mockReturnValue(builder);
    await expect(getBookingMessages('bk1')).rejects.toMatchObject({ code: 'forbidden', status: 403 });
  });
});

describe('sendBookingMessage', () => {
  it('inserts only booking_id and the trimmed body, and returns the mapped row', async () => {
    const { builder, calls } = mockQuery({ data: [row('m9', { sender: 'customer', body: 'hello' })] });
    mockFrom.mockReturnValue(builder);

    const sent = await sendBookingMessage('bk1', '  hello  ');

    expect(mockFrom).toHaveBeenCalledWith('booking_messages');
    expect(calls).toContainEqual(['insert', [{ booking_id: 'bk1', body: 'hello' }]]);
    expect(calls).toContainEqual(['select', ['id, booking_id, sender, body, read_at, created_at']]);
    expect(sent).toMatchObject({ id: 'm9', sender: 'customer', message: 'hello' });
  });

  it.each([['empty', ''], ['whitespace', '   \n '], ['over 2000 chars', 'a'.repeat(2001)]])(
    'rejects an %s body before any request',
    async (_name, body) => {
      const err = await sendBookingMessage('bk1', body).catch((e) => e);
      expect(isApiError(err, 'invalid_input')).toBe(true);
      expect(err.status).toBe(422);
      expect(mockFrom).not.toHaveBeenCalled();
    },
  );

  it('accepts exactly 2000 chars', async () => {
    const { builder } = mockQuery({ data: [row('m9', { sender: 'customer' })] });
    mockFrom.mockReturnValue(builder);
    await expect(sendBookingMessage('bk1', 'a'.repeat(2000))).resolves.toBeDefined();
  });

  it('throws forbidden when the insert returns no row (RLS refusal)', async () => {
    const { builder } = mockQuery({ data: [] });
    mockFrom.mockReturnValue(builder);
    await expect(sendBookingMessage('bk1', 'hi')).rejects.toMatchObject({ code: 'forbidden', status: 403 });
  });

  it('maps a postgrest error', async () => {
    const { builder } = mockQuery({ error: { code: '42501', message: 'denied' } });
    mockFrom.mockReturnValue(builder);
    await expect(sendBookingMessage('bk1', 'hi')).rejects.toMatchObject({ code: 'forbidden' });
  });
});

describe('markBookingMessagesRead', () => {
  it('calls mark_messages_read with the booking id', async () => {
    mockRpc.mockResolvedValue({ data: 2, error: null });
    await expect(markBookingMessagesRead('bk1')).resolves.toBeUndefined();
    expect(mockRpc).toHaveBeenCalledWith('mark_messages_read', { p_booking_id: 'bk1' });
  });

  it('maps an rpc error (booking_not_found is raised as PT404)', async () => {
    mockRpc.mockResolvedValue({ data: null, error: { code: 'PT404', message: 'booking_not_found' } });
    await expect(markBookingMessagesRead('bk1')).rejects.toMatchObject({ code: 'booking_not_found', status: 404 });
  });
});

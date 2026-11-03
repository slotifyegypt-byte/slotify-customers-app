import { mockQuery } from '@/test/mockSupabase';

import { createSupportTicket, getSupportTickets } from './supportApi';

const mockFrom = jest.fn();

jest.mock('@/lib/supabase', () => ({
  supabase: { from: (...args: unknown[]) => mockFrom(...args) },
}));

const row = {
  id: 't1',
  subject: 'Refund',
  message: 'Please refund my booking',
  status: 'open',
  created_at: '2026-11-03T10:00:00Z',
  updated_at: '2026-11-03T10:00:00Z',
};

describe('createSupportTicket', () => {
  it('inserts only app, subject and message and returns the ticket', async () => {
    const { builder, calls } = mockQuery({ data: [row], error: null });
    mockFrom.mockReturnValue(builder);

    const ticket = await createSupportTicket({ subject: 'Refund', message: 'Please refund my booking' });

    expect(mockFrom).toHaveBeenCalledWith('support_tickets');
    expect(calls).toContainEqual(['insert', [{ app: 'customer', subject: 'Refund', message: 'Please refund my booking' }]]);
    expect(ticket).toEqual(row);
  });

  it('only selects granted columns (no admin_note)', async () => {
    const { builder, calls } = mockQuery({ data: [row], error: null });
    mockFrom.mockReturnValue(builder);
    await createSupportTicket({ subject: 'a', message: 'b' });
    const select = calls.find(([method]) => method === 'select');
    expect(String(select?.[1][0])).not.toContain('admin_note');
    expect(String(select?.[1][0])).not.toContain('*');
  });

  it('throws forbidden when the insert returns no row', async () => {
    const { builder } = mockQuery({ data: [], error: null });
    mockFrom.mockReturnValue(builder);
    await expect(createSupportTicket({ subject: 'a', message: 'b' })).rejects.toMatchObject({ code: 'forbidden' });
  });

  it('throws an ApiError on failure', async () => {
    const { builder } = mockQuery({ data: null, error: { code: '23514', message: 'check' } });
    mockFrom.mockReturnValue(builder);
    await expect(createSupportTicket({ subject: 'a', message: 'b' })).rejects.toMatchObject({ status: expect.any(Number) });
  });
});

describe('getSupportTickets', () => {
  it('lists own tickets newest first', async () => {
    const { builder, calls } = mockQuery({ data: [row], error: null });
    mockFrom.mockReturnValue(builder);

    const tickets = await getSupportTickets();

    expect(mockFrom).toHaveBeenCalledWith('support_tickets');
    expect(calls).toContainEqual(['order', ['created_at', { ascending: false }]]);
    expect(tickets).toEqual([row]);
  });
});

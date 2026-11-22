import { checkInHere, getMyQueueTicket } from './queueApi';

const mockRpc = jest.fn();

jest.mock('@/lib/supabase', () => ({
  supabase: { rpc: (...args: unknown[]) => mockRpc(...args) },
}));

beforeEach(() => mockRpc.mockReset());

describe('checkInHere', () => {
  it('sends the booking and where the customer is, and returns the ticket number', async () => {
    mockRpc.mockResolvedValue({ data: { id: 't1', number: 4, status: 'waiting' }, error: null });
    await expect(checkInHere('b1', { latitude: 30.01, longitude: 31.2 })).resolves.toEqual({
      number: 4,
    });
    expect(mockRpc).toHaveBeenCalledWith('queue_customer_check_in', {
      p_booking_id: 'b1',
      p_latitude: 30.01,
      p_longitude: 31.2,
    });
  });

  it('turns a refusal into an ApiError with the machine code', async () => {
    mockRpc.mockResolvedValue({
      data: null,
      error: { code: 'PT409', message: 'too_far', details: 'too_far' },
    });
    await expect(checkInHere('b1', { latitude: 0, longitude: 0 })).rejects.toMatchObject({
      code: 'too_far',
      status: 409,
    });
  });
});

describe('getMyQueueTicket', () => {
  it('maps the ticket', async () => {
    mockRpc.mockResolvedValue({
      data: [
        {
          ticket_id: 't1',
          ticket_number: 4,
          status: 'waiting',
          due_at: '2026-11-05T15:00:00Z',
          called_at: null,
          employee_name: 'Sami Adel',
          ahead: 2,
        },
      ],
      error: null,
    });
    await expect(getMyQueueTicket('b1')).resolves.toEqual({
      number: 4,
      status: 'waiting',
      dueAt: '2026-11-05T15:00:00Z',
      employeeName: 'Sami Adel',
      ahead: 2,
    });
    expect(mockRpc).toHaveBeenCalledWith('get_my_queue_ticket', { p_booking_id: 'b1' });
  });

  it('is null when the customer is not in the queue', async () => {
    mockRpc.mockResolvedValue({ data: [], error: null });
    await expect(getMyQueueTicket('b1')).resolves.toBeNull();
  });
});

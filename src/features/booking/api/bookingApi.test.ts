import { mockQuery } from '@/test/mockSupabase';

import { cancelBooking, getBooking, getMyBookings, getStoreEmployeesForService, getStoreServices } from './bookingApi';
import { BOOKING_SELECT } from './mappers';

const mockRpc = jest.fn();
const mockFrom = jest.fn();

jest.mock('@/lib/supabase', () => ({
  supabase: {
    rpc: (...args: unknown[]) => mockRpc(...args),
    from: (...args: unknown[]) => mockFrom(...args),
    storage: {
      from: (bucket: string) => ({
        getPublicUrl: (path: string) => ({ data: { publicUrl: `https://cdn.test/${bucket}/${path}` } }),
      }),
    },
  },
}));

beforeEach(() => {
  mockRpc.mockReset();
  mockFrom.mockReset();
});

const service = (id: string, overrides: Record<string, unknown> = {}) => ({
  id,
  name: `Service ${id}`,
  description: null,
  image_path: null,
  duration_minutes: 30,
  booking_mode: 'specialist',
  capacity: null,
  price: 100,
  sort_order: 0,
  archived_at: null,
  category: null,
  ...overrides,
});

describe('getStoreServices', () => {
  it('fetches the branch currency and active branch services, then maps them', async () => {
    const card = mockQuery({ data: { currency: 'PLN' }, error: null });
    const rows = mockQuery({
      data: [
        { price: 80, is_active: true, service: service('s1') },
        { price: 0, is_active: true, service: service('s2', { booking_mode: 'capacity', capacity: 3 }) },
        { price: null, is_active: true, service: service('s3', { archived_at: '2026-10-01T00:00:00Z' }) },
        { price: null, is_active: false, service: service('s4') },
      ],
      error: null,
    });
    mockFrom.mockReturnValueOnce(card.builder).mockReturnValueOnce(rows.builder);

    const services = await getStoreServices('b1');

    expect(mockFrom).toHaveBeenNthCalledWith(1, 'branch_cards');
    expect(card.calls).toContainEqual(['select', ['currency']]);
    expect(card.calls).toContainEqual(['eq', ['id', 'b1']]);
    expect(mockFrom).toHaveBeenNthCalledWith(2, 'branch_services');
    expect(rows.calls).toContainEqual(['eq', ['branch_id', 'b1']]);
    expect(rows.calls).toContainEqual(['eq', ['is_active', true]]);
    expect(services.map((s) => [s.id, s.price, s.currency, s.requires_specialist, s.max_concurrent_bookings])).toEqual([
      ['s1', 80, 'PLN', true, null],
      ['s2', 0, 'PLN', false, 3],
    ]);
  });

  it('orders by category sort_order (uncategorised last), then service sort_order, then name', async () => {
    const card = mockQuery({ data: { currency: 'EGP' }, error: null });
    const hair = { id: 'c1', name: 'Hair', sort_order: 1 };
    const nails = { id: 'c2', name: 'Nails', sort_order: 2 };
    const rows = mockQuery({
      data: [
        { price: null, is_active: true, service: service('none') },
        { price: null, is_active: true, service: service('nails', { category: nails }) },
        { price: null, is_active: true, service: service('hair-b', { category: hair, name: 'B', sort_order: 1 }) },
        { price: null, is_active: true, service: service('hair-a', { category: hair, name: 'A', sort_order: 1 }) },
        { price: null, is_active: true, service: service('hair-first', { category: hair, name: 'Z', sort_order: 0 }) },
      ],
      error: null,
    });
    mockFrom.mockReturnValueOnce(card.builder).mockReturnValueOnce(rows.builder);

    const services = await getStoreServices('b1');

    expect(services.map((s) => s.id)).toEqual(['hair-first', 'hair-a', 'hair-b', 'nails', 'none']);
  });

  it('throws an ApiError when the branch is not found', async () => {
    const card = mockQuery({ data: null, error: { code: 'PGRST116', message: 'no rows' } });
    const rows = mockQuery({ data: [], error: null });
    mockFrom.mockReturnValueOnce(card.builder).mockReturnValueOnce(rows.builder);

    await expect(getStoreServices('missing')).rejects.toMatchObject({ code: 'not_found', status: 404 });
  });
});

describe('getStoreEmployeesForService', () => {
  it('returns only team members whose service_ids include the service', async () => {
    mockRpc.mockResolvedValue({
      data: [
        { employee_id: 'e1', first_name: 'Sara', last_name: 'Adel', job_title: 'Stylist', avatar_path: null, bio: null, service_ids: ['s1', 's2'] },
        { employee_id: 'e2', first_name: 'Omar', last_name: null, job_title: null, avatar_path: 'employees/e2/a.jpg', bio: null, service_ids: ['s2'] },
        { employee_id: 'e3', first_name: 'Lina', last_name: 'K', job_title: 'Barber', avatar_path: null, bio: null, service_ids: ['s1'] },
      ],
      error: null,
    });

    const employees = await getStoreEmployeesForService('b1', 's2');

    expect(mockRpc).toHaveBeenCalledTimes(1);
    expect(mockRpc).toHaveBeenCalledWith('get_branch_team', { p_branch_id: 'b1' });
    expect(employees).toEqual([
      { id: 'e1', first_name: 'Sara', last_name: 'Adel', profile_picture: null, role_name: 'Stylist', rating: null },
      {
        id: 'e2',
        first_name: 'Omar',
        last_name: null,
        profile_picture: 'https://cdn.test/public-media/employees/e2/a.jpg',
        role_name: null,
        rating: null,
      },
    ]);
  });
});

const bookingRow = (overrides: Record<string, unknown> = {}) => ({
  id: 'bk1',
  branch_id: 'b1',
  business_id: 'biz1',
  customer_id: 'c1',
  status: 'confirmed',
  total_price: 100,
  currency: 'EGP',
  starts_at: '2026-11-10T08:00:00+00:00',
  ends_at: '2026-11-10T08:30:00+00:00',
  created_at: '2026-11-01T10:00:00+00:00',
  updated_at: '2026-11-01T10:00:00+00:00',
  items: [
    {
      id: 'i1',
      booking_id: 'bk1',
      service_id: 's1',
      service_name: 'Cut',
      employee_id: 'e1',
      employee_name: 'Sara',
      price: 100,
      starts_at: '2026-11-10T08:00:00+00:00',
      ends_at: '2026-11-10T08:30:00+00:00',
      status: 'confirmed',
      created_at: '2026-11-01T10:00:00+00:00',
      updated_at: '2026-11-01T10:00:00+00:00',
    },
  ],
  branch: {
    id: 'b1',
    business_id: 'biz1',
    business_name: 'Studio',
    branch_name: 'Maadi',
    address: 'Addr',
    category_slugs: [],
    logo_path: null,
    latitude: null,
    longitude: null,
    rating_avg: 4.5,
    rating_count: 3,
    is_open_now: true,
    timezone: 'Africa/Cairo',
    currency: 'EGP',
  },
  reviews: [],
  ...overrides,
});

describe('getMyBookings', () => {
  it('selects the guide string verbatim and orders by starts_at descending', async () => {
    const q = mockQuery({ data: [bookingRow()], error: null });
    mockFrom.mockReturnValueOnce(q.builder);

    const bookings = await getMyBookings();

    expect(mockFrom).toHaveBeenCalledWith('bookings');
    expect(q.calls).toContainEqual([
      'select',
      ['*, items:booking_items(*), branch:branch_cards(*), reviews:reviews!reviews_booking_id_branch_id_fkey(id, rating)'],
    ]);
    expect(BOOKING_SELECT).toBe(
      '*, items:booking_items(*), branch:branch_cards(*), reviews:reviews!reviews_booking_id_branch_id_fkey(id, rating)',
    );
    expect(q.calls).toContainEqual(['order', ['starts_at', { ascending: false }]]);
    expect(q.calls.some(([method]) => method === 'eq')).toBe(false);
    expect(bookings.map((b) => b.id)).toEqual(['bk1']);
  });

  it("adds .eq('status', status) when a status is given", async () => {
    const q = mockQuery({ data: [], error: null });
    mockFrom.mockReturnValueOnce(q.builder);

    await getMyBookings('confirmed');

    expect(q.calls).toContainEqual(['eq', ['status', 'confirmed']]);
    expect(q.calls).toContainEqual(['order', ['starts_at', { ascending: false }]]);
  });

  it('throws an ApiError on a postgrest error', async () => {
    mockFrom.mockReturnValueOnce(mockQuery({ data: null, error: { code: '42501', message: 'rls' } }).builder);
    await expect(getMyBookings()).rejects.toMatchObject({ code: 'forbidden', status: 403 });
  });
});

describe('getBooking', () => {
  it('reads one booking by id with the same select', async () => {
    const q = mockQuery({ data: bookingRow(), error: null });
    mockFrom.mockReturnValueOnce(q.builder);

    const booking = await getBooking('bk1');

    expect(q.calls).toContainEqual(['eq', ['id', 'bk1']]);
    expect(q.calls.some(([method]) => method === 'single')).toBe(true);
    expect(booking.booking_services_str).toBe('Cut');
  });

  it('maps a missing row to not_found', async () => {
    mockFrom.mockReturnValueOnce(mockQuery({ data: null, error: { code: 'PGRST116', message: 'no rows' } }).builder);
    await expect(getBooking('nope')).rejects.toMatchObject({ code: 'not_found', status: 404 });
  });
});

describe('cancelBooking', () => {
  it('calls transition_booking then refetches and returns the booking', async () => {
    mockRpc.mockResolvedValue({ data: {}, error: null });
    mockFrom.mockReturnValueOnce(mockQuery({ data: bookingRow({ status: 'cancelled' }), error: null }).builder);

    const booking = await cancelBooking('bk1', 'changed my mind');

    expect(mockRpc).toHaveBeenCalledWith('transition_booking', {
      p_booking_id: 'bk1',
      p_to_status: 'cancelled',
      p_reason: 'changed my mind',
    });
    expect(mockFrom).toHaveBeenCalledWith('bookings');
    expect(booking.booking_status).toBe('cancelled');
  });

  it('omits p_reason when none is given', async () => {
    mockRpc.mockResolvedValue({ data: {}, error: null });
    mockFrom.mockReturnValueOnce(mockQuery({ data: bookingRow({ status: 'cancelled' }), error: null }).builder);

    await cancelBooking('bk1');

    expect(mockRpc).toHaveBeenCalledWith('transition_booking', { p_booking_id: 'bk1', p_to_status: 'cancelled' });
  });

  it('surfaces PT409 invalid_transition as ApiError and does not refetch', async () => {
    mockRpc.mockResolvedValue({ data: null, error: { code: 'PT409', message: 'invalid_transition' } });

    await expect(cancelBooking('bk1')).rejects.toMatchObject({ name: 'ApiError', code: 'invalid_transition', status: 409 });
    expect(mockFrom).not.toHaveBeenCalled();
  });
});

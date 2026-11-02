import { mockQuery } from '@/test/mockSupabase';

import { getStoreEmployeesForService, getStoreServices } from './bookingApi';

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

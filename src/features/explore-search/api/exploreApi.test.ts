import { mockQuery } from '@/test/mockSupabase';

import { getNearbyStores, getSearchPromoted, getStoreDetail, searchStores } from './exploreApi';

const mockRpc = jest.fn();
const mockFrom = jest.fn();

jest.mock('@/lib/supabase', () => ({
  supabase: {
    rpc: (...args: unknown[]) => mockRpc(...args),
    from: (...args: unknown[]) => mockFrom(...args),
    storage: {
      from: (bucket: string) => ({
        getPublicUrl: (path: string) => ({
          data: { publicUrl: `https://cdn.test/${bucket}/${path}` },
        }),
      }),
    },
  },
}));

const searchRow = (n: number) => ({
  id: `branch-${n}`,
  business_id: 'biz-1',
  business_name: 'Glamour Studio',
  branch_name: 'Maadi',
  address: '9 Road 9, Maadi',
  city: 'Cairo',
  latitude: 29.96,
  longitude: 31.25,
  logo_path: 'logos/glamour.png',
  rating_avg: 4.6,
  rating_count: 12,
  category_slugs: ['hair-salon'],
  is_open_now: true,
  timezone: 'Africa/Cairo',
  distance_km: 1.2,
  phone: '+201009998877',
  description: 'Hair and colour studio',
});

const cardRow = {
  id: 'branch-1',
  business_id: 'biz-1',
  business_name: 'Glamour Studio',
  branch_name: 'Maadi',
  address: '9 Road 9, Maadi',
  city: 'Cairo',
  country_code: 'EG',
  currency: 'EGP',
  description: 'Cut and colour',
  phone: '+201001234567',
  share_slug: 'glamour-maadi',
  amenities: ['parking', 'wifi'],
  latitude: 29.96,
  longitude: 31.25,
  logo_path: null,
  rating_avg: 4.6,
  rating_count: 12,
  category_slugs: ['hair-salon'],
  is_open_now: false,
  timezone: 'Africa/Cairo',
};

beforeEach(() => {
  mockRpc.mockReset();
  mockFrom.mockReset();
});

describe('getNearbyStores', () => {
  it('calls search_branches with the nearby args and maps rows', async () => {
    mockRpc.mockResolvedValue({ data: [searchRow(1)], error: null });

    const stores = await getNearbyStores({
      latitude: 29.96,
      longitude: 31.25,
      radius_km: 15,
      limit: 20,
    });

    expect(mockRpc).toHaveBeenCalledWith('search_branches', {
      p_lat: 29.96,
      p_lng: 31.25,
      p_radius_km: 15,
      p_limit: 20,
    });
    expect(stores[0]).toMatchObject({
      id: 'branch-1',
      name: 'Glamour Studio – Maadi',
      status: 'open',
      logo: 'https://cdn.test/public-media/logos/glamour.png',
      distance_km: 1.2,
      rating: 4.6,
      category_slugs: ['hair-salon'],
    });
  });

  it('throws an ApiError when the rpc fails', async () => {
    mockRpc.mockResolvedValue({ data: null, error: { code: '42501', message: 'nope' } });
    await expect(getNearbyStores({ latitude: 1, longitude: 2 })).rejects.toMatchObject({
      code: 'forbidden',
    });
  });
});

describe('search_branches contact fields', () => {
  it('maps phone and description from nearby rows', async () => {
    mockRpc.mockResolvedValue({ data: [searchRow(1)], error: null });
    const [store] = await getNearbyStores({ latitude: 29.96, longitude: 31.25 });
    expect(store).toMatchObject({ phone: '+201009998877', description: 'Hair and colour studio' });
  });

  it('maps phone and description from search rows', async () => {
    mockRpc.mockResolvedValue({ data: [searchRow(1)], error: null });
    const { stores } = await searchStores({ q: 'hair' });
    expect(stores[0]).toMatchObject({
      phone: '+201009998877',
      description: 'Hair and colour studio',
    });
  });

  it('keeps null phone and description when the branch has none', async () => {
    mockRpc.mockResolvedValue({
      data: [{ ...searchRow(1), phone: null, description: null }],
      error: null,
    });
    const { stores } = await searchStores({ q: 'hair' });
    expect(stores[0]).toMatchObject({ phone: null, description: null });
  });
});

describe('searchStores', () => {
  it('maps the screen params onto the rpc args', async () => {
    mockRpc.mockResolvedValue({ data: [], error: null });

    await searchStores({
      q: 'hair',
      latitude: 30,
      longitude: 31,
      distance: '5',
      rating: 4,
      availability: '2026-11-03T10:00:00Z',
      limit: 20,
      offset: 40,
    });

    expect(mockRpc).toHaveBeenCalledWith('search_branches', {
      p_query: 'hair',
      p_lat: 30,
      p_lng: 31,
      p_radius_km: 5,
      p_min_rating: 4,
      p_open_on: '2026-11-03T10:00:00Z',
      p_limit: 20,
      p_offset: 40,
    });
  });

  it('reports hasMore when a full page comes back', async () => {
    mockRpc.mockResolvedValue({
      data: Array.from({ length: 20 }, (_, i) => searchRow(i)),
      error: null,
    });
    const result = await searchStores({ q: 'hair', limit: 20 });
    expect(result.stores).toHaveLength(20);
    expect(result.hasMore).toBe(true);
  });

  it('reports no more when a partial page comes back', async () => {
    mockRpc.mockResolvedValue({
      data: Array.from({ length: 7 }, (_, i) => searchRow(i)),
      error: null,
    });
    const result = await searchStores({ q: 'hair', limit: 20 });
    expect(result.stores).toHaveLength(7);
    expect(result.hasMore).toBe(false);
  });
});

describe('getStoreDetail', () => {
  it('reads branch_cards by id and leaves distance null without coordinates', async () => {
    const { builder, calls } = mockQuery({ data: cardRow, error: null });
    mockFrom.mockReturnValue(builder);

    const detail = await getStoreDetail('branch-1');

    expect(mockFrom).toHaveBeenCalledWith('branch_cards');
    expect(calls).toContainEqual(['eq', ['id', 'branch-1']]);
    expect(calls.some(([m]) => m === 'single')).toBe(true);
    expect(detail).toMatchObject({
      id: 'branch-1',
      name: 'Glamour Studio – Maadi',
      status: 'closed',
      description: 'Cut and colour',
      phone: '+201001234567',
      amenities: ['parking', 'wifi'],
      currency: 'EGP',
      distance_km: null,
    });
  });

  it('computes distance client-side when coordinates are passed', async () => {
    const { builder } = mockQuery({ data: cardRow, error: null });
    mockFrom.mockReturnValue(builder);

    const detail = await getStoreDetail('branch-1', 29.97, 31.25);

    expect(detail.distance_km).toBeGreaterThan(0.5);
    expect(detail.distance_km).toBeLessThan(2);
  });

  it('throws an ApiError on failure', async () => {
    const { builder } = mockQuery({ data: null, error: { code: 'PGRST116', message: 'no rows' } });
    mockFrom.mockReturnValue(builder);
    await expect(getStoreDetail('missing')).rejects.toMatchObject({ name: 'ApiError' });
  });
});

describe('getSearchPromoted', () => {
  it('reads the promoted search view in placement order and maps the rows like any venue', async () => {
    const { builder, calls } = mockQuery({
      data: [{ ...cardRow, id: 'p1', promotion_sort_order: 0, promoted_until: '2026-12-01' }],
      error: null,
    });
    mockFrom.mockReturnValue(builder);

    const stores = await getSearchPromoted();

    expect(mockFrom).toHaveBeenCalledWith('search_promoted_branch_cards');
    expect(calls).toContainEqual(['order', ['promotion_sort_order', { ascending: true }]]);
    expect(calls).toContainEqual(['limit', [5]]);
    expect(stores).toHaveLength(1);
    expect(stores[0]).toMatchObject({ id: 'p1', name: 'Glamour Studio – Maadi' });
  });

  it('is empty when nobody has paid for the spot', async () => {
    const { builder } = mockQuery({ data: [], error: null });
    mockFrom.mockReturnValue(builder);
    expect(await getSearchPromoted()).toEqual([]);
  });

  it('skips a row that lost its identity instead of showing a half-empty card', async () => {
    const { builder } = mockQuery({
      data: [
        { ...cardRow, id: 'p1' },
        { ...cardRow, id: 'p2', business_name: null },
      ],
      error: null,
    });
    mockFrom.mockReturnValue(builder);
    expect((await getSearchPromoted()).map((s) => s.id)).toEqual(['p1']);
  });

  it('throws an ApiError on failure', async () => {
    const { builder } = mockQuery({ data: null, error: { code: '42501', message: 'nope' } });
    mockFrom.mockReturnValue(builder);
    await expect(getSearchPromoted()).rejects.toMatchObject({ code: 'forbidden' });
  });
});

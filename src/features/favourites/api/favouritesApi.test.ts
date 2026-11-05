import { isApiError } from '@/lib/api/errors';
import { mockQuery } from '@/test/mockSupabase';

import { addFavourite, checkFavourite, getFavourites, removeFavourite } from './favouritesApi';

const mockFrom = jest.fn();

jest.mock('@/lib/supabase', () => ({
  supabase: {
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

const card = {
  id: 'branch-1',
  business_id: 'biz-1',
  business_name: 'Warsaw Barbers',
  branch_name: 'Mokotow',
  address: 'Putawska 1',
  city: 'Warsaw',
  country_code: 'PL',
  currency: 'PLN',
  description: null,
  phone: null,
  share_slug: null,
  amenities: [],
  latitude: 52.2,
  longitude: 21.0,
  logo_path: 'logos/wb.png',
  rating_avg: 4.8,
  rating_count: 30,
  category_slugs: ['barber'],
  is_open_now: true,
  timezone: 'Europe/Warsaw',
};

beforeEach(() => mockFrom.mockReset());

describe('getFavourites', () => {
  it('selects the embedded branch card and maps it through toStore', async () => {
    const { builder, calls } = mockQuery({
      data: [{ branch_id: 'branch-1', created_at: '2026-11-01T10:00:00Z', branch: card }],
      error: null,
    });
    mockFrom.mockReturnValue(builder);

    const favourites = await getFavourites();

    expect(mockFrom).toHaveBeenCalledWith('favourites');
    expect(calls).toContainEqual(['select', ['branch_id, created_at, branch:branch_cards(*)']]);
    expect(favourites).toHaveLength(1);
    expect(favourites[0]).toMatchObject({
      id: 'branch-1',
      store_id: 'branch-1',
      created_at: '2026-11-01T10:00:00Z',
      store: {
        id: 'branch-1',
        name: 'Warsaw Barbers – Mokotow',
        status: 'open',
        logo: 'https://cdn.test/public-media/logos/wb.png',
      },
    });
  });

  it('skips favourites whose branch is no longer visible', async () => {
    const { builder } = mockQuery({
      data: [{ branch_id: 'gone', created_at: '2026-11-01T10:00:00Z', branch: null }],
      error: null,
    });
    mockFrom.mockReturnValue(builder);
    expect(await getFavourites()).toEqual([]);
  });
});

describe('addFavourite', () => {
  it('inserts only the branch_id', async () => {
    const { builder, calls } = mockQuery({ data: null, error: null });
    mockFrom.mockReturnValue(builder);

    await addFavourite('branch-1');

    expect(mockFrom).toHaveBeenCalledWith('favourites');
    expect(calls).toContainEqual(['insert', [{ branch_id: 'branch-1' }]]);
  });

  it('treats an already-favourited branch as success', async () => {
    const { builder } = mockQuery({ data: null, error: { code: '23505', message: 'dup' } });
    mockFrom.mockReturnValue(builder);
    await expect(addFavourite('branch-1')).resolves.toBeUndefined();
  });

  it('throws other errors as ApiError', async () => {
    const { builder } = mockQuery({ data: null, error: { code: '42501', message: 'rls' } });
    mockFrom.mockReturnValue(builder);
    await expect(addFavourite('branch-1')).rejects.toMatchObject({ code: 'forbidden' });
  });
});

describe('removeFavourite', () => {
  it('deletes by branch_id and returns the deleted rows to verify', async () => {
    const { builder, calls } = mockQuery({ data: [{ branch_id: 'branch-1' }], error: null });
    mockFrom.mockReturnValue(builder);

    await removeFavourite('branch-1');

    expect(calls).toContainEqual(['delete', []]);
    expect(calls).toContainEqual(['eq', ['branch_id', 'branch-1']]);
    expect(calls.some(([m]) => m === 'select')).toBe(true);
  });

  it('throws forbidden when zero rows were deleted', async () => {
    const { builder } = mockQuery({ data: [], error: null });
    mockFrom.mockReturnValue(builder);

    const failure: unknown = await removeFavourite('branch-1').catch((e) => e);
    expect(isApiError(failure, 'forbidden')).toBe(true);
  });

  it('wraps postgrest errors', async () => {
    const { builder } = mockQuery({ data: null, error: { code: '42501', message: 'rls' } });
    mockFrom.mockReturnValue(builder);
    await expect(removeFavourite('branch-1')).rejects.toMatchObject({ code: 'forbidden' });
  });
});

describe('checkFavourite', () => {
  it('is true when a row exists', async () => {
    const { builder, calls } = mockQuery({ data: { branch_id: 'branch-1' }, error: null });
    mockFrom.mockReturnValue(builder);

    expect(await checkFavourite('branch-1')).toEqual({ is_favourite: true });
    expect(calls).toContainEqual(['select', ['branch_id']]);
    expect(calls).toContainEqual(['eq', ['branch_id', 'branch-1']]);
    expect(calls.some(([m]) => m === 'maybeSingle')).toBe(true);
  });

  it('is false when there is no row', async () => {
    const { builder } = mockQuery({ data: null, error: null });
    mockFrom.mockReturnValue(builder);
    expect(await checkFavourite('branch-1')).toEqual({ is_favourite: false });
  });
});

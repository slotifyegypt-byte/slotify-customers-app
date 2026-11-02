import { mockQuery } from '@/test/mockSupabase';

import { toService } from './mappers';
import {
  getStoreCalendar,
  getStoreGallery,
  getStoreReviews,
  getStoreReviewStats,
  getStoreSpecialDays,
  getStoreTeam,
} from './venueApi';

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

beforeEach(() => {
  mockRpc.mockReset();
  mockFrom.mockReset();
});

describe('getStoreCalendar', () => {
  it('groups rows by day_of_week, keeps split shifts in order, and returns all seven days', async () => {
    const { builder, calls } = mockQuery({
      data: [
        // Deliberately out of order: the afternoon shift arrives before the morning one.
        { day_of_week: 2, opens_at: '16:00:00', closes_at: '20:00:00' },
        { day_of_week: 1, opens_at: '10:00:00', closes_at: '18:00:00' },
        { day_of_week: 2, opens_at: '09:00:00', closes_at: '13:00:00' },
      ],
      error: null,
    });
    mockFrom.mockReturnValue(builder);

    const days = await getStoreCalendar('branch-1');

    expect(mockFrom).toHaveBeenCalledWith('branch_hours');
    expect(calls).toContainEqual(['select', ['day_of_week, opens_at, closes_at']]);
    expect(calls).toContainEqual(['eq', ['branch_id', 'branch-1']]);
    expect(days.map((d) => d.day_of_week)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(days[0].intervals).toEqual([{ opens_at: '10:00:00', closes_at: '18:00:00', crosses_midnight: false }]);
    expect(days[1].intervals).toEqual([
      { opens_at: '09:00:00', closes_at: '13:00:00', crosses_midnight: false },
      { opens_at: '16:00:00', closes_at: '20:00:00', crosses_midnight: false },
    ]);
  });

  it('flags a 22:00 -> 02:00 interval as crossing midnight', async () => {
    const { builder } = mockQuery({
      data: [{ day_of_week: 5, opens_at: '22:00:00', closes_at: '02:00:00' }],
      error: null,
    });
    mockFrom.mockReturnValue(builder);

    const days = await getStoreCalendar('branch-1');

    expect(days[4].intervals).toEqual([{ opens_at: '22:00:00', closes_at: '02:00:00', crosses_midnight: true }]);
  });

  it('returns empty intervals for a day with no rows (closed)', async () => {
    const { builder } = mockQuery({
      data: [{ day_of_week: 1, opens_at: '10:00:00', closes_at: '18:00:00' }],
      error: null,
    });
    mockFrom.mockReturnValue(builder);

    const days = await getStoreCalendar('branch-1');

    expect(days[6]).toEqual({ day_of_week: 7, intervals: [] });
  });

  it('throws an ApiError on failure', async () => {
    const { builder } = mockQuery({ data: null, error: { code: '42501', message: 'nope' } });
    mockFrom.mockReturnValue(builder);
    await expect(getStoreCalendar('branch-1')).rejects.toMatchObject({
      name: 'ApiError',
      code: 'forbidden',
    });
  });
});

describe('getStoreSpecialDays', () => {
  const rows = [
    { date: '2026-11-10', is_closed: true, opens_at: null, closes_at: null, reason: 'Holiday' },
    {
      date: '2026-11-12',
      is_closed: false,
      opens_at: '10:00:00',
      closes_at: '14:00:00',
      reason: null,
    },
  ];

  it('filters from the branch-local today when a timezone is given', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-11-02T23:30:00Z'));
    try {
      const { builder, calls } = mockQuery({ data: rows, error: null });
      mockFrom.mockReturnValue(builder);

      const days = await getStoreSpecialDays('branch-1', 'Africa/Cairo'); // already 2026-11-03 in Cairo

      expect(mockFrom).toHaveBeenCalledTimes(1);
      expect(mockFrom).toHaveBeenCalledWith('branch_special_days');
      expect(calls).toContainEqual(['eq', ['branch_id', 'branch-1']]);
      expect(calls).toContainEqual(['gte', ['date', '2026-11-03']]);
      expect(calls).toContainEqual(['order', ['date']]);
      expect(days).toEqual(rows);
    } finally {
      jest.useRealTimers();
    }
  });

  it('looks the timezone up from branch_cards when none is given', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-11-02T10:00:00Z'));
    try {
      const card = mockQuery({ data: { timezone: 'Europe/Warsaw' }, error: null });
      const special = mockQuery({ data: [], error: null });
      mockFrom.mockReturnValueOnce(card.builder).mockReturnValueOnce(special.builder);

      await getStoreSpecialDays('branch-1');

      expect(mockFrom).toHaveBeenNthCalledWith(1, 'branch_cards');
      expect(card.calls).toContainEqual(['select', ['timezone']]);
      expect(special.calls).toContainEqual(['gte', ['date', '2026-11-02']]);
    } finally {
      jest.useRealTimers();
    }
  });
});

describe('getStoreGallery', () => {
  it('orders by sort_order and builds public urls', async () => {
    const { builder, calls } = mockQuery({
      data: [
        { id: 'p1', image_path: 'branches/b1/photos/a.jpg', caption: null, sort_order: 0 },
        { id: 'p2', image_path: 'branches/b1/photos/b.jpg', caption: 'Front', sort_order: 1 },
      ],
      error: null,
    });
    mockFrom.mockReturnValue(builder);

    const photos = await getStoreGallery('b1');

    expect(mockFrom).toHaveBeenCalledWith('branch_photos');
    expect(calls).toContainEqual(['order', ['sort_order']]);
    expect(photos).toEqual([
      { id: 'p1', imageUrl: 'https://cdn.test/public-media/branches/b1/photos/a.jpg' },
      { id: 'p2', imageUrl: 'https://cdn.test/public-media/branches/b1/photos/b.jpg' },
    ]);
  });
});

describe('getStoreTeam', () => {
  it('maps get_branch_team rows to team members', async () => {
    mockRpc.mockResolvedValue({
      data: [
        {
          employee_id: 'e1',
          first_name: 'Sara',
          last_name: 'Adel',
          job_title: 'Colourist',
          avatar_path: 'employees/e1/a.jpg',
          bio: 'Ten years',
          service_ids: ['s1', 's2'],
        },
        {
          employee_id: 'e2',
          first_name: 'Omar',
          last_name: null,
          job_title: null,
          avatar_path: null,
          bio: null,
          service_ids: [],
        },
      ],
      error: null,
    });

    const team = await getStoreTeam('b1');

    expect(mockRpc).toHaveBeenCalledWith('get_branch_team', { p_branch_id: 'b1' });
    expect(team).toEqual([
      {
        id: 'e1',
        first_name: 'Sara',
        last_name: 'Adel',
        profile_picture: 'https://cdn.test/public-media/employees/e1/a.jpg',
        role_name: 'Colourist',
        bio: 'Ten years',
        service_ids: ['s1', 's2'],
      },
      {
        id: 'e2',
        first_name: 'Omar',
        last_name: null,
        profile_picture: null,
        role_name: null,
        bio: null,
        service_ids: [],
      },
    ]);
  });
});

describe('toService', () => {
  const service = {
    id: 's1',
    name: 'Haircut',
    description: 'Cut',
    image_path: 'services/s1/a.jpg',
    duration_minutes: 45,
    buffer_minutes: 15,
    booking_mode: 'specialist' as const,
    capacity: null,
    price: 300,
    sort_order: 0,
    archived_at: null,
    category: { id: 'c1', name: 'Hair', sort_order: 1 },
  };

  it('prefers the branch price over the service price', () => {
    const result = toService({ price: 250, is_active: true, service }, 'EGP');
    expect(result).toMatchObject({ id: 's1', price: 250, currency: 'EGP' });
  });

  it('treats a branch price of 0 as a valid override', () => {
    expect(toService({ price: 0, is_active: true, service }, 'EGP')?.price).toBe(0);
  });

  it('falls back to the service price when the branch has no override', () => {
    expect(toService({ price: null, is_active: true, service }, 'EGP')?.price).toBe(300);
  });

  it('maps specialist mode and the image url', () => {
    expect(toService({ price: null, is_active: true, service }, 'EGP')).toEqual({
      id: 's1',
      name: 'Haircut',
      description: 'Cut',
      image: 'https://cdn.test/public-media/services/s1/a.jpg',
      duration_minutes: 45,
      buffer_minutes: 15,
      price: 300,
      currency: 'EGP',
      requires_specialist: true,
      max_concurrent_bookings: null,
      category: { id: 'c1', name: 'Hair', sort_order: 1 },
    });
  });

  it('maps capacity mode to requires_specialist=false with max_concurrent_bookings from capacity', () => {
    const result = toService(
      {
        price: null,
        is_active: true,
        service: { ...service, booking_mode: 'capacity', capacity: 4, category: null },
      },
      'PLN',
    );
    expect(result).toMatchObject({
      requires_specialist: false,
      max_concurrent_bookings: 4,
      category: null,
      currency: 'PLN',
    });
  });

  it('drops archived services, inactive branch services and orphaned rows', () => {
    expect(
      toService(
        {
          price: null,
          is_active: true,
          service: { ...service, archived_at: '2026-10-01T00:00:00Z' },
        },
        'EGP',
      ),
    ).toBeNull();
    expect(toService({ price: null, is_active: false, service }, 'EGP')).toBeNull();
    expect(toService({ price: null, is_active: true, service: null }, 'EGP')).toBeNull();
  });
});

describe('getStoreReviews', () => {
  it('pages newest first and maps to the view model', async () => {
    const { builder, calls } = mockQuery({
      data: [
        {
          id: 'r1',
          rating: 5,
          comment: 'Great',
          reply: 'Thanks',
          replied_at: '2026-10-02T10:00:00Z',
          reviewer_name: 'Mona',
          created_at: '2026-10-01T10:00:00Z',
        },
        {
          id: 'r2',
          rating: 3,
          comment: null,
          reply: null,
          replied_at: null,
          reviewer_name: null,
          created_at: '2026-09-01T10:00:00Z',
        },
      ],
      error: null,
    });
    mockFrom.mockReturnValue(builder);

    const reviews = await getStoreReviews('b1', { limit: 20, offset: 40 });

    expect(mockFrom).toHaveBeenCalledWith('reviews');
    expect(calls).toContainEqual(['eq', ['branch_id', 'b1']]);
    expect(calls).toContainEqual(['order', ['created_at', { ascending: false }]]);
    expect(calls).toContainEqual(['range', [40, 59]]);
    expect(reviews).toEqual([
      {
        id: 'r1',
        rating: 5,
        comment: 'Great',
        customer_name: 'Mona',
        owner_reply: 'Thanks',
        owner_reply_at: '2026-10-02T10:00:00Z',
        created_at: '2026-10-01T10:00:00Z',
      },
      {
        id: 'r2',
        rating: 3,
        comment: null,
        customer_name: null,
        owner_reply: null,
        owner_reply_at: null,
        created_at: '2026-09-01T10:00:00Z',
      },
    ]);
  });
});

describe('getStoreReviewStats', () => {
  it('calls get_review_stats once with the branch id and maps the single row', async () => {
    const { builder, calls } = mockQuery({
      data: {
        average_rating: 4.17,
        total_reviews: 15,
        rating_distribution: { '1': 0, '2': 1, '3': 2, '4': 5, '5': 7 },
      },
      error: null,
    });
    mockRpc.mockReturnValue(builder);

    const stats = await getStoreReviewStats('b1');

    expect(mockRpc).toHaveBeenCalledTimes(1);
    expect(mockRpc).toHaveBeenCalledWith('get_review_stats', { p_branch_id: 'b1' });
    expect(calls.some(([method]) => method === 'single')).toBe(true);
    expect(mockFrom).not.toHaveBeenCalled();
    expect(stats).toEqual({
      average_rating: 4.17,
      total_reviews: 15,
      rating_distribution: { '1': 0, '2': 1, '3': 2, '4': 5, '5': 7 },
    });
  });

  it('zero-fills missing distribution keys and ignores non-numeric values', async () => {
    const { builder } = mockQuery({
      data: { average_rating: 0, total_reviews: 0, rating_distribution: { '5': 3, '2': 'x' } },
      error: null,
    });
    mockRpc.mockReturnValue(builder);

    const stats = await getStoreReviewStats('b1');

    expect(stats.rating_distribution).toEqual({ '1': 0, '2': 0, '3': 0, '4': 0, '5': 3 });
  });

  it('copes with a null or malformed distribution', async () => {
    const { builder } = mockQuery({
      data: { average_rating: 0, total_reviews: 0, rating_distribution: null },
      error: null,
    });
    mockRpc.mockReturnValue(builder);

    const stats = await getStoreReviewStats('b1');

    expect(stats.rating_distribution).toEqual({ '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 });
  });

  it('maps PT404 branch_not_found to an ApiError', async () => {
    const { builder } = mockQuery({
      data: null,
      error: { code: 'PT404', message: 'branch_not_found' },
    });
    mockRpc.mockReturnValue(builder);

    await expect(getStoreReviewStats('nope')).rejects.toMatchObject({
      name: 'ApiError',
      code: 'branch_not_found',
      status: 404,
    });
  });
});

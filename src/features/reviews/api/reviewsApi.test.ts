import { isApiError } from '@/lib/api/errors';
import { mockQuery } from '@/test/mockSupabase';

import { createReview, deleteReview, getCustomerReviews, updateReview } from './reviewsApi';

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

beforeEach(() => {
  mockFrom.mockReset();
});

const reviewRow = {
  id: 'r1',
  rating: 4,
  comment: 'Great',
  reply: null,
  replied_at: null,
  reviewer_name: 'Lina',
  created_at: '2026-11-01T10:00:00Z',
};

const branchRow = {
  id: 'b1',
  business_id: 'biz1',
  business_name: 'Acme',
  branch_name: 'Downtown',
  description: null,
  category_slugs: [],
  logo_path: null,
  address: '1 Main St',
  latitude: null,
  longitude: null,
  phone: null,
  rating_avg: 4.5,
  rating_count: 10,
  share_slug: null,
  timezone: 'Africa/Cairo',
  is_open_now: true,
  amenities: [],
  currency: 'EGP',
};

describe('createReview', () => {
  it('inserts only booking_id, rating and comment (branch/customer are set by the server) and maps the row', async () => {
    const { builder, calls } = mockQuery({ data: reviewRow, error: null });
    mockFrom.mockReturnValue(builder);

    const review = await createReview({ booking_id: 'bk1', rating: 4, comment: 'Great' });

    expect(mockFrom).toHaveBeenCalledWith('reviews');
    expect(calls).toContainEqual(['insert', [{ booking_id: 'bk1', rating: 4, comment: 'Great' }]]);
    expect(review).toEqual({
      id: 'r1',
      rating: 4,
      comment: 'Great',
      customer_name: 'Lina',
      owner_reply: null,
      owner_reply_at: null,
      created_at: '2026-11-01T10:00:00Z',
    });
  });

  it('omits the comment key when none is given', async () => {
    const { builder, calls } = mockQuery({ data: reviewRow, error: null });
    mockFrom.mockReturnValue(builder);

    await createReview({ booking_id: 'bk1', rating: 5 });

    expect(calls).toContainEqual(['insert', [{ booking_id: 'bk1', rating: 5 }]]);
  });

  it('turns a unique violation into ApiError duplicate', async () => {
    const { builder } = mockQuery({
      data: null,
      error: { code: '23505', message: 'reviews_booking_id_key' },
    });
    mockFrom.mockReturnValue(builder);

    const error = await createReview({ booking_id: 'bk1', rating: 4 }).catch((e) => e);
    expect(isApiError(error, 'duplicate')).toBe(true);
    expect(error.status).toBe(409);
  });

  it('turns an RLS refusal (booking not completed / not yours) into ApiError forbidden', async () => {
    const { builder } = mockQuery({
      data: null,
      error: { code: '42501', message: 'new row violates RLS' },
    });
    mockFrom.mockReturnValue(builder);

    const error = await createReview({ booking_id: 'bk1', rating: 4 }).catch((e) => e);
    expect(isApiError(error, 'forbidden')).toBe(true);
    expect(error.status).toBe(403);
  });
});

describe('updateReview', () => {
  it('updates only the given fields, scoped by id, and returns the mapped row', async () => {
    const { builder, calls } = mockQuery({ data: [{ ...reviewRow, rating: 2 }], error: null });
    mockFrom.mockReturnValue(builder);

    const review = await updateReview('r1', { rating: 2 });

    expect(mockFrom).toHaveBeenCalledWith('reviews');
    expect(calls).toContainEqual(['update', [{ rating: 2 }]]);
    expect(calls).toContainEqual(['eq', ['id', 'r1']]);
    expect(review.rating).toBe(2);
    expect(review.id).toBe('r1');
  });

  it('throws forbidden when no row was updated (RLS filtered it out)', async () => {
    const { builder } = mockQuery({ data: [], error: null });
    mockFrom.mockReturnValue(builder);

    const error = await updateReview('r1', { rating: 2 }).catch((e) => e);
    expect(isApiError(error, 'forbidden')).toBe(true);
    expect(error.status).toBe(403);
  });

  it('maps a Postgres error through fromPostgrest', async () => {
    const { builder } = mockQuery({
      data: null,
      error: { code: '23514', message: 'rating check' },
    });
    mockFrom.mockReturnValue(builder);

    const error = await updateReview('r1', { rating: 9 }).catch((e) => e);
    expect(isApiError(error, 'invalid_field')).toBe(true);
  });
});

describe('deleteReview', () => {
  it('deletes by id and resolves when a row was removed', async () => {
    const { builder, calls } = mockQuery({ data: [{ id: 'r1' }], error: null });
    mockFrom.mockReturnValue(builder);

    await expect(deleteReview('r1')).resolves.toBeUndefined();
    expect(calls).toContainEqual(['delete', []]);
    expect(calls).toContainEqual(['eq', ['id', 'r1']]);
  });

  it('throws forbidden when no row was deleted', async () => {
    const { builder } = mockQuery({ data: [], error: null });
    mockFrom.mockReturnValue(builder);

    const error = await deleteReview('r1').catch((e) => e);
    expect(isApiError(error, 'forbidden')).toBe(true);
    expect(error.status).toBe(403);
  });
});

describe('getCustomerReviews', () => {
  // `reviews.customer_id` is not selectable by `authenticated`, so reviews are
  // read through the customer's own bookings (embedded) — never filtered on it.
  const mine = { ...reviewRow, branch_id: 'b1', booking_id: 'bk1' };

  function setup(bookingRows: unknown[], cardRows: unknown[] = [branchRow]) {
    const bookings = mockQuery({ data: bookingRows, error: null });
    const branches = mockQuery({ data: cardRows, error: null });
    mockFrom.mockImplementation((table: string) =>
      table === 'bookings' ? bookings.builder : branches.builder,
    );
    return { bookings, branches };
  }

  it('reads through the customer bookings, never filtering reviews on customer_id, and names each review from its branch card', async () => {
    const { bookings, branches } = setup([{ id: 'bk1', reviews: [mine] }]);

    const result = await getCustomerReviews('cust1');

    expect(mockFrom).not.toHaveBeenCalledWith('reviews');
    expect(mockFrom).toHaveBeenCalledWith('bookings');
    expect(bookings.calls).toContainEqual(['eq', ['customer_id', 'cust1']]);
    const select = bookings.calls.find(([method]) => method === 'select')?.[1][0] as string;
    expect(select).toContain('reviews!reviews_booking_id_branch_id_fkey!inner(');
    expect(select).not.toMatch(/customer_id|\*/);
    expect(mockFrom).toHaveBeenCalledWith('branch_cards');
    expect(branches.calls).toContainEqual(['in', ['id', ['b1']]]);
    expect(result).toEqual([
      {
        id: 'r1',
        rating: 4,
        comment: 'Great',
        customer_name: 'Lina',
        owner_reply: null,
        owner_reply_at: null,
        created_at: '2026-11-01T10:00:00Z',
        store_id: 'b1',
        booking_id: 'bk1',
        store_name: 'Acme – Downtown',
        timezone: 'Africa/Cairo',
      },
    ]);
  });

  it('returns reviews newest first across bookings and ignores bookings without one', async () => {
    const older = { ...mine, id: 'r0', booking_id: 'bk0', created_at: '2026-10-01T10:00:00Z' };
    setup([
      { id: 'bk0', reviews: [older] },
      { id: 'bk2', reviews: [] },
      { id: 'bk1', reviews: [mine] },
    ]);

    const result = await getCustomerReviews('cust1');

    expect(result.map((r) => r.id)).toEqual(['r1', 'r0']);
  });

  it('keeps a review whose branch is no longer readable, with a null store_name', async () => {
    setup([
      { id: 'bk1', reviews: [mine] },
      {
        id: 'bk2',
        reviews: [
          {
            ...mine,
            id: 'r2',
            branch_id: 'gone',
            booking_id: 'bk2',
            created_at: '2026-10-01T10:00:00Z',
          },
        ],
      },
    ]);

    const result = await getCustomerReviews('cust1');

    expect(result.map((r) => [r.id, r.store_name, r.timezone])).toEqual([
      ['r1', 'Acme – Downtown', 'Africa/Cairo'],
      ['r2', null, null],
    ]);
  });

  it('skips the branch lookup when there are no reviews', async () => {
    setup([{ id: 'bk1', reviews: [] }]);

    await expect(getCustomerReviews('cust1')).resolves.toEqual([]);
    expect(mockFrom).toHaveBeenCalledTimes(1);
  });

  it('maps a Postgres error through fromPostgrest', async () => {
    const bookings = mockQuery({ data: null, error: { code: '42501', message: 'denied' } });
    mockFrom.mockReturnValue(bookings.builder);

    const error = await getCustomerReviews('cust1').catch((e) => e);
    expect(isApiError(error, 'forbidden')).toBe(true);
  });
});

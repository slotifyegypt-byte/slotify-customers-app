import { isApiError } from '@/lib/api/errors';
import { mockQuery } from '@/test/mockSupabase';

import { deleteMe, getMe, isE164, updateMe } from './profileApi';

const mockFrom = jest.fn();
const mockGetSession = jest.fn();
const mockCallFunction = jest.fn();
const mockTakePending = jest.fn();

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: (...args: unknown[]) => mockFrom(...args),
    auth: { getSession: () => mockGetSession() },
    storage: {
      from: (bucket: string) => ({
        getPublicUrl: (path: string) => ({
          data: { publicUrl: `https://cdn.test/${bucket}/${path}` },
        }),
      }),
    },
  },
}));
jest.mock('@/lib/api/functions', () => ({
  callFunction: (...args: unknown[]) => mockCallFunction(...args),
}));
jest.mock('@/features/auth/pendingProfile', () => ({
  takePendingProfileName: () => mockTakePending(),
}));

const row = {
  id: 'c1',
  user_id: 'u1',
  first_name: 'Lina',
  last_name: 'Hassan',
  gender: 'female',
  date_of_birth: '1995-04-02',
  email: 'lina@slotify.dev',
  phone: '+201001234567',
  avatar_path: 'u1/me.jpg',
  country_code: 'EG',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  created_by_branch_id: null,
};

const sessionWith = (user: Record<string, unknown>) => ({ data: { session: { user } } });

beforeEach(() => {
  mockFrom.mockReset();
  mockGetSession.mockReset();
  mockCallFunction.mockReset();
  mockTakePending.mockReset();
  mockTakePending.mockReturnValue(null);
  mockGetSession.mockResolvedValue(sessionWith({ id: 'u1', email: 'lina@slotify.dev' }));
});

describe('getMe', () => {
  it('returns the mapped row when the customer exists', async () => {
    const { builder } = mockQuery({ data: row, error: null });
    mockFrom.mockReturnValue(builder);

    await expect(getMe()).resolves.toEqual({
      id: 'c1',
      first_name: 'Lina',
      last_name: 'Hassan',
      gender: 'female',
      date_of_birth: '1995-04-02',
      email: 'lina@slotify.dev',
      phone: '+201001234567',
      avatar_url: 'https://cdn.test/avatars/u1/me.jpg',
    });
    expect(mockFrom).toHaveBeenCalledWith('customers');
  });

  it('maps a missing avatar_path to a null avatar_url', async () => {
    mockFrom.mockReturnValue(mockQuery({ data: { ...row, avatar_path: null }, error: null }).builder);
    await expect(getMe()).resolves.toMatchObject({ avatar_url: null });
  });

  it('inserts the name from the OAuth metadata when there is no row, and returns it', async () => {
    mockGetSession.mockResolvedValue(
      sessionWith({
        id: 'u1',
        email: 'lina@slotify.dev',
        user_metadata: { given_name: 'Lina', family_name: 'Hassan', picture: 'https://g.test/p.jpg' },
      }),
    );
    const select = mockQuery({ data: null, error: null });
    const insert = mockQuery({ data: row, error: null });
    mockFrom.mockReturnValueOnce(select.builder).mockReturnValueOnce(insert.builder);

    const me = await getMe();

    expect(me.id).toBe('c1');
    expect(insert.calls).toContainEqual(['insert', [{ first_name: 'Lina', last_name: 'Hassan' }]]);
  });

  it('prefers the pending (Apple) name over metadata, then full_name, then the email local part', async () => {
    const insertWith = async (user: Record<string, unknown>, pending: unknown) => {
      mockTakePending.mockReturnValue(pending);
      mockGetSession.mockResolvedValue(sessionWith(user));
      const insert = mockQuery({ data: row, error: null });
      mockFrom
        .mockReturnValueOnce(mockQuery({ data: null, error: null }).builder)
        .mockReturnValueOnce(insert.builder);
      await getMe();
      return insert.calls.find(([m]) => m === 'insert')![1][0];
    };

    expect(
      await insertWith(
        { id: 'u1', email: 'a@b.c', user_metadata: { given_name: 'Meta', family_name: 'Name' } },
        { first_name: 'Apple', last_name: 'User' },
      ),
    ).toEqual({ first_name: 'Apple', last_name: 'User' });

    expect(
      await insertWith({ id: 'u1', email: 'a@b.c', user_metadata: { full_name: 'Sara Ali Khan' } }, null),
    ).toEqual({ first_name: 'Sara', last_name: 'Ali Khan' });

    expect(await insertWith({ id: 'u1', email: 'omar@b.c' }, null)).toEqual({
      first_name: 'omar',
      last_name: undefined,
    });

    expect(await insertWith({ id: 'u1' }, null)).toEqual({ first_name: 'Guest', last_name: undefined });
  });

  it('refetches and returns the winner when the insert loses a race (23505)', async () => {
    const select = mockQuery({ data: null, error: null });
    const insert = mockQuery({
      data: null,
      error: { code: '23505', message: 'duplicate key value violates unique constraint' },
    });
    const refetch = mockQuery({ data: row, error: null });
    mockFrom
      .mockReturnValueOnce(select.builder)
      .mockReturnValueOnce(insert.builder)
      .mockReturnValueOnce(refetch.builder);

    await expect(getMe()).resolves.toMatchObject({ id: 'c1' });
    expect(mockFrom).toHaveBeenCalledTimes(3);
  });

  it('throws an ApiError when the insert fails for another reason', async () => {
    mockFrom
      .mockReturnValueOnce(mockQuery({ data: null, error: null }).builder)
      .mockReturnValueOnce(
        mockQuery({ data: null, error: { code: '42501', message: 'rls' } }).builder,
      );
    const failure: unknown = await getMe().catch((e) => e);
    expect(isApiError(failure, 'forbidden')).toBe(true);
  });

  it('throws an ApiError when the select fails', async () => {
    mockFrom.mockReturnValue(mockQuery({ data: null, error: { code: 'XX000', message: 'boom' } }).builder);
    const failure: unknown = await getMe().catch((e) => e);
    expect(isApiError(failure, 'unknown')).toBe(true);
  });
});

describe('updateMe', () => {
  it('updates the caller row and returns the mapped result', async () => {
    const q = mockQuery({ data: [{ ...row, first_name: 'Layla' }], error: null });
    mockFrom.mockReturnValue(q.builder);

    const me = await updateMe({ first_name: 'Layla', phone: null });

    expect(me.first_name).toBe('Layla');
    expect(q.calls).toContainEqual(['update', [{ first_name: 'Layla', phone: null }]]);
    expect(q.calls).toContainEqual(['eq', ['user_id', 'u1']]);
  });

  it('throws ApiError(forbidden) when the update touches zero rows', async () => {
    mockFrom.mockReturnValue(mockQuery({ data: [], error: null }).builder);
    const failure: unknown = await updateMe({ first_name: 'X' }).catch((e) => e);
    expect(isApiError(failure, 'forbidden')).toBe(true);
  });

  it('rejects a non-E.164 phone with invalid_field before any request', async () => {
    const failure: unknown = await updateMe({ phone: '0100' }).catch((e) => e);
    expect(isApiError(failure, 'invalid_field')).toBe(true);
    expect(mockFrom).not.toHaveBeenCalled();
    expect(mockGetSession).not.toHaveBeenCalled();
  });

  it('maps a check-constraint failure to invalid_field', async () => {
    mockFrom.mockReturnValue(mockQuery({ data: null, error: { code: '23514', message: 'check' } }).builder);
    const failure: unknown = await updateMe({ first_name: 'X' }).catch((e) => e);
    expect(isApiError(failure, 'invalid_field')).toBe(true);
  });

  it('throws not_signed_in without a session', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });
    const failure: unknown = await updateMe({ first_name: 'X' }).catch((e) => e);
    expect(isApiError(failure, 'not_signed_in')).toBe(true);
  });
});

describe('deleteMe', () => {
  it('calls DELETE account/me', async () => {
    mockCallFunction.mockResolvedValue({ deleted: true, login_deleted: false });
    await expect(deleteMe()).resolves.toBeUndefined();
    expect(mockCallFunction).toHaveBeenCalledWith('account/me', { method: 'DELETE' });
  });
});

describe('isE164', () => {
  it.each([
    ['+201001234567', true],
    ['+14155552671', true],
    ['+1234567', true],
    ['+123456789012345', true],
    ['0100', false],
    ['01001234567', false],
    ['+0123456789', false],
    ['+12345', false],
    ['+1234567890123456', false],
    ['+20 100 123 4567', false],
    ['+20100abc4567', false],
    ['', false],
  ])('isE164(%j) is %s', (value, expected) => {
    expect(isE164(value)).toBe(expected);
  });
});

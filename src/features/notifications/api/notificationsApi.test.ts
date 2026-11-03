import { mockQuery } from '@/test/mockSupabase';

import { toNotification, type NotificationRow } from './mappers';
import {
  deleteNotification,
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
} from './notificationsApi';

const mockFrom = jest.fn();

jest.mock('@/lib/supabase', () => ({
  supabase: { from: (...args: unknown[]) => mockFrom(...args) },
}));

beforeEach(() => mockFrom.mockReset());

const row = (overrides: Partial<NotificationRow> = {}): NotificationRow => ({
  id: 'n1',
  type: 'booking_confirmed',
  title: 'Booking confirmed',
  body: 'See you soon',
  data: { booking_id: 'bk1', branch_id: 'br1' },
  read_at: null,
  created_at: '2026-11-01T10:00:00Z',
  ...overrides,
});

describe('toNotification', () => {
  it('maps body to message and pulls the ids out of data', () => {
    expect(toNotification(row())).toEqual({
      id: 'n1',
      title: 'Booking confirmed',
      message: 'See you soon',
      notification_type: 'booking_confirmed',
      store_id: 'br1',
      booking_id: 'bk1',
      is_read: false,
      created_at: '2026-11-01T10:00:00Z',
    });
  });

  it('tolerates data: null, a null body and non-string ids', () => {
    expect(toNotification(row({ data: null as never, body: null }))).toMatchObject({
      message: '',
      store_id: null,
      booking_id: null,
    });
    expect(toNotification(row({ data: { booking_id: 42, branch_id: { x: 1 } } }))).toMatchObject({
      store_id: null,
      booking_id: null,
    });
    expect(toNotification(row({ data: [] as never }))).toMatchObject({
      store_id: null,
      booking_id: null,
    });
  });

  it('is_read follows read_at', () => {
    expect(toNotification(row({ read_at: '2026-11-01T11:00:00Z' })).is_read).toBe(true);
    expect(toNotification(row({ read_at: null })).is_read).toBe(false);
  });
});

describe('getNotifications', () => {
  it('lists newest first, mapped, with a default page size', async () => {
    const { builder, calls } = mockQuery({ data: [row({ id: 'n2' }), row()] });
    mockFrom.mockReturnValue(builder);

    const result = await getNotifications();

    expect(mockFrom).toHaveBeenCalledWith('notifications');
    expect(calls).toContainEqual(['order', ['created_at', { ascending: false }]]);
    expect(calls).toContainEqual(['limit', [50]]);
    expect(calls.some(([m]) => m === 'is')).toBe(false);
    expect(result.map((n) => n.id)).toEqual(['n2', 'n1']);
  });

  it('only selects granted columns (never customer_id/employee_id filters)', async () => {
    const { builder, calls } = mockQuery({ data: [] });
    mockFrom.mockReturnValue(builder);
    await getNotifications();
    const select = calls.find(([m]) => m === 'select');
    expect(select?.[1][0]).toBe('id, type, title, body, data, read_at, created_at');
  });

  it('maps is_read to a read_at filter and honours limit', async () => {
    const unread = mockQuery({ data: [] });
    mockFrom.mockReturnValue(unread.builder);
    await getNotifications({ is_read: false, limit: 5 });
    expect(unread.calls).toContainEqual(['is', ['read_at', null]]);
    expect(unread.calls).toContainEqual(['limit', [5]]);

    const read = mockQuery({ data: [] });
    mockFrom.mockReturnValue(read.builder);
    await getNotifications({ is_read: true });
    expect(read.calls).toContainEqual(['not', ['read_at', 'is', null]]);
  });

  it('turns a Postgres error into an ApiError', async () => {
    const { builder } = mockQuery({ error: { code: '42501', message: 'denied' } });
    mockFrom.mockReturnValue(builder);
    await expect(getNotifications()).rejects.toMatchObject({ code: 'forbidden' });
  });
});

describe('getUnreadNotificationCount', () => {
  it('uses a head count of rows with read_at null', async () => {
    const { builder, calls } = mockQuery({ count: 3, data: null });
    mockFrom.mockReturnValue(builder);

    await expect(getUnreadNotificationCount()).resolves.toEqual({ unread_count: 3 });

    expect(mockFrom).toHaveBeenCalledWith('notifications');
    expect(calls).toContainEqual(['select', ['id', { count: 'exact', head: true }]]);
    expect(calls).toContainEqual(['is', ['read_at', null]]);
  });

  it('treats a missing count as zero', async () => {
    const { builder } = mockQuery({ data: null });
    mockFrom.mockReturnValue(builder);
    await expect(getUnreadNotificationCount()).resolves.toEqual({ unread_count: 0 });
  });

  it('throws on error', async () => {
    const { builder } = mockQuery({ error: { code: 'x', message: 'boom' } });
    mockFrom.mockReturnValue(builder);
    await expect(getUnreadNotificationCount()).rejects.toMatchObject({ code: 'unknown' });
  });
});

describe('markNotificationRead', () => {
  it('sets read_at on that row (and checks a row was touched)', async () => {
    const { builder, calls } = mockQuery({ data: [{ id: 'n1' }] });
    mockFrom.mockReturnValue(builder);

    await markNotificationRead('n1');

    const update = calls.find(([m]) => m === 'update');
    expect(update?.[1][0]).toEqual({ read_at: expect.any(String) });
    expect(calls).toContainEqual(['eq', ['id', 'n1']]);
    expect(calls).toContainEqual(['select', ['id']]);
  });

  it('throws forbidden when no row was updated', async () => {
    const { builder } = mockQuery({ data: [] });
    mockFrom.mockReturnValue(builder);
    await expect(markNotificationRead('n1')).rejects.toMatchObject({ code: 'forbidden' });
  });
});

describe('markAllNotificationsRead', () => {
  it('updates read_at only on rows where it is null', async () => {
    const { builder, calls } = mockQuery({ data: null });
    mockFrom.mockReturnValue(builder);

    await markAllNotificationsRead();

    const update = calls.find(([m]) => m === 'update');
    expect(update?.[1][0]).toEqual({ read_at: expect.any(String) });
    expect(calls).toContainEqual(['is', ['read_at', null]]);
  });

  it('throws on error', async () => {
    const { builder } = mockQuery({ error: { code: '42501', message: 'denied' } });
    mockFrom.mockReturnValue(builder);
    await expect(markAllNotificationsRead()).rejects.toMatchObject({ code: 'forbidden' });
  });
});

describe('deleteNotification', () => {
  it('deletes the row and checks it was removed', async () => {
    const { builder, calls } = mockQuery({ data: [{ id: 'n1' }] });
    mockFrom.mockReturnValue(builder);
    await deleteNotification('n1');
    expect(calls).toContainEqual(['delete', []]);
    expect(calls).toContainEqual(['eq', ['id', 'n1']]);
    expect(calls).toContainEqual(['select', ['id']]);
  });

  it('throws forbidden when nothing was deleted', async () => {
    const { builder } = mockQuery({ data: [] });
    mockFrom.mockReturnValue(builder);
    await expect(deleteNotification('n1')).rejects.toMatchObject({ code: 'forbidden' });
  });
});

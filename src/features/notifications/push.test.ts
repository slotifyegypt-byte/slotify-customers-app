import { renderHook } from '@testing-library/react-native';
import { Platform } from 'react-native';

import { mockQuery } from '@/test/mockSupabase';

import {
  registerForPush,
  routeForNotificationData,
  unregisterPush,
  useNotificationResponseRouting,
} from './push';

const mockGetPermissions = jest.fn();
const mockRequestPermissions = jest.fn();
const mockGetToken = jest.fn();
const mockSetHandler = jest.fn();
const mockRemove = jest.fn();
const mockAddListener = jest.fn();
const mockGetLastResponse = jest.fn();
const mockRpc = jest.fn();
const mockFrom = jest.fn();
const mockPush = jest.fn();
const mockBreadcrumb = jest.fn();
let mockProjectId: string | undefined = 'proj-123';

jest.mock('expo-notifications', () => ({
  getPermissionsAsync: (...a: unknown[]) => mockGetPermissions(...a),
  requestPermissionsAsync: (...a: unknown[]) => mockRequestPermissions(...a),
  getExpoPushTokenAsync: (...a: unknown[]) => mockGetToken(...a),
  setNotificationHandler: (...a: unknown[]) => mockSetHandler(...a),
  addNotificationResponseReceivedListener: (...a: unknown[]) => mockAddListener(...a),
  getLastNotificationResponse: (...a: unknown[]) => mockGetLastResponse(...a),
}));
jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    get expoConfig() {
      return { extra: { eas: { projectId: mockProjectId } } };
    },
  },
}));
jest.mock('expo-router', () => ({ router: { push: (...a: unknown[]) => mockPush(...a) } }));
jest.mock('@/lib/supabase', () => ({
  supabase: { rpc: (...a: unknown[]) => mockRpc(...a), from: (...a: unknown[]) => mockFrom(...a) },
}));
jest.mock('@/lib/sentry', () => ({
  Sentry: { addBreadcrumb: (...a: unknown[]) => mockBreadcrumb(...a) },
}));

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  mockProjectId = 'proj-123';
  (Platform as { OS: string }).OS = 'ios';
  mockGetPermissions.mockResolvedValue({ status: 'granted' });
  mockRequestPermissions.mockResolvedValue({ status: 'granted' });
  mockGetToken.mockResolvedValue({ data: 'ExponentPushToken[abc]' });
  mockRpc.mockResolvedValue({ data: null, error: null });
  mockAddListener.mockReturnValue({ remove: mockRemove });
  mockGetLastResponse.mockReturnValue(null);
});

describe('registerForPush', () => {
  it('registers the Expo token for the customer app', async () => {
    await registerForPush();

    expect(mockGetToken).toHaveBeenCalledWith({ projectId: 'proj-123' });
    expect(mockRpc).toHaveBeenCalledWith('register_push_token', {
      p_token: 'ExponentPushToken[abc]',
      p_platform: 'ios',
      p_app: 'customer',
    });
  });

  it.each([
    ['ios', 'ios'],
    ['android', 'android'],
    ['web', 'web'],
    ['windows', 'web'],
  ])('maps Platform.OS %s to %s', async (os, expected) => {
    (Platform as { OS: string }).OS = os;
    await registerForPush();
    expect(mockRpc).toHaveBeenCalledWith(
      'register_push_token',
      expect.objectContaining({ p_platform: expected }),
    );
  });

  it('asks for permission only when not already granted', async () => {
    await registerForPush();
    expect(mockRequestPermissions).not.toHaveBeenCalled();

    mockGetPermissions.mockResolvedValue({ status: 'undetermined' });
    await registerForPush();
    expect(mockRequestPermissions).toHaveBeenCalledTimes(1);
  });

  it('does nothing (and does not throw) when permission is denied', async () => {
    mockGetPermissions.mockResolvedValue({ status: 'undetermined' });
    mockRequestPermissions.mockResolvedValue({ status: 'denied' });
    await expect(registerForPush()).resolves.toBeUndefined();
    expect(mockGetToken).not.toHaveBeenCalled();
    expect(mockRpc).not.toHaveBeenCalled();
  });

  it('swallows a token failure (simulator) and leaves a breadcrumb', async () => {
    mockGetToken.mockRejectedValue(new Error('Must use physical device'));
    await expect(registerForPush()).resolves.toBeUndefined();
    expect(mockRpc).not.toHaveBeenCalled();
    expect(mockBreadcrumb).toHaveBeenCalled();
  });

  it('swallows a missing projectId', async () => {
    mockProjectId = undefined;
    await expect(registerForPush()).resolves.toBeUndefined();
    expect(mockGetToken).not.toHaveBeenCalled();
    expect(mockRpc).not.toHaveBeenCalled();
  });

  it('swallows an rpc error result and a rejected rpc', async () => {
    mockRpc.mockResolvedValueOnce({ data: null, error: { code: 'x', message: 'nope' } });
    await expect(registerForPush()).resolves.toBeUndefined();
    mockRpc.mockRejectedValueOnce(new Error('network'));
    await expect(registerForPush()).resolves.toBeUndefined();
  });
});

const BOOKING = '3f2b8c1e-5d4a-4e6f-9a7b-1c2d3e4f5a6b';
const BRANCH = '9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d';

describe('routeForNotificationData', () => {
  it('prefers the booking, then the venue, else nothing', () => {
    expect(routeForNotificationData({ booking_id: BOOKING, branch_id: BRANCH })).toBe(
      `/(tabs)/activity/${BOOKING}`,
    );
    expect(routeForNotificationData({ branch_id: BRANCH })).toBe(`/venue/${BRANCH}`);
    expect(routeForNotificationData({})).toBeNull();
    expect(routeForNotificationData(null)).toBeNull();
    expect(routeForNotificationData({ booking_id: 5 })).toBeNull();
  });

  it('accepts upper-case ids', () => {
    expect(routeForNotificationData({ booking_id: BOOKING.toUpperCase() })).toBe(
      `/(tabs)/activity/${BOOKING.toUpperCase()}`,
    );
  });

  it('refuses ids that are not UUIDs, so a crafted payload cannot steer navigation', () => {
    for (const hostile of [
      'bk1',
      '../profile',
      '../../sign-in',
      `${BOOKING}/../x`,
      `${BOOKING}?x=1`,
      '',
    ]) {
      expect(routeForNotificationData({ booking_id: hostile })).toBeNull();
      expect(routeForNotificationData({ branch_id: hostile })).toBeNull();
    }
  });

  it('falls back to the venue when the booking id is junk but the branch id is real', () => {
    expect(routeForNotificationData({ booking_id: '../x', branch_id: BRANCH })).toBe(
      `/venue/${BRANCH}`,
    );
  });
});

describe('useNotificationResponseRouting', () => {
  const response = (data: unknown) => ({ notification: { request: { content: { data } } } });

  it('routes a tap and removes the listener on unmount', async () => {
    const { unmount } = await renderHook(() => useNotificationResponseRouting());
    const listener = mockAddListener.mock.calls[0][0];
    listener(response({ booking_id: BOOKING }));
    expect(mockPush).toHaveBeenCalledWith(`/(tabs)/activity/${BOOKING}`);
    await unmount();
    expect(mockRemove).toHaveBeenCalled();
  });

  it('routes a cold-start tap once', async () => {
    mockGetLastResponse.mockReturnValue(response({ branch_id: BRANCH }));
    await renderHook(() => useNotificationResponseRouting());
    expect(mockPush).toHaveBeenCalledWith(`/venue/${BRANCH}`);
  });

  it('shows foreground notifications', async () => {
    await renderHook(() => useNotificationResponseRouting());
    expect(mockSetHandler).toHaveBeenCalledTimes(1);
  });
});

describe('unregisterPush', () => {
  // The token cached by a previous registerForPush (module state) must not leak
  // between tests, so each test starts by clearing it with a no-op unregister.
  beforeEach(async () => {
    const { builder } = mockQuery({ data: null });
    mockFrom.mockReturnValue(builder);
    await unregisterPush();
    jest.clearAllMocks();
    mockGetToken.mockResolvedValue({ data: 'ExponentPushToken[abc]' });
    mockGetPermissions.mockResolvedValue({ status: 'granted' });
  });

  it('deletes the token registered earlier by value, then forgets it', async () => {
    await registerForPush();
    const { builder, calls } = mockQuery({ data: null });
    mockFrom.mockReturnValue(builder);
    mockGetToken.mockClear();

    await unregisterPush();

    expect(mockFrom).toHaveBeenCalledWith('push_tokens');
    expect(calls).toContainEqual(['delete', []]);
    expect(calls).toContainEqual(['eq', ['token', 'ExponentPushToken[abc]']]);
    expect(mockGetToken).not.toHaveBeenCalled();

    // Cache cleared: the next call has to re-read the token.
    await unregisterPush();
    expect(mockGetToken).toHaveBeenCalledTimes(1);
  });

  it('re-reads the token when none is cached', async () => {
    const { builder, calls } = mockQuery({ data: null });
    mockFrom.mockReturnValue(builder);

    await unregisterPush();

    expect(mockGetToken).toHaveBeenCalledWith({ projectId: 'proj-123' });
    expect(calls).toContainEqual(['eq', ['token', 'ExponentPushToken[abc]']]);
  });

  it('resolves without deleting when no token is cached and the re-read fails', async () => {
    mockGetToken.mockRejectedValue(new Error('simulator'));
    await expect(unregisterPush()).resolves.toBeUndefined();
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it('swallows a delete error and a zero-row delete', async () => {
    const failing = mockQuery({ error: { code: '42501', message: 'denied' } });
    mockFrom.mockReturnValue(failing.builder);
    await expect(unregisterPush()).resolves.toBeUndefined();

    const empty = mockQuery({ data: [] });
    mockFrom.mockReturnValue(empty.builder);
    await expect(unregisterPush()).resolves.toBeUndefined();
  });

  it('gives up on a hanging delete after the timeout', async () => {
    jest.useFakeTimers();
    try {
      mockFrom.mockReturnValue({ delete: () => ({ eq: () => new Promise(() => undefined) }) });
      const done = jest.fn();
      const pending = unregisterPush(3000).then(done);
      await jest.advanceTimersByTimeAsync(2999);
      expect(done).not.toHaveBeenCalled();
      await jest.advanceTimersByTimeAsync(2);
      await pending;
      expect(done).toHaveBeenCalled();
    } finally {
      jest.useRealTimers();
    }
  });
});

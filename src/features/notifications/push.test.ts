import { renderHook } from '@testing-library/react-native';
import { Platform } from 'react-native';

import { registerForPush, routeForNotificationData, useNotificationResponseRouting } from './push';

const mockGetPermissions = jest.fn();
const mockRequestPermissions = jest.fn();
const mockGetToken = jest.fn();
const mockSetHandler = jest.fn();
const mockRemove = jest.fn();
const mockAddListener = jest.fn();
const mockGetLastResponse = jest.fn();
const mockRpc = jest.fn();
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
jest.mock('@/lib/supabase', () => ({ supabase: { rpc: (...a: unknown[]) => mockRpc(...a) } }));
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

describe('routeForNotificationData', () => {
  it('prefers the booking, then the venue, else nothing', () => {
    expect(routeForNotificationData({ booking_id: 'bk1', branch_id: 'br1' })).toBe(
      '/(tabs)/activity/bk1',
    );
    expect(routeForNotificationData({ branch_id: 'br1' })).toBe('/venue/br1');
    expect(routeForNotificationData({})).toBeNull();
    expect(routeForNotificationData(null)).toBeNull();
    expect(routeForNotificationData({ booking_id: 5 })).toBeNull();
  });
});

describe('useNotificationResponseRouting', () => {
  const response = (data: unknown) => ({ notification: { request: { content: { data } } } });

  it('routes a tap and removes the listener on unmount', async () => {
    const { unmount } = await renderHook(() => useNotificationResponseRouting());
    const listener = mockAddListener.mock.calls[0][0];
    listener(response({ booking_id: 'bk1' }));
    expect(mockPush).toHaveBeenCalledWith('/(tabs)/activity/bk1');
    await unmount();
    expect(mockRemove).toHaveBeenCalled();
  });

  it('routes a cold-start tap once', async () => {
    mockGetLastResponse.mockReturnValue(response({ branch_id: 'br1' }));
    await renderHook(() => useNotificationResponseRouting());
    expect(mockPush).toHaveBeenCalledWith('/venue/br1');
  });

  it('shows foreground notifications', async () => {
    await renderHook(() => useNotificationResponseRouting());
    expect(mockSetHandler).toHaveBeenCalledTimes(1);
  });
});

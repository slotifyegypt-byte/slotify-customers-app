import NetInfo from '@react-native-community/netinfo';
import { focusManager, onlineManager } from '@tanstack/react-query';
import { AppState, Platform } from 'react-native';

let wired = false;

/**
 * React Query can't see the phone's state on its own: without this it thinks the app is always focused and always
 * online. Wiring it makes queries pause while offline (instead of burning retries), resume and refetch when the
 * connection returns, and refresh stale data when the app comes back to the foreground. Safe to call twice.
 */
export function setupQueryManagers(): void {
  if (wired || Platform.OS === 'web') return;
  wired = true;

  onlineManager.setEventListener((setOnline) =>
    NetInfo.addEventListener((state) => {
      // Both fields are null until the first probe finishes: only a definite "no" counts as offline.
      setOnline(state.isConnected !== false && state.isInternetReachable !== false);
    }),
  );

  focusManager.setEventListener((handleFocus) => {
    const subscription = AppState.addEventListener('change', (status) => {
      handleFocus(status === 'active');
    });
    return () => subscription.remove();
  });
}

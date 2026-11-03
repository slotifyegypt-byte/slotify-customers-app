import type { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

import type { Colors } from '@/theme';

import type { NotificationType } from '../api/schemas';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

interface NotificationVisual {
  icon: IoniconName;
  tint: string;
  iconColor: string;
  showDirections: boolean;
}

// Keyed on the backend `notification_type` enum. Every customer-relevant type
// has its own icon; the test loops over the generated enum so a value added
// later fails there, and the default branch keeps an unknown value on the
// generic bell instead of a blank row.
// `colors` is passed in by the caller (via `useColors()`) rather than read
// from a module-level import, so this plain (non-hook) function still
// reacts to theme changes.
export function notificationVisual(type: NotificationType, colors: Colors): NotificationVisual {
  const brand = { tint: colors.brandTint, iconColor: colors.brandAccent, showDirections: false };
  switch (type) {
    case 'booking_created':
      return { icon: 'calendar-outline', ...brand };
    case 'booking_confirmed':
      return {
        icon: 'checkmark-circle-outline',
        tint: colors.successTint,
        iconColor: colors.success,
        showDirections: false,
      };
    case 'booking_rescheduled':
      return { icon: 'swap-horizontal-outline', ...brand };
    case 'booking_cancelled':
      return {
        icon: 'close-circle-outline',
        tint: colors.neutralTint,
        iconColor: colors.danger,
        showDirections: false,
      };
    case 'booking_reminder':
      return { icon: 'alarm-outline', ...brand };
    case 'pickup_ready':
      return {
        icon: 'bag-handle-outline',
        tint: colors.successTint,
        iconColor: colors.success,
        showDirections: true,
      };
    case 'message_received':
      return { icon: 'chatbubble-ellipses-outline', ...brand };
    case 'general':
    default:
      return {
        icon: 'notifications-outline',
        tint: colors.neutralTint,
        iconColor: colors.textSecondary,
        showDirections: false,
      };
  }
}

// Fallback store name for the "Get Directions" deep link, used only when a
// notification's `store_id` is missing or fails to resolve (shouldn't
// happen for `pickup_ready` per the current contract, but this keeps the
// action from crashing or doing nothing if it ever does). Parses the store
// name at the front of the message ("<Store> — <detail>" or
// "<Store> · <detail>") for a maps text search.
export function extractStoreName(message: string): string | null {
  const [name] = message.split(/\s+[—·]\s+/);
  return name?.trim() || null;
}

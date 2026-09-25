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

// customer-app-api-map.md §12 — VERIFIED against the live backend's
// /openapi.json (2026-09-20): `NotificationRead` now carries a real
// `notification_type` field, so the icon/tint/"Get Directions" gating are
// derived directly from it instead of the previous title-text regex
// matching (there was no type field to key off before).
// `colors` is passed in by the caller (via `useColors()`) rather than read
// from a module-level import, so this plain (non-hook) function still
// reacts to theme changes.
export function notificationVisual(type: NotificationType, colors: Colors): NotificationVisual {
  switch (type) {
    case 'booking_confirmed':
    case 'booking_cancelled':
      return {
        icon: 'calendar-outline',
        tint: colors.brandTint,
        iconColor: colors.brandAccent,
        showDirections: false,
      };
    case 'pickup_ready':
      return {
        icon: 'bag-handle-outline',
        tint: colors.successTint,
        iconColor: colors.success,
        showDirections: true,
      };
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

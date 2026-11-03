import { Constants } from '@/lib/database.types';
import { colorSchemes } from '@/theme';

import { notificationVisual } from './notificationVisual';

const lightColors = colorSchemes.light;

const CUSTOMER_TYPES = [
  'booking_created',
  'booking_confirmed',
  'booking_rescheduled',
  'booking_cancelled',
  'booking_reminder',
  'pickup_ready',
  'message_received',
  'general',
] as const;

describe('notificationVisual', () => {
  // Loops over the generated enum so a value added by the backend fails here
  // instead of rendering a blank icon for a user.
  it.each(Constants.public.Enums.notification_type)(
    'returns an icon and colours for %s',
    (type) => {
      const visual = notificationVisual(type, lightColors);
      expect(visual.icon).toEqual(expect.any(String));
      expect(visual.icon.length).toBeGreaterThan(0);
      expect(visual.tint).toEqual(expect.any(String));
      expect(visual.iconColor).toEqual(expect.any(String));
    },
  );

  it('falls back to the generic bell for an unknown value', () => {
    expect(notificationVisual('something_new' as never, lightColors).icon).toBe(
      'notifications-outline',
    );
  });

  it('covers every customer-relevant type with a non-generic icon except general', () => {
    for (const type of CUSTOMER_TYPES) {
      const icon = notificationVisual(type, lightColors).icon;
      if (type === 'general') expect(icon).toBe('notifications-outline');
      else expect(icon).not.toBe('notifications-outline');
    }
  });

  it('only offers directions for pickup_ready', () => {
    for (const type of Constants.public.Enums.notification_type) {
      expect(notificationVisual(type, lightColors).showDirections).toBe(type === 'pickup_ready');
    }
  });
});

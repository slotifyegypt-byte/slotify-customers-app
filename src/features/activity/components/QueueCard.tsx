import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ThemedText } from '@/components/ThemedText';
import type { BookingRead } from '@/features/booking/api/schemas';
import { useCheckIn, useMyQueueTicket } from '@/features/booking/hooks/useQueueTicket';
import {
  CHECK_IN_OPENS_MIN,
  checkInErrorKey,
  checkInWindow,
  queueStatus,
} from '@/features/booking/utils/queue';
import { formatHour } from '@/lib/time/branchTime';
import { spacing } from '@/theme';

/** Re-renders every half minute, so the window opens and "early" turns into a place in line on its own. */
function useMinuteClock(): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);
  return now;
}

/**
 * On the day of a booking: "I'm here" (the customer joins the branch's queue), then their ticket and place in
 * line until they are called. Nothing on other days, or for a booking that is not confirmed.
 */
export function QueueCard({ booking }: { booking: BookingRead }) {
  const { t } = useTranslation();
  const now = useMinuteClock();
  const window = checkInWindow(booking, now);
  const isToday = window !== 'closed' || booking.booking_status === 'completed';
  const ticket = useMyQueueTicket(booking.id, booking.venue_available && isToday);
  const checkIn = useCheckIn(booking.id);
  const status = ticket.data ? queueStatus(ticket.data, now) : null;

  if (status && ticket.data) {
    const who = ticket.data.employeeName?.split(' ')[0] ?? null;
    const line =
      status.kind === 'turn'
        ? who
          ? t('activity.queue.turnWith', { name: who })
          : t('activity.queue.turn')
        : status.kind === 'next'
          ? t('activity.queue.next')
          : status.kind === 'ahead'
            ? t('activity.queue.ahead', { count: status.count })
            : status.kind === 'early'
              ? who
                ? t('activity.queue.earlyWith', {
                    name: who,
                    time: formatHour(status.dueAt, booking.timezone),
                  })
                : t('activity.queue.early', { time: formatHour(status.dueAt, booking.timezone) })
              : status.kind === 'missed'
                ? t('activity.queue.missed')
                : t('activity.queue.done');
    return (
      <Card>
        <View style={styles.gap} accessibilityLiveRegion="polite">
          <ThemedText variant="caption" color="textSecondary">
            {t('activity.queue.ticket', { number: String(ticket.data.number).padStart(3, '0') })}
          </ThemedText>
          <ThemedText variant="h3" color={status.kind === 'turn' ? 'success' : undefined}>
            {line}
          </ThemedText>
        </View>
      </Card>
    );
  }

  if (!booking.venue_available || ticket.isLoading) return null;

  if (window === 'early') {
    const opens = new Date(
      Date.parse(booking.booking_date) - CHECK_IN_OPENS_MIN * 60_000,
    ).toISOString();
    return (
      <ThemedText variant="caption" color="textTertiary" style={styles.center}>
        {t('activity.queue.opensAt', { time: formatHour(opens, booking.timezone) })}
      </ThemedText>
    );
  }

  if (window !== 'open') return null;

  return (
    <Card>
      <View style={styles.gap}>
        <ThemedText variant="bodyMedium">{t('activity.queue.hereTitle')}</ThemedText>
        <ThemedText variant="caption" color="textSecondary">
          {t('activity.queue.hereBody')}
        </ThemedText>
        <Button
          label={t('activity.queue.imHere')}
          icon="hand-left-outline"
          loading={checkIn.isPending}
          onPress={() => checkIn.mutate()}
        />
        {checkIn.error ? (
          <ThemedText variant="caption" color="danger" accessibilityRole="alert">
            {t(checkInErrorKey(checkIn.error))}
          </ThemedText>
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  gap: { gap: spacing.xs },
  center: { textAlign: 'center' },
});

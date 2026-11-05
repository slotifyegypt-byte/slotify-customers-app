import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/Card';
import { Divider } from '@/components/Divider';
import { ThemedText } from '@/components/ThemedText';
import type { BookingRead } from '@/features/booking/api/schemas';
import { formatMoney } from '@/lib/money';
import { formatHour } from '@/lib/time/branchTime';
import { radius, spacing, useColors } from '@/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

function Row({
  icon,
  leading,
  label,
  value,
}: {
  icon?: IconName;
  leading?: React.ReactNode;
  label: string;
  value: string;
}) {
  const colors = useColors();
  return (
    <View style={styles.row}>
      {leading ?? (
        <View style={[styles.well, { backgroundColor: colors.brandTint }]}>
          <Ionicons name={icon ?? 'ellipse-outline'} size={18} color={colors.brandAccent} />
        </View>
      )}
      <View style={styles.rowText}>
        <ThemedText variant="caption" color="textTertiary">
          {label}
        </ThemedText>
        <ThemedText variant="bodyMedium">{value}</ThemedText>
      </View>
    </View>
  );
}

/** Where it is and who it is with. (When is the hero's job.) */
export function WhereWithCard({
  booking,
  specialists,
}: {
  booking: BookingRead;
  /** Display names, already resolved (team lookup first, the name saved on the booking as fallback). */
  specialists: string[];
}) {
  const { t } = useTranslation();
  const colors = useColors();
  const withNames = specialists.join(', ');
  return (
    <Card padding="none">
      <Row
        icon="location-outline"
        label={t('activity.detail.where')}
        value={booking.store_address}
      />
      {withNames ? (
        <>
          <Divider style={styles.inset} />
          <Row
            leading={
              <View style={[styles.initial, { backgroundColor: colors.brandTintStrong }]}>
                <ThemedText variant="captionStrong" color="brandAccent">
                  {withNames.charAt(0).toUpperCase()}
                </ThemedText>
              </View>
            }
            label={t('activity.detail.with')}
            value={withNames}
          />
        </>
      ) : null}
    </Card>
  );
}

/** The service lines and the total: what was booked and what it costs. */
export function ServicesCard({ booking }: { booking: BookingRead }) {
  const { t } = useTranslation();
  const items = booking.booking_services;
  const showTimes = items.length > 1;
  return (
    <Card>
      <ThemedText variant="h3" style={styles.cardTitle}>
        {t('activity.detail.services')}
      </ThemedText>
      <View style={styles.lines}>
        {items.map((item) => (
          <Fragment key={item.id}>
            <View style={styles.line}>
              <View style={styles.lineText}>
                <ThemedText variant="bodyMedium">{item.service_name}</ThemedText>
                {showTimes ? (
                  <ThemedText variant="caption" color="textSecondary">
                    {t('activity.detail.durationRange', {
                      start: formatHour(item.booking_start_time, booking.timezone),
                      end: formatHour(item.booking_end_time, booking.timezone),
                    })}
                  </ThemedText>
                ) : null}
              </View>
              <ThemedText variant="bodyMedium">
                {formatMoney(item.total_price, booking.currency)}
              </ThemedText>
            </View>
          </Fragment>
        ))}
      </View>
      <Divider style={styles.totalRule} />
      <View style={styles.line}>
        <ThemedText variant="h3">{t('activity.detail.total')}</ThemedText>
        <ThemedText variant="h3">{formatMoney(booking.total_price, booking.currency)}</ThemedText>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm + 2, padding: spacing.md },
  well: {
    width: 36,
    height: 36,
    borderRadius: radius.sm + 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { flex: 1, minWidth: 0 },
  inset: { marginStart: spacing.md + 36 + spacing.sm + 2 },
  cardTitle: { marginBottom: spacing.sm },
  lines: { gap: spacing.sm + 2 },
  line: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  lineText: { flex: 1, minWidth: 0 },
  totalRule: { marginVertical: spacing.sm + 2 },
});

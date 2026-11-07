import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/Card';
import { ThemedText } from '@/components/ThemedText';
import type { BookingStatus } from '@/features/booking/api/schemas';
import { spacing, useColors } from '@/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

// customer-app-api-map.md §0.3: there is no backend field for which of these four stages a drop-off order is in,
// and per-stage tracking is out of scope. The steps are a best-effort projection of the real `booking_status`
// onto the design's stage names: "Fitting" can only ever be passed through once the order completes. That is an
// honest reflection of the data, not a bug.
const STEPS: { key: string; icon: IconName }[] = [
  { key: 'activity.detail.stepDroppedOff', icon: 'cube-outline' },
  { key: 'activity.detail.stepInProgress', icon: 'construct-outline' },
  { key: 'activity.detail.stepFitting', icon: 'body-outline' },
  { key: 'activity.detail.stepReady', icon: 'bag-check-outline' },
];

/**
 * Index of the current step, STEPS.length once everything is done, -1 when the order was cancelled.
 * A confirmed order whose start time is still ahead has not been dropped off yet, so it stays on the first step;
 * it moves to "In progress" once its start time has passed.
 */
export function orderStepIndex(
  status: BookingStatus,
  startsAt?: string,
  now: Date = new Date(),
): number {
  switch (status) {
    case 'pending':
      return 0;
    case 'confirmed':
      return startsAt !== undefined && Date.parse(startsAt) > now.getTime() ? 0 : 1;
    case 'completed':
      return STEPS.length;
    default:
      return -1;
  }
}

/** A vertical progress list for a drop-off order: done steps are checked, the current one is lifted. */
export function OrderTracker({ status, startsAt }: { status: BookingStatus; startsAt?: string }) {
  const { t } = useTranslation();
  const colors = useColors();
  const current = orderStepIndex(status, startsAt);
  if (current < 0) return null;

  return (
    <Card>
      <ThemedText variant="h3" style={styles.title}>
        {t('activity.detail.orderProgress')}
      </ThemedText>
      <View>
        {STEPS.map((step, index) => {
          const done = index < current;
          const isCurrent = index === current;
          const last = index === STEPS.length - 1;
          return (
            <View key={step.key} style={styles.step}>
              <View style={styles.rail}>
                <View
                  style={[
                    styles.circle,
                    done
                      ? { backgroundColor: colors.brand }
                      : isCurrent
                        ? { backgroundColor: colors.brandTintStrong }
                        : { backgroundColor: colors.backgroundMuted },
                  ]}
                >
                  <Ionicons
                    name={done ? 'checkmark' : step.icon}
                    size={15}
                    color={
                      done
                        ? colors.textOnBrand
                        : isCurrent
                          ? colors.brandAccent
                          : colors.textTertiary
                    }
                  />
                </View>
                {!last ? (
                  <View
                    style={[styles.line, { backgroundColor: done ? colors.brand : colors.divider }]}
                  />
                ) : null}
              </View>
              <ThemedText
                variant={isCurrent ? 'bodyMedium' : 'body'}
                color={done || isCurrent ? 'textPrimary' : 'textTertiary'}
                style={styles.label}
              >
                {t(step.key)}
              </ThemedText>
            </View>
          );
        })}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  title: { marginBottom: spacing.sm },
  step: { flexDirection: 'row', gap: spacing.sm + 2, minHeight: 44 },
  rail: { width: 30, alignItems: 'center' },
  circle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  line: { width: 2, flex: 1, marginVertical: 3, borderRadius: 1 },
  label: { paddingTop: 4, flex: 1 },
});

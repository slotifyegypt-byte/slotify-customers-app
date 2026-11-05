import { ScrollView, StyleSheet, View } from 'react-native';

import { ScreenHeader } from '@/components/ScreenHeader';
import { Skeleton } from '@/components/Skeleton';
import { radius, spacing } from '@/theme';

interface BookingSkeletonProps {
  /** Known title (a service or venue name); the header keeps its back button either way. */
  title?: string;
  subtitle?: string;
  /** `list`: the choose-a-service list. `flow`: summary card, day strip and a grid of times. */
  shape?: 'flow' | 'list';
}

/** The booking screens' final layout in grey, so loading already looks like where the customer is heading. */
export function BookingSkeleton({ title = '', subtitle, shape = 'flow' }: BookingSkeletonProps) {
  return (
    <View style={styles.flex}>
      <ScreenHeader title={title} subtitle={subtitle} />
      <ScrollView scrollEnabled={false} contentContainerStyle={styles.content}>
        {shape === 'list' ? (
          [0, 1, 2, 3].map((i) => <Skeleton key={i} height={84} radius={radius.lg} />)
        ) : (
          <>
            <Skeleton height={92} radius={radius.lg} />
            <Skeleton width={180} height={22} style={styles.gapTop} />
            <View style={styles.row}>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} width={56} height={68} radius={radius.md} />
              ))}
            </View>
            <View style={styles.grid}>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} width="31%" height={48} radius={radius.md} />
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingHorizontal: spacing.gutter, paddingTop: spacing.xs, gap: spacing.sm },
  gapTop: { marginTop: spacing.md },
  row: { flexDirection: 'row', gap: spacing.xs, overflow: 'hidden' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
});

import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/Card';
import { Skeleton } from '@/components/Skeleton';
import { radius, spacing } from '@/theme';

/** The shape of a `VenueCard` while the list is on its way. */
export function VenueCardSkeleton() {
  return (
    <Card padding="sm">
      <View style={styles.row}>
        <Skeleton width={88} height={88} radius={radius.md} />
        <View style={styles.body}>
          <Skeleton width="70%" height={18} />
          <Skeleton width="45%" height={12} />
          <Skeleton width="55%" height={12} style={styles.meta} />
        </View>
      </View>
    </Card>
  );
}

export function VenueListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <View style={styles.list}>
      {Array.from({ length: count }, (_, i) => (
        <VenueCardSkeleton key={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm },
  body: { flex: 1, gap: 8, paddingTop: 4 },
  meta: { marginTop: 8 },
  list: { gap: spacing.sm },
});

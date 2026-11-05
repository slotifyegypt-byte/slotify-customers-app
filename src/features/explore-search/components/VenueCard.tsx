import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { Card } from '@/components/Card';
import { Photo } from '@/components/Photo';
import { Pill } from '@/components/Pill';
import { PressableScale } from '@/components/PressableScale';
import { ThemedText } from '@/components/ThemedText';
import { radius, spacing, useColors } from '@/theme';

import type { NearbyStore } from '../api/schemas';

interface VenueCardProps {
  store: NearbyStore;
  /** Display name of the venue's first category, when the categories have loaded. */
  categoryName?: string;
  onPress?: () => void;
  /** Sits at the end of the card, top-aligned (a heart button). */
  trailing?: ReactNode;
}

/**
 * One venue in a vertical list (Explore results, Search, a category, Favourites): its photo, name, category,
 * rating, distance and, only while it is open, the mint "Open now" pill. Missing values are left out, never invented.
 */
export function VenueCard({ store, categoryName, onPress, trailing }: VenueCardProps) {
  const { t } = useTranslation();
  const colors = useColors();
  // On the narrowest phones the photo gives up a little width so the venue's name keeps its branch.
  const photoSize = useWindowDimensions().width < 360 ? 72 : 88;
  const isOpen = store.status === 'open';
  const hasRating = store.rating > 0;
  const subtitle = [categoryName, store.address].filter(Boolean).join(' · ');

  return (
    // The card is not itself a button: `trailing` (a heart) is a button too, and buttons cannot nest.
    <Card padding="sm">
      <View style={styles.row}>
        <PressableScale
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={store.name}
          scaleTo={0.98}
          style={styles.main}
        >
          <Photo
            uri={store.logo}
            name={store.name}
            style={{ width: photoSize, height: photoSize, borderRadius: radius.md }}
            initialSize={photoSize < 88 ? 28 : 34}
          />
          <View style={styles.body}>
            <ThemedText variant="h3" numberOfLines={3}>
              {store.name}
            </ThemedText>
            {subtitle ? (
              <ThemedText variant="caption" color="textTertiary" numberOfLines={1}>
                {subtitle}
              </ThemedText>
            ) : null}
            <View style={styles.meta}>
              {hasRating ? (
                <View style={styles.rating}>
                  <Ionicons name="star" size={13} color={colors.ratingStar} />
                  <ThemedText variant="captionStrong">{store.rating.toFixed(1)}</ThemedText>
                </View>
              ) : null}
              {store.distance_km != null ? (
                <ThemedText variant="caption" color="textSecondary">
                  {store.distance_km.toFixed(1)} km
                </ThemedText>
              ) : null}
              {isOpen ? <Pill label={t('explore.openNow')} tone="mint" dot /> : null}
            </View>
          </View>
        </PressableScale>
        {trailing}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  main: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  body: { flex: 1, minWidth: 0, gap: 2, paddingVertical: 2 },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    columnGap: spacing.sm,
    rowGap: 6,
    marginTop: 6,
  },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});

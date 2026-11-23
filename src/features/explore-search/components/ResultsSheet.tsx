import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';

import { EmptyState } from '@/components/EmptyState';
import { PressableScale } from '@/components/PressableScale';
import { ThemedText } from '@/components/ThemedText';
import { radius, shadows, spacing, useColors } from '@/theme';

import type { MappableStore, NearbyStore } from '../api/schemas';
import { useSearchPromoted } from '../hooks/useSearchPromoted';

import { VenueCard } from './VenueCard';
import { VenueListSkeleton } from './VenueCardSkeleton';

// Closed (only the grip, the map is clear), peek (the count and the first venue), open (the list, scrollable).
const SNAP_POINTS = [36, 240, '60%'];
const CLOSED = 0;
const PEEK = 1;
const OPEN = 2;

interface ResultsSheetProps {
  stores: MappableStore[];
  categoryNameBySlug: Map<string, string>;
  isLoading: boolean;
  filtersActive: boolean;
  onClearFilters: () => void;
  /** The sheet's top edge (y within the map), for things that float above it. */
  animatedPosition: SharedValue<number>;
}

/** What the map is showing, as a list in a bottom sheet. A pin tap swaps it for the selected-venue sheet. */
export function ResultsSheet({
  stores,
  categoryNameBySlug,
  isLoading,
  filtersActive,
  onClearFilters,
  animatedPosition,
}: ResultsSheetProps) {
  const { t } = useTranslation();
  const colors = useColors();
  const sheetRef = useRef<BottomSheet>(null);
  const [index, setIndex] = useState(CLOSED);
  const open = index === OPEN;

  // Branches that paid for the promoted section lead the list and are not repeated below it.
  const promoted = useSearchPromoted().data ?? [];
  const promotedIds = new Set(promoted.map((p) => p.id));
  const rest = stores.filter((s) => !promotedIds.has(s.id));

  const card = (store: NearbyStore) => (
    <VenueCard
      key={store.id}
      store={store}
      categoryName={categoryNameBySlug.get(store.category_slugs[0] ?? '')}
      onPress={() => router.push(`/venue/${store.id}`)}
    />
  );

  return (
    <BottomSheet
      ref={sheetRef}
      index={CLOSED}
      snapPoints={SNAP_POINTS}
      enableDynamicSizing={false}
      onChange={setIndex}
      animatedPosition={animatedPosition}
      style={styles.sheet}
      backgroundStyle={{ backgroundColor: colors.surface, borderColor: colors.border, ...styles.background }}
      handleIndicatorStyle={{ backgroundColor: colors.border, ...styles.grip }}
    >
      <BottomSheetScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <>
            <View style={styles.titleRow}>
              <ThemedText variant="h3">{t('explore.title')}</ThemedText>
            </View>
            <VenueListSkeleton count={3} />
          </>
        ) : stores.length === 0 ? (
          <EmptyState
            icon="search-outline"
            title={filtersActive ? t('explore.noMatches') : t('home.noStoresNearby')}
            body={filtersActive ? t('explore.noMatchesBody') : undefined}
            actionLabel={filtersActive ? t('explore.clearFilters') : undefined}
            onAction={filtersActive ? onClearFilters : undefined}
          />
        ) : (
          <>
            <PressableScale
              onPress={() => sheetRef.current?.snapToIndex(open ? PEEK : OPEN)}
              scaleTo={0.99}
              accessibilityRole="button"
              accessibilityLabel={open ? t('explore.hideList') : t('explore.showList')}
              style={styles.titleRow}
            >
              <ThemedText variant="h3" style={styles.title}>
                {t(filtersActive ? 'explore.resultsCountFiltered' : 'explore.resultsCount', {
                  count: stores.length,
                })}
              </ThemedText>
              <Ionicons name={open ? 'chevron-down' : 'chevron-up'} size={18} color={colors.textTertiary} />
            </PressableScale>
            {promoted.length > 0 ? (
              <View style={styles.promoted} accessibilityLabel={t('explore.promoted')}>
                <ThemedText variant="label" color="textTertiary">
                  {t('explore.promoted')}
                </ThemedText>
                {promoted.map(card)}
              </View>
            ) : null}
            {rest.map(card)}
          </>
        )}
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheet: { ...shadows.lg },
  background: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderBottomWidth: 0,
  },
  grip: { width: 40, height: 5 },
  content: { paddingHorizontal: spacing.gutter, paddingBottom: spacing.lg, gap: spacing.sm },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingBottom: spacing.xxs,
  },
  title: { flex: 1 },
  promoted: { gap: spacing.xs },
});

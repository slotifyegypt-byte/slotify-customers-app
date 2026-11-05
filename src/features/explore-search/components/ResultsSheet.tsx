import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Animated from 'react-native-reanimated';

import { EmptyState } from '@/components/EmptyState';
import { PressableScale } from '@/components/PressableScale';
import { ThemedText } from '@/components/ThemedText';
import { enter, radius, shadows, spacing, useColors } from '@/theme';

import type { MappableStore, NearbyStore } from '../api/schemas';
import { useSearchPromoted } from '../hooks/useSearchPromoted';

import { SheetDragHandle } from './SheetDragHandle';
import { VenueCard } from './VenueCard';
import { VenueListSkeleton } from './VenueCardSkeleton';

interface ResultsSheetProps {
  stores: MappableStore[];
  categoryNameBySlug: Map<string, string>;
  isLoading: boolean;
  filtersActive: boolean;
  onClearFilters: () => void;
  expanded: boolean;
  onExpand: () => void;
  onCollapse: () => void;
  onLayout: (e: LayoutChangeEvent) => void;
}

/**
 * What the map is showing, as a list: a peek with the count and the first venue, and, once pulled up (or tapped),
 * every venue as a card. A pin tap swaps it for the selected-venue sheet.
 */
export function ResultsSheet({
  stores,
  categoryNameBySlug,
  isLoading,
  filtersActive,
  onClearFilters,
  expanded,
  onExpand,
  onCollapse,
  onLayout,
}: ResultsSheetProps) {
  const { t } = useTranslation();
  const colors = useColors();
  const hasStores = stores.length > 0;
  const toggle = expanded ? onCollapse : onExpand;

  // Branches that paid for the promoted section lead the list (and the peek) and are not repeated below it.
  const promoted = useSearchPromoted().data ?? [];
  const promotedIds = new Set(promoted.map((p) => p.id));
  const rest = stores.filter((s) => !promotedIds.has(s.id));
  const hasPromoted = promoted.length > 0;
  const visible: NearbyStore[] = expanded ? rest : hasPromoted ? [] : stores.slice(0, 1);
  const peekPromoted = hasPromoted ? (expanded ? promoted : promoted.slice(0, 1)) : [];

  const card = (store: NearbyStore) => (
    <VenueCard
      key={store.id}
      store={store}
      categoryName={categoryNameBySlug.get(store.category_slugs[0] ?? '')}
      onPress={() => router.push(`/venue/${store.id}`)}
    />
  );

  const promotedSection = hasPromoted ? (
    <View style={styles.promoted} accessibilityLabel={t('explore.promoted')}>
      <ThemedText variant="label" color="textTertiary">
        {t('explore.promoted')}
      </ThemedText>
      {peekPromoted.map(card)}
    </View>
  ) : null;

  return (
    <Animated.View
      entering={enter(0)}
      onLayout={onLayout}
      style={[
        styles.sheet,
        { backgroundColor: colors.surface, borderColor: colors.border },
        expanded && styles.sheetExpanded,
      ]}
    >
      <SheetDragHandle
        onExpand={expanded ? undefined : onExpand}
        onCollapse={expanded ? onCollapse : undefined}
        accessibilityLabel={expanded ? t('explore.hideList') : t('explore.showList')}
      />

      {isLoading ? (
        <View style={styles.padded}>
          <View style={styles.titleRow}>
            <ThemedText variant="h3">{t('explore.title')}</ThemedText>
          </View>
          <VenueListSkeleton count={expanded ? 3 : 1} />
        </View>
      ) : !hasStores ? (
        <View style={styles.empty}>
          <EmptyState
            icon="search-outline"
            title={filtersActive ? t('explore.noMatches') : t('home.noStoresNearby')}
            body={filtersActive ? t('explore.noMatchesBody') : undefined}
            actionLabel={filtersActive ? t('explore.clearFilters') : undefined}
            onAction={filtersActive ? onClearFilters : undefined}
          />
        </View>
      ) : (
        <>
          <PressableScale
            onPress={toggle}
            scaleTo={0.99}
            accessibilityRole="button"
            accessibilityLabel={expanded ? t('explore.hideList') : t('explore.showList')}
            style={[styles.titleRow, styles.padded]}
          >
            <ThemedText variant="h3" style={styles.title}>
              {t(filtersActive ? 'explore.resultsCountFiltered' : 'explore.resultsCount', {
                count: stores.length,
              })}
            </ThemedText>
            <Ionicons
              name={expanded ? 'chevron-down' : 'chevron-up'}
              size={18}
              color={colors.textTertiary}
            />
          </PressableScale>
          {expanded ? (
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={[styles.list, styles.padded]}
              showsVerticalScrollIndicator={false}
            >
              {promotedSection}
              {visible.map(card)}
            </ScrollView>
          ) : (
            <View style={[styles.list, styles.padded]}>
              {promotedSection}
              {visible.map(card)}
            </View>
          )}
        </>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderBottomWidth: 0,
    ...shadows.lg,
  },
  sheetExpanded: { maxHeight: '64%' },
  padded: { paddingHorizontal: spacing.gutter },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  title: { flex: 1 },
  list: { gap: spacing.sm, paddingBottom: spacing.md },
  scroll: { flexGrow: 0, flexShrink: 1 },
  empty: { paddingBottom: spacing.sm },
  promoted: { gap: spacing.xs },
});

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Chip } from '@/components/Chip';
import { PressableScale } from '@/components/PressableScale';
import { ThemedText } from '@/components/ThemedText';
import { iconForCategory } from '@/features/home/utils/categoryIcon';
import { enter, radius, shadows, spacing, useColors } from '@/theme';

export type FilterPanel = 'category' | 'rating' | null;

type IconName = ComponentProps<typeof Ionicons>['name'];

interface ExploreHeaderProps {
  categories: { id: string | number; slug: string; name: string }[];
  ratingOptions: number[];
  selectedCategorySlug: string | null;
  selectedCategoryName?: string;
  openNowOnly: boolean;
  minRating: number | null;
  openPanel: FilterPanel;
  onTogglePanel: (panel: Exclude<FilterPanel, null>) => void;
  onSelectCategory: (slug: string | null) => void;
  onToggleOpenNow: () => void;
  onSelectRating: (rating: number | null) => void;
  onClearFilters: () => void;
}

/**
 * Floats over the map: a search pill that opens Search, the filter chips (Category, Open now, Rating) and, under
 * the chip that was tapped, a small list of choices. The empty areas let touches through to the map.
 */
export function ExploreHeader({
  categories,
  ratingOptions,
  selectedCategorySlug,
  selectedCategoryName,
  openNowOnly,
  minRating,
  openPanel,
  onTogglePanel,
  onSelectCategory,
  onToggleOpenNow,
  onSelectRating,
  onClearFilters,
}: ExploreHeaderProps) {
  const { t } = useTranslation();
  const colors = useColors();
  const filtersActive = selectedCategorySlug !== null || openNowOnly || minRating !== null;

  // Each chip sits on its own white backing so it stays legible over any map colour.
  const floating = (node: React.ReactNode, key: string) => (
    <View key={key} style={[styles.chipBacking, { backgroundColor: colors.surface }]}>
      {node}
    </View>
  );

  return (
    <SafeAreaView edges={['top']} style={styles.header} pointerEvents="box-none">
      <Animated.View entering={enter(0)} style={styles.searchWrap} pointerEvents="box-none">
        <PressableScale
          onPress={() => router.push('/(tabs)/home/search')}
          accessibilityRole="search"
          accessibilityLabel={t('home.searchPlaceholder')}
          scaleTo={0.985}
          style={[styles.search, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <Ionicons name="search" size={18} color={colors.textTertiary} />
          <ThemedText variant="body" color="textTertiary" numberOfLines={1} style={styles.flex}>
            {t('home.searchPlaceholder')}
          </ThemedText>
        </PressableScale>
      </Animated.View>

      <Animated.View entering={enter(1)} pointerEvents="box-none">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
          keyboardShouldPersistTaps="handled"
        >
          {floating(
            <Chip
              icon="grid-outline"
              label={selectedCategoryName ?? t('explore.category')}
              selected={selectedCategorySlug !== null}
              onPress={() => onTogglePanel('category')}
            />,
            'category',
          )}
          {floating(
            <Chip
              icon={openNowOnly ? 'checkmark' : undefined}
              label={t('explore.openNow')}
              selected={openNowOnly}
              onPress={onToggleOpenNow}
            />,
            'open',
          )}
          {floating(
            <Chip
              icon="star-outline"
              label={
                minRating ? t('explore.ratingPlus', { rating: minRating }) : t('explore.rating')
              }
              selected={minRating !== null}
              onPress={() => onTogglePanel('rating')}
            />,
            'rating',
          )}
          {filtersActive
            ? floating(
                <Chip icon="close" label={t('explore.clearFilters')} onPress={onClearFilters} />,
                'clear',
              )
            : null}
        </ScrollView>
      </Animated.View>

      {openPanel === 'category' ? (
        <Panel>
          <PanelRow
            icon="apps-outline"
            label={t('explore.allCategories')}
            selected={selectedCategorySlug === null}
            onPress={() => onSelectCategory(null)}
          />
          {categories.map((category) => (
            <PanelRow
              key={category.id}
              icon={iconForCategory(category.slug)}
              label={category.name}
              selected={selectedCategorySlug === category.slug}
              onPress={() => onSelectCategory(category.slug)}
            />
          ))}
        </Panel>
      ) : null}

      {openPanel === 'rating' ? (
        <Panel>
          <PanelRow
            icon="star-outline"
            label={t('explore.anyRating')}
            selected={minRating === null}
            onPress={() => onSelectRating(null)}
          />
          {ratingOptions.map((rating) => (
            <PanelRow
              key={rating}
              icon="star"
              label={t('explore.ratingPlus', { rating })}
              selected={minRating === rating}
              onPress={() => onSelectRating(rating)}
            />
          ))}
        </Panel>
      ) : null}
    </SafeAreaView>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  const colors = useColors();
  return (
    <View style={[styles.panel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <ScrollView
        style={styles.panelScroll}
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    </View>
  );
}

function PanelRow({
  icon,
  label,
  selected,
  onPress,
}: {
  icon: IconName;
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const colors = useColors();
  return (
    <PressableScale
      onPress={onPress}
      scaleTo={0.99}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      style={[styles.panelRow, selected && { backgroundColor: colors.brandTint }]}
    >
      <View
        style={[styles.well, { backgroundColor: selected ? colors.surface : colors.brandTint }]}
      >
        <Ionicons
          name={icon}
          size={16}
          color={icon === 'star' ? colors.ratingStar : colors.brandAccent}
        />
      </View>
      <ThemedText variant="bodyMedium" style={styles.flex} numberOfLines={1}>
        {label}
      </ThemedText>
      {selected ? <Ionicons name="checkmark" size={18} color={colors.brandAccent} /> : null}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  header: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, gap: spacing.sm },
  searchWrap: { paddingHorizontal: spacing.gutter, paddingTop: spacing.sm },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    minHeight: 54,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth * 2,
    ...shadows.md,
  },
  flex: { flex: 1 },
  chips: { paddingHorizontal: spacing.gutter, gap: spacing.xs, paddingVertical: 4 },
  chipBacking: { borderRadius: radius.pill, ...shadows.sm },
  panel: {
    marginHorizontal: spacing.gutter,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth * 2,
    padding: spacing.xxs,
    ...shadows.lg,
  },
  panelScroll: { maxHeight: 320 },
  panelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 48,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
  },
  well: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

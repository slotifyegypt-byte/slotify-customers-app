import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { EmptyState } from '@/components/EmptyState';
import { IconButton } from '@/components/IconButton';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { type NearbyStore } from '@/features/explore-search/api/schemas';
import { VenueCard } from '@/features/explore-search/components/VenueCard';
import { VenueListSkeleton } from '@/features/explore-search/components/VenueCardSkeleton';
import { useCategoryNames } from '@/features/explore-search/hooks/useCategoryNames';
import { useNearbyStores } from '@/features/explore-search/hooks/useNearbyStores';
import { useCategories } from '@/features/home/hooks/useHomeData';
import { useCustomerLocation } from '@/lib/location/useCustomerLocation';
import { enter, spacing } from '@/theme';

// `categoryKey` is a category slug (e.g. `hair-salon`). The label comes from
// the categories query, falling back to a humanised slug while it loads/fails.
const humanizeSlug = (slug: string) =>
  slug.replace(/-/g, ' ').replace(/^./, (c) => c.toUpperCase());

export function CategoryListingScreen() {
  const { t } = useTranslation();
  const { categoryKey } = useLocalSearchParams<{ categoryKey: string }>();
  const location = useCustomerLocation();
  const categories = useCategories();
  const categoryNames = useCategoryNames();

  const resolved = useMemo(() => {
    if (!categoryKey) return null;
    const label =
      categories.data?.find((category) => category.slug === categoryKey)?.name ??
      humanizeSlug(categoryKey);
    return { slug: categoryKey, label };
  }, [categoryKey, categories.data]);

  const nearbyParams = {
    latitude: location.latitude,
    longitude: location.longitude,
    radius_km: 15,
    limit: 50,
  };
  const nearby = useNearbyStores(nearbyParams);

  const stores = useMemo(() => {
    if (!nearby.data) return [];
    if (resolved === null) return nearby.data;
    return nearby.data.filter((store) => store.category_slugs.includes(resolved.slug));
  }, [nearby.data, resolved]);

  const label = resolved?.label ?? categoryKey ?? t('category.fallbackTitle');

  const header = (
    <Animated.View entering={enter(0)} style={styles.header}>
      <View style={styles.backRow}>
        <IconButton
          icon="chevron-back"
          accessibilityLabel={t('a11y.back')}
          onPress={() => router.back()}
        />
      </View>
      <ThemedText variant="h1" accessibilityRole="header">
        {t('category.nearYou', { category: label })}
      </ThemedText>
      {!nearby.isLoading && !nearby.isError && stores.length > 0 ? (
        <ThemedText variant="body" color="textSecondary">
          {t('category.count', { count: stores.length })}
        </ThemedText>
      ) : null}
    </Animated.View>
  );

  const empty = nearby.isLoading ? (
    <VenueListSkeleton count={4} />
  ) : nearby.isError ? (
    <EmptyState
      icon="cloud-offline-outline"
      title={t('category.errorTitle')}
      body={t('category.errorBody')}
      actionLabel={t('common.retry')}
      onAction={() => nearby.refetch()}
    />
  ) : (
    <EmptyState
      icon="storefront-outline"
      title={t('category.emptyTitle')}
      body={t('category.emptyBody', { category: label.toLowerCase() })}
      actionLabel={t('category.emptyAction')}
      onAction={() => router.push('/(tabs)/explore')}
    />
  );

  return (
    <Screen edges={['top']}>
      <FlatList<NearbyStore>
        data={nearby.isLoading || nearby.isError ? [] : stores}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={header}
        ListEmptyComponent={empty}
        renderItem={({ item, index }) => (
          <Animated.View entering={enter(index + 1)}>
            <VenueCard
              store={item}
              categoryName={categoryNames.get(item.category_slugs[0] ?? '')}
              onPress={() => router.push(`/venue/${item.id}`)}
            />
          </Animated.View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { flexGrow: 1, paddingHorizontal: spacing.gutter, paddingBottom: 120, gap: spacing.sm },
  header: { gap: spacing.xxs, paddingTop: spacing.sm, paddingBottom: spacing.md },
  backRow: { flexDirection: 'row', marginBottom: spacing.sm },
});

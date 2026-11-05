import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { FlatList, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { EmptyState } from '@/components/EmptyState';
import { IconButton } from '@/components/IconButton';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { VenueCard } from '@/features/explore-search/components/VenueCard';
import { VenueListSkeleton } from '@/features/explore-search/components/VenueCardSkeleton';
import { useCategoryNames } from '@/features/explore-search/hooks/useCategoryNames';
import { enter, spacing, useColors } from '@/theme';

import { type Favourite } from '../api/schemas';
import { useFavourites } from '../hooks/useFavourites';
import { useToggleFavourite } from '../hooks/useToggleFavourite';

export function FavouritesScreen() {
  const { t } = useTranslation();
  const favourites = useFavourites();
  const categoryNames = useCategoryNames();

  const header = (
    <Animated.View entering={enter(0)} style={styles.header}>
      <View style={styles.backRow}>
        <IconButton icon="chevron-back" accessibilityLabel="Back" onPress={() => router.back()} />
      </View>
      <ThemedText variant="h1" accessibilityRole="header">
        {t('favourites.title')}
      </ThemedText>
      {favourites.data?.length ? (
        <ThemedText variant="body" color="textSecondary">
          {t('favourites.count', { count: favourites.data.length })}
        </ThemedText>
      ) : null}
    </Animated.View>
  );

  const empty = favourites.isLoading ? (
    <VenueListSkeleton count={3} />
  ) : favourites.isError ? (
    <EmptyState
      icon="cloud-offline-outline"
      title={t('favourites.errorTitle')}
      body={t('favourites.errorBody')}
      actionLabel={t('common.retry')}
      onAction={() => favourites.refetch()}
    />
  ) : (
    <EmptyState
      icon="heart-outline"
      title={t('favourites.emptyTitle')}
      body={t('favourites.emptyBody')}
      actionLabel={t('favourites.emptyAction')}
      onAction={() => router.push('/(tabs)/explore')}
    />
  );

  return (
    <Screen edges={['top']}>
      <FlatList<Favourite>
        data={favourites.isLoading || favourites.isError ? [] : (favourites.data ?? [])}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={header}
        ListEmptyComponent={empty}
        renderItem={({ item, index }) => (
          <Animated.View entering={enter(index + 1)}>
            <FavouriteRow
              favourite={item}
              categoryName={categoryNames.get(item.store.category_slugs[0] ?? '')}
            />
          </Animated.View>
        )}
      />
    </Screen>
  );
}

function FavouriteRow({
  favourite,
  categoryName,
}: {
  favourite: Favourite;
  categoryName?: string;
}) {
  const { t } = useTranslation();
  const colors = useColors();
  // customer-app-api-map.md §11 — VERIFIED live (2026-09-20): GET
  // /favourites/ now embeds the full store per row, so there's no more
  // per-row fetch (and no per-row failure mode to guard against) here.
  const { remove } = useToggleFavourite(favourite.store_id);
  const store = favourite.store;

  return (
    <VenueCard
      store={store}
      categoryName={categoryName}
      onPress={() => router.push(`/venue/${store.id}`)}
      trailing={
        <IconButton
          icon="heart"
          size={38}
          color={colors.danger}
          accessibilityLabel={t('favourites.remove', { name: store.name })}
          onPress={() => {
            if (!remove.isPending) remove.mutate();
          }}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  list: { flexGrow: 1, paddingHorizontal: spacing.gutter, paddingBottom: 120, gap: spacing.sm },
  header: { gap: spacing.xxs, paddingTop: spacing.sm, paddingBottom: spacing.md },
  backRow: { flexDirection: 'row', marginBottom: spacing.sm },
});

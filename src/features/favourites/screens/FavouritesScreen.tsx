import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { StoreCard } from '@/components/StoreCard';
import { radius, shadows, spacing, useColors, type Colors } from '@/theme';

import { type Favourite } from '../api/schemas';
import { useFavourites } from '../hooks/useFavourites';
import { useToggleFavourite } from '../hooks/useToggleFavourite';

export function FavouritesScreen() {
  const colors = useColors();
  const styles = createStyles(colors);
  const favourites = useFavourites();

  return (
    <Screen edges={['top']} style={styles.screen}>
      <ScreenHeader title="Favourites" />

      {favourites.isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.brand} />
        </View>
      ) : favourites.isError ? (
        <View style={styles.center}>
          <EmptyState
            title="Something went wrong"
            body="Couldn't load your favourites."
            actionLabel="Retry"
            onAction={() => favourites.refetch()}
          />
        </View>
      ) : !favourites.data?.length ? (
        <View style={styles.center}>
          <EmptyState title="No favourites yet" body="Stores you favourite will show up here." />
        </View>
      ) : (
        <FlatList<Favourite>
          data={favourites.data}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => <FavouriteRow favourite={item} />}
        />
      )}
    </Screen>
  );
}

function FavouriteRow({ favourite }: { favourite: Favourite }) {
  const colors = useColors();
  const styles = createStyles(colors);
  // customer-app-api-map.md §11 — VERIFIED live (2026-09-20): GET
  // /favourites/ now embeds the full store per row, so there's no more
  // per-row fetch (and no per-row failure mode to guard against) here.
  const { remove } = useToggleFavourite(favourite.store_id);
  const store = favourite.store;

  return (
    <View style={styles.row}>
      <StoreCard
        name={store.name}
        logo={store.logo}
        address={store.address}
        rating={store.rating}
        isOpen={store.status === 'open'}
        onPress={() => router.push(`/venue/${store.id}`)}
        width={220}
      />
      <Pressable
        style={styles.removeBtn}
        disabled={remove.isPending}
        onPress={() => remove.mutate()}
        hitSlop={8}
      >
        <SymbolView name={{ ios: 'heart.fill', android: 'favorite', web: 'favorite' }} tintColor={colors.danger} size={20} />
      </Pressable>
    </View>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
  screen: { padding: 0 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.md },
  list: { paddingHorizontal: spacing.md, paddingBottom: spacing.xxl },
  row: { position: 'relative', marginBottom: spacing.md, alignSelf: 'flex-start' },
  removeBtn: {
    position: 'absolute',
    top: spacing.xxs,
    right: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    padding: spacing.xxs,
    ...shadows.sm,
  },
  });

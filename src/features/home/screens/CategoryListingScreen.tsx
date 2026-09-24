import { useLocalSearchParams, router } from 'expo-router';
import { useMemo } from 'react';
import { ActivityIndicator, Dimensions, FlatList, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { StoreCard } from '@/components/StoreCard';
import { ThemedText } from '@/components/ThemedText';
import { type NearbyStore } from '@/features/explore-search/api/schemas';
import { useNearbyStores } from '@/features/explore-search/hooks/useNearbyStores';
import { useCategories } from '@/features/home/hooks/useHomeData';
import { useCustomerLocation } from '@/lib/location/useCustomerLocation';
import { colors, spacing } from '@/theme';

// Home's category chips (src/features/home/screens/HomeScreen.tsx) link here
// with the real numeric `category.id` from GET /store-categories (LIVE-
// VERIFIED shape: {id, name, description, ...} — see the schema note in
// src/features/home/api/schemas.ts). This is a label fallback only for when
// that query errors and we still have a numeric id to filter by.
// TODO i18n
const FALLBACK_CATEGORY_LABELS: Record<number, string> = {
  1: 'Barbers',
  2: 'Salons',
  3: 'Spa',
  4: 'Car Care',
  5: 'Tailors',
  6: 'Repair',
};

const CARD_WIDTH = Dimensions.get('window').width - spacing.md * 2;

export function CategoryListingScreen() {
  const { categoryKey } = useLocalSearchParams<{ categoryKey: string }>();
  const location = useCustomerLocation();
  const categories = useCategories();

  const resolved = useMemo(() => {
    const id = Number(categoryKey);
    if (!Number.isFinite(id)) return null;
    const label = categories.data?.find((category) => category.id === id)?.name ?? FALLBACK_CATEGORY_LABELS[id] ?? `Category ${id}`; // TODO i18n
    return { id, label };
  }, [categoryKey, categories.data]);

  const nearbyParams =
    location.latitude !== null
      ? { latitude: location.latitude, longitude: location.longitude!, radius_km: 15, limit: 50 }
      : null;
  const nearby = useNearbyStores(nearbyParams);

  const stores = useMemo(() => {
    if (!nearby.data) return [];
    if (resolved === null) return nearby.data;
    return nearby.data.filter((store) => store.category_id === resolved.id);
  }, [nearby.data, resolved]);

  const title = resolved?.label ?? categoryKey ?? 'Stores'; // TODO i18n

  return (
    <Screen edges={['top']} style={styles.screen}>
      <View style={styles.header}>
        <ThemedText variant="h1">{title} near you</ThemedText>
      </View>

      {location.latitude === null || nearby.isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.brandAccent} />
        </View>
      ) : nearby.isError ? (
        <View style={styles.center}>
          <EmptyState title="Couldn't load stores" body="Check your connection and try again." />
        </View>
      ) : stores.length === 0 ? (
        <View style={styles.center}>
          <EmptyState title="Nothing here yet" body={`No ${title.toLowerCase()} found near you.`} />
        </View>
      ) : (
        <FlatList<NearbyStore>
          data={stores}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <StoreCard
              name={item.name}
              logo={item.logo}
              address={item.address}
              rating={item.rating}
              distanceKm={item.distance_km}
              isOpen={item.status === 'open'}
              width={CARD_WIDTH}
              onPress={() => router.push(`/venue/${item.id}`)}
            />
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { padding: 0 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.md },
  list: { paddingHorizontal: spacing.md, paddingBottom: spacing.xxl },
});

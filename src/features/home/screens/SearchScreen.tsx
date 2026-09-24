import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { StoreCard } from '@/components/StoreCard';
import { ThemedText } from '@/components/ThemedText';
import { type SearchStore } from '@/features/explore-search/api/schemas';
import { useSearchStores } from '@/features/explore-search/hooks/useSearchStores';
import { useCustomerLocation } from '@/lib/location/useCustomerLocation';
import { colors, fontFamily, radius, spacing } from '@/theme';

// customer-app-api-map.md §4 — no search-history or trending-terms endpoint
// exists. "Recent" is kept in local component state for this session only,
// and "trending" is a static, hardcoded list for v1, per the doc.
// TODO i18n
const TRENDING_SEARCHES = ['Barbers', 'Salons', 'Spa'];

// Static filter categories shown on the search screen per the design —
// no backend filter endpoint exists yet (customer-app-api-map.md §4), so
// these are presentational only for now.
// TODO i18n, TODO wire up filter behavior once the API supports it
const FILTER_PILLS = ['Service', 'Specialist', 'Category', 'Location'];

const MAX_RECENT_SEARCHES = 8;
const CARD_WIDTH = Dimensions.get('window').width - spacing.md * 2;

export function SearchScreen() {
  const location = useCustomerLocation();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  // autoFocus fires the TextInput's focus a beat after mount, so this starts
  // true to show the design's purple focus ring immediately.
  const [focused, setFocused] = useState(true);

  const recordRecentSearch = (term: string) => {
    if (!term) return;
    setRecentSearches((prev) => [term, ...prev.filter((existing) => existing !== term)].slice(0, MAX_RECENT_SEARCHES));
  };

  // Debounce, then commit — recording into "recent" happens in the timeout
  // callback (an external-system tick), not synchronously in the effect body.
  useEffect(() => {
    const trimmed = query.trim();
    const timer = setTimeout(() => {
      setDebouncedQuery(trimmed);
      recordRecentSearch(trimmed);
    }, 350);
    return () => clearTimeout(timer);
  }, [query]);

  const results = useSearchStores(
    {
      q: debouncedQuery,
      latitude: location.latitude ?? undefined,
      longitude: location.longitude ?? undefined,
      limit: 20,
    },
    debouncedQuery.length > 0,
  );

  const runSearch = (term: string) => {
    setQuery(term);
    setDebouncedQuery(term);
    recordRecentSearch(term);
  };

  return (
    <Screen edges={['top']} style={styles.screen}>
      <View style={styles.topBar}>
        <View style={[styles.searchBar, focused && styles.searchBarFocused]}>
          <Ionicons name="search" size={16} color={colors.textSecondary} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search barbers, salons, car wash…" // TODO i18n
            placeholderTextColor={colors.textSecondary}
            style={styles.input}
            autoFocus
            returnKeyType="search"
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onSubmitEditing={() => setDebouncedQuery(query.trim())}
          />
          {query.length > 0 ? (
            <Pressable onPress={() => runSearch('')} hitSlop={8}>
              <Ionicons name="close-circle" size={16} color={colors.textSecondary} />
            </Pressable>
          ) : null}
        </View>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ThemedText variant="bodyMedium" color="brandAccent" style={styles.cancelText}>
            Cancel
          </ThemedText>
        </Pressable>
      </View>

      {debouncedQuery.length === 0 ? (
        <View style={styles.content}>
          <View style={styles.filterRow}>
            {FILTER_PILLS.map((label) => (
              <Pressable key={label} style={styles.filterPill}>
                <ThemedText variant="bodyMedium" style={styles.filterPillText}>
                  {label}
                </ThemedText>
              </Pressable>
            ))}
          </View>

          {recentSearches.length > 0 ? (
            <View style={styles.section}>
              <ThemedText variant="caption" color="textSecondary" style={styles.sectionTitle}>
                Recent
              </ThemedText>
              <View style={styles.chipWrap}>
                {recentSearches.map((term) => (
                  <Pressable key={term} style={styles.recentChip} onPress={() => runSearch(term)}>
                    <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                    <ThemedText variant="bodyMedium">{term}</ThemedText>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}

          <View style={styles.section}>
            <ThemedText variant="caption" color="textSecondary" style={styles.sectionTitle}>
              Trending
            </ThemedText>
            <View style={styles.chipWrap}>
              {TRENDING_SEARCHES.map((term) => (
                <Pressable key={term} style={styles.trendingChip} onPress={() => runSearch(term)}>
                  <ThemedText variant="bodyMedium" color="brandAccent" style={styles.trendingChipText}>
                    {term}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      ) : results.isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.brandAccent} />
        </View>
      ) : results.isError ? (
        <View style={styles.center}>
          <EmptyState title="Something went wrong" body="Couldn't run that search — try again." />
        </View>
      ) : !results.data?.stores.length ? (
        <View style={styles.center}>
          <EmptyState title="No results" body={`Nothing found for "${debouncedQuery}"`} />
        </View>
      ) : (
        <FlatList<SearchStore>
          data={results.data.stores}
          keyExtractor={(item) => item.store_id}
          contentContainerStyle={styles.content}
          renderItem={({ item }) => (
            <StoreCard
              name={item.store_name}
              logo={item.store_logo}
              address={item.store_address}
              rating={item.store_rating}
              distanceKm={item.store_distance_km}
              isOpen={item.status === 'open'}
              width={CARD_WIDTH}
              onPress={() => router.push(`/venue/${item.store_id}`)}
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
  },
  searchBarFocused: { borderColor: colors.brandAccent },
  input: { flex: 1, paddingVertical: spacing.sm, fontSize: 15, color: colors.textPrimary },
  cancelText: { fontFamily: fontFamily.bodySemiBold },
  content: { paddingHorizontal: spacing.md, paddingBottom: spacing.xxl },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.lg },
  filterPill: {
    backgroundColor: colors.backgroundMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.pill,
  },
  filterPillText: { fontFamily: fontFamily.bodySemiBold },
  section: { marginBottom: spacing.lg },
  sectionTitle: { marginBottom: spacing.sm, textTransform: 'uppercase', letterSpacing: 0.6 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap' },
  recentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.backgroundMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  trendingChip: {
    backgroundColor: colors.brandTintStrong,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  trendingChipText: { fontFamily: fontFamily.bodySemiBold },
});

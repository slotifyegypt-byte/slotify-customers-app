import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Platform, StyleSheet, TextInput, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Chip } from '@/components/Chip';
import { EmptyState } from '@/components/EmptyState';
import { PressableScale } from '@/components/PressableScale';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { type SearchStore } from '@/features/explore-search/api/schemas';
import { VenueCard } from '@/features/explore-search/components/VenueCard';
import { VenueListSkeleton } from '@/features/explore-search/components/VenueCardSkeleton';
import { useCategoryNames } from '@/features/explore-search/hooks/useCategoryNames';
import { useSearchStores } from '@/features/explore-search/hooks/useSearchStores';
import { useCategories } from '@/features/home/hooks/useHomeData';
import { iconForCategory } from '@/features/home/utils/categoryIcon';
import { useCustomerLocation } from '@/lib/location/useCustomerLocation';
import { enter, fontFamily, radius, shadows, spacing, useColors, type Colors } from '@/theme';

// customer-app-api-map.md §4 — no search-history or trending-terms endpoint
// exists. "Recent" is kept in local component state for this session only,
// and the suggested searches are a static list for v1, per the doc.
const TRENDING_SEARCHES = ['Barbers', 'Salons', 'Spa'];

const MAX_RECENT_SEARCHES = 8;

export function SearchScreen() {
  const { t } = useTranslation();
  const colors = useColors();
  const styles = createStyles(colors);
  const location = useCustomerLocation();
  const categories = useCategories();
  const categoryNames = useCategoryNames();

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  // autoFocus fires the TextInput's focus a beat after mount, so this starts
  // true to show the design's purple focus ring immediately.
  const [focused, setFocused] = useState(true);

  const recordRecentSearch = (term: string) => {
    if (!term) return;
    setRecentSearches((prev) =>
      [term, ...prev.filter((existing) => existing !== term)].slice(0, MAX_RECENT_SEARCHES),
    );
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

  const hasQuery = debouncedQuery.length > 0;

  const resultsEmpty = results.isLoading ? (
    <VenueListSkeleton count={4} />
  ) : results.isError ? (
    <EmptyState
      icon="cloud-offline-outline"
      title={t('search.errorTitle')}
      body={t('search.errorBody')}
      actionLabel={t('common.retry')}
      onAction={() => results.refetch()}
    />
  ) : (
    <EmptyState
      icon="search-outline"
      title={t('search.noResults')}
      body={t('search.noResultsBody', { query: debouncedQuery })}
    />
  );

  return (
    <Screen edges={['top']}>
      <Animated.View entering={enter(0)} style={styles.topBar}>
        <View style={[styles.searchBar, focused && styles.searchBarFocused]}>
          <Ionicons
            name="search"
            size={18}
            color={focused ? colors.brandAccent : colors.textTertiary}
          />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t('home.searchPlaceholder')}
            placeholderTextColor={colors.textTertiary}
            selectionColor={colors.brandAccent}
            accessibilityLabel={t('home.searchPlaceholder')}
            style={styles.input}
            autoFocus
            returnKeyType="search"
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onSubmitEditing={() => setDebouncedQuery(query.trim())}
          />
          {query.length > 0 ? (
            <PressableScale
              onPress={() => runSearch('')}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel={t('search.clear')}
              style={styles.clear}
            >
              <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
            </PressableScale>
          ) : null}
        </View>
        <PressableScale
          onPress={() => router.back()}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={t('search.cancel')}
          style={styles.cancel}
        >
          <ThemedText variant="bodyMedium" color="brandAccent">
            {t('search.cancel')}
          </ThemedText>
        </PressableScale>
      </Animated.View>

      {!hasQuery ? (
        <Animated.ScrollView
          entering={enter(1)}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {recentSearches.length > 0 ? (
            <View style={styles.section}>
              <ThemedText variant="bodyMedium" color="textSecondary">
                {t('search.recent')}
              </ThemedText>
              <View style={styles.chipWrap}>
                {recentSearches.map((term) => (
                  <Chip
                    key={term}
                    label={term}
                    icon="time-outline"
                    onPress={() => runSearch(term)}
                  />
                ))}
              </View>
            </View>
          ) : null}

          <View style={styles.section}>
            <ThemedText variant="bodyMedium" color="textSecondary">
              {t('search.trending')}
            </ThemedText>
            <View style={styles.chipWrap}>
              {TRENDING_SEARCHES.map((term) => (
                <Chip key={term} label={term} onPress={() => runSearch(term)} />
              ))}
            </View>
          </View>

          {categories.data?.length ? (
            <View style={styles.section}>
              <ThemedText variant="bodyMedium" color="textSecondary">
                {t('search.browse')}
              </ThemedText>
              <View style={styles.chipWrap}>
                {categories.data.map((category) => (
                  <Chip
                    key={String(category.id)}
                    label={category.name}
                    icon={iconForCategory(category.slug)}
                    onPress={() => router.push(`/(tabs)/home/category/${category.slug}`)}
                  />
                ))}
              </View>
            </View>
          ) : null}
        </Animated.ScrollView>
      ) : (
        <FlatList<SearchStore>
          data={results.isLoading || results.isError ? [] : (results.data?.stores ?? [])}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.content, styles.results]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            !results.isLoading && !results.isError && results.data?.stores.length ? (
              <ThemedText variant="caption" color="textTertiary" style={styles.count}>
                {t('search.resultsCount', { count: results.data.stores.length })}
              </ThemedText>
            ) : null
          }
          ListEmptyComponent={resultsEmpty}
          renderItem={({ item, index }) => (
            <Animated.View entering={enter(index)}>
              <VenueCard
                store={item}
                categoryName={categoryNames.get(item.category_slugs[0] ?? '')}
                onPress={() => router.push(`/venue/${item.id}`)}
              />
            </Animated.View>
          )}
        />
      )}
    </Screen>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingHorizontal: spacing.gutter,
      paddingTop: spacing.sm,
      paddingBottom: spacing.md,
    },
    searchBar: {
      flex: 1,
      minWidth: 0,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs + 2,
      minHeight: 54,
      backgroundColor: colors.surface,
      borderRadius: radius.pill,
      borderWidth: 1.5,
      borderColor: colors.border,
      paddingHorizontal: spacing.md,
      ...shadows.sm,
    },
    searchBarFocused: { borderColor: colors.brandAccent },
    input: {
      flex: 1,
      minWidth: 0,
      paddingVertical: spacing.sm,
      fontFamily: fontFamily.bodyRegular,
      fontSize: 16,
      color: colors.textPrimary,
      // The bar draws the focus ring; the browser's own outline would double it.
      ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null),
    },
    clear: { minWidth: 24, minHeight: 24, alignItems: 'center', justifyContent: 'center' },
    cancel: { minHeight: 44, justifyContent: 'center' },
    content: { paddingHorizontal: spacing.gutter, paddingBottom: 120, gap: 28 },
    results: { flexGrow: 1, gap: spacing.sm },
    count: { marginBottom: spacing.xxs },
    section: { gap: spacing.sm },
    chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  });

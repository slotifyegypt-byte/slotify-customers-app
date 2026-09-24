import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { ThemedText } from '@/components/ThemedText';
import { useMyBookings } from '@/features/booking/hooks/useMyBookings';
import { formatBookingDateTitle, formatBookingHourStr } from '@/features/booking/utils/time';
import { useNearbyStores } from '@/features/explore-search/hooks/useNearbyStores';
import { useUnreadNotificationCount } from '@/features/notifications/hooks/useNotifications';
import { useMyProfile } from '@/features/profile/hooks/useProfile';
import { useCustomerLocation } from '@/lib/location/useCustomerLocation';
import { colors, fontFamily, radius, shadows, spacing } from '@/theme';

import { BookAgainCard } from '../components/BookAgainCard';
import { CategoryChip } from '../components/CategoryChip';
import { DealCard } from '../components/DealCard';
import { HScrollFade } from '../components/HScrollFade';
import { NearbyMapPreview } from '../components/NearbyMapPreview';
import { NextUpCard, NoNextUpCard } from '../components/NextUpCard';
import { TopRatedCard } from '../components/TopRatedCard';
import { useCategories, useHomeOffers } from '../hooks/useHomeData';
import { formatCountdown, selectNextUpBooking } from '../utils/countdown';
import { greetingKeyForHour } from '../utils/greeting';

export function HomeScreen() {
  const { t } = useTranslation();
  const location = useCustomerLocation();
  const profile = useMyProfile();
  const unread = useUnreadNotificationCount();
  const categories = useCategories();
  const offers = useHomeOffers();

  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const selectedCategory = useMemo(
    () => categories.data?.find((c) => c.id === selectedCategoryId) ?? null,
    [categories.data, selectedCategoryId],
  );
  const toggleCategory = (id: number) => setSelectedCategoryId((prev) => (prev === id ? null : id));
  const clearCategoryFilter = () => setSelectedCategoryId(null);

  const nearbyParams =
    location.latitude !== null
      ? { latitude: location.latitude, longitude: location.longitude!, radius_km: 15, limit: 20 }
      : null;
  const nearby = useNearbyStores(nearbyParams);

  const upcoming = useMyBookings('confirmed');
  const past = useMyBookings('completed');

  const nextUp = useMemo(() => selectNextUpBooking(upcoming.data), [upcoming.data]);

  const hasBookingHistory = (upcoming.data?.length ?? 0) > 0 || (past.data?.length ?? 0) > 0;
  const showNextUpSection = Boolean(nextUp) || hasBookingHistory;

  const bookAgain = useMemo(() => {
    if (!past.data?.length) return [];
    const seen = new Set<string>();
    return past.data.filter((b) => (seen.has(b.store_id) ? false : (seen.add(b.store_id), true))).slice(0, 10);
  }, [past.data]);

  const topRated = useMemo(() => {
    if (!nearby.data) return [];
    const source = selectedCategory ? nearby.data.filter((s) => s.category_id === selectedCategory.id) : nearby.data;
    return [...source].sort((a, b) => b.rating - a.rating).slice(0, 10);
  }, [nearby.data, selectedCategory]);

  const categoryNameById = useMemo(() => {
    const map = new Map<number, string>();
    categories.data?.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [categories.data]);

  const mapPins = useMemo(
    () =>
      topRated.slice(0, 6).map((store) => ({
        id: store.id,
        categoryName: categoryNameById.get(store.category_id) ?? '',
        latitude: store.latitude,
        longitude: store.longitude,
        isOpen: store.status === 'open',
      })),
    [topRated, categoryNameById],
  );

  const mapRegion = location.latitude !== null ? { latitude: location.latitude, longitude: location.longitude! } : null;

  const deals = useMemo(() => {
    if (!offers.data) return [];
    return selectedCategory
      ? offers.data.filter((o) => o.category_id === String(selectedCategory.id))
      : offers.data;
  }, [offers.data, selectedCategory]);

  const goExplore = () => router.push('/(tabs)/explore');

  const scrollRef = useRef<ScrollView>(null);
  const mapSectionY = useRef(0);
  const scrollToMap = () => {
    scrollRef.current?.scrollTo({ y: Math.max(0, mapSectionY.current - 12), animated: true });
  };

  const greeting = t(greetingKeyForHour(new Date().getHours()));
  const searchPlaceholder = selectedCategory
    ? t('home.searchPlaceholderCategory', { category: selectedCategory.name.toLowerCase() })
    : t('home.searchPlaceholder');

  return (
    <Screen edges={['top']} background="backgroundMuted">
      <View style={styles.header}>
        <View style={styles.greetingBlock}>
          <ThemedText variant="h2">
            {greeting}
            {profile.data?.first_name ? `, ${profile.data.first_name}` : ''}
          </ThemedText>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={12} color={colors.textSecondary} />
            <ThemedText variant="caption" color="textSecondary">
              {location.status === 'denied' ? 'Cairo, Egypt' : t('home.currentLocation')}
            </ThemedText>
          </View>
        </View>
        <Pressable onPress={() => router.push('/notifications')} style={styles.bellButton}>
          <Ionicons name="notifications-outline" size={18} color={colors.textPrimary} />
          {Boolean(unread.data?.unread_count) && <View style={styles.unreadDot} />}
        </Pressable>
      </View>

      <ScrollView ref={scrollRef} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.push('/(tabs)/home/search')} style={styles.searchBar}>
          <Ionicons name="search" size={16} color={colors.textSecondary} />
          <ThemedText variant="body" color="textSecondary" style={styles.searchPlaceholder}>
            {searchPlaceholder}
          </ThemedText>
        </Pressable>

        <View style={styles.section}>
          {categories.isLoading ? (
            <ActivityIndicator color={colors.brandAccent} />
          ) : categories.isError ? (
            <ThemedText variant="caption" color="textSecondary">
              {t('home.categoriesUnavailable')}
            </ThemedText>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesRow}>
              {categories.data?.map((category) => (
                <CategoryChip
                  key={String(category.id)}
                  name={category.name}
                  selected={selectedCategoryId === category.id}
                  muted={selectedCategoryId !== null && selectedCategoryId !== category.id}
                  onPress={() => toggleCategory(category.id)}
                />
              ))}
            </ScrollView>
          )}
          {selectedCategory ? (
            <Pressable onPress={clearCategoryFilter} style={styles.activeCategoryChip}>
              <ThemedText variant="caption" color="textInverse" style={styles.activeCategoryLabel}>
                {selectedCategory.name}
              </ThemedText>
              <View style={styles.activeCategoryClose}>
                <Ionicons name="close" size={10} color={colors.textInverse} />
              </View>
            </Pressable>
          ) : null}
        </View>

        {showNextUpSection ? (
          <View style={styles.section}>
            {nextUp ? (
              <NextUpCard
                storeName={nextUp.store_name}
                logo={nextUp.store_logo}
                dateLabel={formatCountdown(nextUp.booking_date, formatBookingDateTitle(nextUp.booking_date))}
                timeLabel={formatBookingHourStr(nextUp.booking_date)}
                servicesLabel={nextUp.booking_services_str}
                onPress={() => router.push(`/(tabs)/activity/${nextUp.id}`)}
              />
            ) : (
              <NoNextUpCard onExplore={scrollToMap} />
            )}
          </View>
        ) : null}

        {bookAgain.length ? (
          <View style={styles.section}>
            <SectionHeader title={t('home.bookAgain')} />
            <View style={styles.hscrollWrap}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hscrollContent}>
                {bookAgain.map((booking) => (
                  <BookAgainCard
                    key={booking.id}
                    name={booking.store_name}
                    logo={booking.store_logo}
                    serviceLabel={booking.booking_services_str}
                    ctaLabel={t('home.bookAgain')}
                    onPress={() => router.push(`/venue/${booking.store_id}`)}
                    onCtaPress={() => router.push(`/(modal)/rebook-sheet?bookingId=${booking.id}`)}
                  />
                ))}
              </ScrollView>
              <HScrollFade />
            </View>
          </View>
        ) : null}

        <View style={styles.section} onLayout={(e) => (mapSectionY.current = e.nativeEvent.layout.y)}>
          <NearbyMapPreview pins={mapPins} region={mapRegion} onPress={goExplore} />
        </View>

        <View style={styles.section}>
          <SectionHeader title={t('home.topRatedNearYou')} onSeeAll={goExplore} />
          {nearby.isLoading ? (
            <ActivityIndicator color={colors.brandAccent} />
          ) : topRated.length === 0 ? (
            <EmptyState title={t('home.noStoresNearby')} />
          ) : (
            <View style={styles.hscrollWrap}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hscrollContent}>
                {topRated.map((store, index) => (
                  <TopRatedCard
                    key={store.id}
                    name={store.name}
                    logo={store.logo}
                    rating={store.rating}
                    distanceKm={store.distance_km}
                    badge={index === 0 ? t('home.topRatedBadge') : undefined}
                    onPress={() => router.push(`/venue/${store.id}`)}
                  />
                ))}
              </ScrollView>
              <HScrollFade />
            </View>
          )}
        </View>

        {deals.length ? (
          <View style={styles.section}>
            <SectionHeader title={t('home.dealsThisWeek')} />
            <View style={styles.hscrollWrap}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hscrollContent}>
                {deals.map((offer) => (
                  <DealCard
                    key={offer.id}
                    title={offer.description ?? offer.store_name ?? ''}
                    photo={offer.offer_image}
                    discountPercentage={offer.discount_percentage}
                    originalPrice={offer.original_price}
                    discountedPrice={offer.discounted_price}
                    onPress={() => router.push(`/venue/${offer.store_id}`)}
                  />
                ))}
              </ScrollView>
              <HScrollFade />
            </View>
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  greetingBlock: { gap: spacing.xxs },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xxs },
  bellButton: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  unreadDot: {
    position: 'absolute',
    top: 8,
    right: 9,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.danger,
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
  content: { paddingHorizontal: spacing.md, paddingBottom: spacing.xxl, gap: 20 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 1,
    gap: spacing.xs,
    ...shadows.sm,
  },
  searchPlaceholder: { marginLeft: 0 },
  section: { gap: spacing.sm },
  categoriesRow: { paddingVertical: 2 },
  // Horizontal ScrollViews auto-size to exactly the card height, so without
  // this the card shadows get hard-clipped flush at the edges instead of
  // fading out. Negative margin on the wrap keeps the row's own vertical
  // rhythm unchanged.
  hscrollWrap: { position: 'relative', marginVertical: -10, marginHorizontal: -2 },
  hscrollContent: { paddingVertical: 10, paddingHorizontal: 2 },
  activeCategoryChip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    // Design shows this pill as a dark navy surface, distinct from the
    // brightPurple used for the selected chip ring / Next Up card — `brand`
    // (deepPurple) is the closest existing token for that dark family.
    backgroundColor: colors.brand,
    paddingLeft: spacing.sm + 2,
    paddingRight: spacing.xxs + 2,
    paddingVertical: spacing.xxs + 3,
    borderRadius: radius.pill,
    marginTop: -spacing.xxs,
  },
  activeCategoryLabel: { fontFamily: fontFamily.bodySemiBold },
  activeCategoryClose: {
    width: 18,
    height: 18,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

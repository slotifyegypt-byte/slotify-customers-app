import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Chip } from '@/components/Chip';
import { EmptyState } from '@/components/EmptyState';
import { IconButton } from '@/components/IconButton';
import { PressableScale } from '@/components/PressableScale';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { Skeleton } from '@/components/Skeleton';
import { ThemedText } from '@/components/ThemedText';
import { useMyBookings } from '@/features/booking/hooks/useMyBookings';
import { isMappable } from '@/features/explore-search/api/mappers';
import { useNearbyStores } from '@/features/explore-search/hooks/useNearbyStores';
import { useUnreadNotificationCount } from '@/features/notifications/hooks/useNotifications';
import { useMyProfile } from '@/features/profile/hooks/useProfile';
import { useCustomerLocation } from '@/lib/location/useCustomerLocation';
import { formatDateTitle, formatHour } from '@/lib/time/branchTime';
import { enter, radius, shadows, spacing, useColors, type Colors } from '@/theme';

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
  const colors = useColors();
  const styles = createStyles(colors);
  const location = useCustomerLocation();
  const profile = useMyProfile();
  const unread = useUnreadNotificationCount();
  const categories = useCategories();
  const offers = useHomeOffers();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const selectedCategory = useMemo(
    () => categories.data?.find((c) => c.id === selectedCategoryId) ?? null,
    [categories.data, selectedCategoryId],
  );
  const toggleCategory = (id: string) => setSelectedCategoryId((prev) => (prev === id ? null : id));
  const clearCategoryFilter = () => setSelectedCategoryId(null);

  const nearbyParams = {
    latitude: location.latitude,
    longitude: location.longitude,
    radius_km: 15,
    limit: 20,
  };
  const nearby = useNearbyStores(nearbyParams);

  const upcoming = useMyBookings('confirmed');
  const past = useMyBookings('completed');

  const nextUp = useMemo(() => selectNextUpBooking(upcoming.data), [upcoming.data]);

  const hasBookingHistory = (upcoming.data?.length ?? 0) > 0 || (past.data?.length ?? 0) > 0;
  const showNextUpSection = Boolean(nextUp) || hasBookingHistory;

  const bookAgain = useMemo(() => {
    if (!past.data?.length) return [];
    const seen = new Set<string>();
    // A booking at a deactivated branch can't be rebooked or opened.
    return past.data
      .filter((b) => b.venue_available)
      .filter((b) => (seen.has(b.store_id) ? false : (seen.add(b.store_id), true)))
      .slice(0, 10);
  }, [past.data]);

  const topRated = useMemo(() => {
    if (!nearby.data) return [];
    const source = selectedCategory
      ? nearby.data.filter((s) => s.category_slugs.includes(selectedCategory.slug))
      : nearby.data;
    return [...source].sort((a, b) => b.rating - a.rating).slice(0, 10);
  }, [nearby.data, selectedCategory]);

  const mapPins = useMemo(
    () =>
      topRated
        .slice(0, 6)
        .filter(isMappable)
        .map((store) => ({
          id: store.id,
          categorySlug: store.category_slugs[0] ?? '',
          latitude: store.latitude,
          longitude: store.longitude,
          isOpen: store.status === 'open',
        })),
    [topRated],
  );

  const mapRegion = { latitude: location.latitude, longitude: location.longitude };

  const deals = useMemo(() => {
    if (!offers.data) return [];
    // `offer.category_id` points at `offer_categories`, not the store category
    // chips, so match through the offer's branch categories instead.
    return selectedCategory
      ? offers.data.filter((o) => o.store_category_slugs.includes(selectedCategory.slug))
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
    <Screen edges={['top']}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={enter(0)} style={styles.header}>
          <View style={styles.greetingBlock}>
            {profile.data?.first_name ? (
              <>
                <ThemedText variant="body" color="textTertiary">
                  {greeting}
                </ThemedText>
                <ThemedText variant="h1" numberOfLines={1}>
                  {profile.data.first_name}
                </ThemedText>
              </>
            ) : (
              <ThemedText variant="h1">{greeting}</ThemedText>
            )}
            <View style={styles.locationRow}>
              <Ionicons name="location-sharp" size={13} color={colors.brandAccent} />
              <ThemedText variant="caption" color="textSecondary">
                {location.status === 'denied' ? 'Cairo, Egypt' : t('home.currentLocation')}
              </ThemedText>
            </View>
          </View>
          <View>
            <IconButton
              icon="notifications-outline"
              accessibilityLabel="Notifications"
              onPress={() => router.push('/notifications')}
              size={44}
            />
            {Boolean(unread.data?.unread_count) && <View style={styles.unreadDot} />}
          </View>
        </Animated.View>

        <Animated.View entering={enter(1)}>
          <PressableScale
            onPress={() => router.push('/(tabs)/home/search')}
            accessibilityRole="search"
            accessibilityLabel={searchPlaceholder}
            scaleTo={0.985}
            style={styles.searchBar}
          >
            <Ionicons name="search" size={18} color={colors.textTertiary} />
            <ThemedText
              variant="body"
              color="textTertiary"
              style={styles.searchPlaceholder}
              numberOfLines={1}
            >
              {searchPlaceholder}
            </ThemedText>
          </PressableScale>
        </Animated.View>

        <Animated.View entering={enter(2)} style={styles.section}>
          {categories.isLoading ? (
            <View style={styles.categoriesRow}>
              {[0, 1, 2, 3, 4].map((i) => (
                <View key={i} style={styles.categorySkeleton}>
                  <Skeleton width={64} height={64} radius={32} />
                  <Skeleton width={48} height={10} />
                </View>
              ))}
            </View>
          ) : categories.isError ? (
            <ThemedText variant="caption" color="textSecondary">
              {t('home.categoriesUnavailable')}
            </ThemedText>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesRow}
            >
              {categories.data?.map((category) => (
                <CategoryChip
                  key={String(category.id)}
                  name={category.name}
                  slug={category.slug}
                  selected={selectedCategoryId === category.id}
                  muted={selectedCategoryId !== null && selectedCategoryId !== category.id}
                  onPress={() => toggleCategory(category.id)}
                />
              ))}
            </ScrollView>
          )}
          {selectedCategory ? (
            <View style={styles.activeCategory}>
              <Chip
                label={selectedCategory.name}
                selected
                icon="close"
                onPress={clearCategoryFilter}
              />
            </View>
          ) : null}
        </Animated.View>

        {showNextUpSection ? (
          <Animated.View entering={enter(3)}>
            {nextUp ? (
              <NextUpCard
                storeName={nextUp.store_name}
                logo={nextUp.store_logo}
                dateLabel={formatCountdown(
                  nextUp.booking_date,
                  formatDateTitle(nextUp.booking_date, nextUp.timezone),
                )}
                timeLabel={formatHour(nextUp.booking_date, nextUp.timezone)}
                servicesLabel={nextUp.booking_services_str}
                onPress={() => router.push(`/(tabs)/activity/${nextUp.id}`)}
              />
            ) : (
              <NoNextUpCard onExplore={scrollToMap} />
            )}
          </Animated.View>
        ) : null}

        {bookAgain.length ? (
          <Animated.View entering={enter(4)} style={styles.section}>
            <SectionHeader title={t('home.bookAgain')} />
            <View style={styles.hscrollWrap}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.hscrollContent}
              >
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
          </Animated.View>
        ) : null}

        <Animated.View
          entering={enter(5)}
          style={styles.section}
          onLayout={(e) => (mapSectionY.current = e.nativeEvent.layout.y)}
        >
          <NearbyMapPreview pins={mapPins} region={mapRegion} onPress={goExplore} />
        </Animated.View>

        <Animated.View entering={enter(6)} style={styles.section}>
          <SectionHeader title={t('home.topRatedNearYou')} onSeeAll={goExplore} />
          {nearby.isLoading ? (
            <View style={styles.skeletonRow}>
              {[0, 1].map((i) => (
                <Skeleton key={i} width={172} height={176} radius={20} />
              ))}
            </View>
          ) : topRated.length === 0 ? (
            <EmptyState icon="storefront-outline" title={t('home.noStoresNearby')} />
          ) : (
            <View style={styles.hscrollWrap}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.hscrollContent}
              >
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
        </Animated.View>

        {deals.length ? (
          <Animated.View entering={enter(7)} style={styles.section}>
            <SectionHeader title={t('home.dealsThisWeek')} />
            <View style={styles.hscrollWrap}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.hscrollContent}
              >
                {deals.map((offer) => (
                  <DealCard
                    key={offer.id}
                    title={offer.title || offer.description || offer.store_name}
                    photo={offer.offer_image}
                    discountPercentage={offer.discount_percentage}
                    originalPrice={offer.original_price}
                    discountedPrice={offer.discounted_price}
                    currency={offer.currency}
                    placeholderName={offer.store_name}
                    onPress={() => router.push(`/venue/${offer.store_id}`)}
                  />
                ))}
              </ScrollView>
              <HScrollFade />
            </View>
          </Animated.View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      paddingTop: spacing.sm,
    },
    greetingBlock: { flex: 1, minWidth: 0, gap: 2 },
    locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.xs },
    unreadDot: {
      position: 'absolute',
      top: 9,
      right: 10,
      width: 9,
      height: 9,
      borderRadius: 5,
      backgroundColor: colors.danger,
      borderWidth: 2,
      borderColor: colors.surface,
    },
    content: { paddingHorizontal: spacing.gutter, paddingBottom: 120, gap: 28 },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: radius.pill,
      borderWidth: StyleSheet.hairlineWidth * 2,
      borderColor: colors.border,
      minHeight: 54,
      paddingHorizontal: spacing.md,
      gap: spacing.xs + 2,
      ...shadows.sm,
    },
    searchPlaceholder: { flex: 1 },
    section: { gap: spacing.sm },
    categoriesRow: { flexDirection: 'row', paddingVertical: 6, paddingLeft: 4 },
    categorySkeleton: { alignItems: 'center', gap: 8, width: 72, marginRight: spacing.xs },
    activeCategory: { alignSelf: 'flex-start' },
    skeletonRow: { flexDirection: 'row', gap: spacing.sm },
    // Horizontal ScrollViews auto-size to exactly the card height, so without this the card shadows get
    // hard-clipped flush at the edges instead of fading out. The negative margin keeps the row's own rhythm.
    hscrollWrap: { position: 'relative', marginVertical: -12, marginHorizontal: -spacing.gutter },
    hscrollContent: { paddingVertical: 12, paddingHorizontal: spacing.gutter },
  });

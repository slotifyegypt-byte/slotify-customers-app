import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { IconButton } from '@/components/IconButton';
import { Screen } from '@/components/Screen';
import { Skeleton } from '@/components/Skeleton';
import { ThemedText } from '@/components/ThemedText';
import type { Service } from '@/features/booking/api/schemas';
import { useConfirmBooking } from '@/features/booking/hooks/useConfirmBooking';
import { useMyBookings } from '@/features/booking/hooks/useMyBookings';
import { useStoreServices } from '@/features/booking/hooks/useStoreServices';
import { formatDraftSummary, useDraftEntries } from '@/features/booking/state/bookingDraftStore';
import { useStoreDetail } from '@/features/explore-search/hooks/useStoreDetail';
import {
  useFavouriteCheck,
  useToggleFavourite,
} from '@/features/favourites/hooks/useToggleFavourite';
import { useCategories } from '@/features/home/hooks/useHomeData';
import { useCustomerLocation } from '@/lib/location/useCustomerLocation';
import { formatMoney } from '@/lib/money';
import { formatDate } from '@/lib/time/branchTime';
import { enter, radius, shadows, spacing, useColors, type Colors } from '@/theme';

import { AboutTab } from '../components/AboutTab';
import { ReviewsTab } from '../components/ReviewsTab';
import { ServicesTab } from '../components/ServicesTab';
import { VenueHeader } from '../components/VenueHeader';
import { VenueTabBar, type VenueTab } from '../components/VenueTabBar';
import { useVenueGallery } from '../hooks/useVenueGallery';
import { useVenueHours } from '../hooks/useVenueHours';
import { useVenueReviewStats, useVenueReviews } from '../hooks/useVenueReviews';
import { useVenueTeam } from '../hooks/useVenueTeam';

export function VenueDetailScreen() {
  const colors = useColors();
  const styles = createStyles(colors);
  const { storeId } = useLocalSearchParams<{ storeId: string }>();
  const [activeTab, setActiveTab] = useState<VenueTab>('services');

  // Passing the customer's own location gets `distance_km` back on the
  // response (customer-app-api-map.md §5) — same pattern Home/Explore use
  // for the nearby-stores fetch. useCustomerLocation always returns coordinates
  // immediately (a Cairo fallback until permission/GPS resolves), so this
  // just uses whatever it currently has rather than waiting.
  const location = useCustomerLocation();
  const storeDetail = useStoreDetail(storeId, {
    latitude: location.latitude ?? undefined,
    longitude: location.longitude ?? undefined,
  });
  const categories = useCategories();
  const favouriteCheck = useFavouriteCheck(storeId);
  const { add, remove } = useToggleFavourite(storeId);

  const gallery = useVenueGallery(storeId);
  const team = useVenueTeam(storeId);

  const services = useStoreServices(storeId);

  const { calendar, specialDays } = useVenueHours(storeId, storeDetail.data?.timezone);

  const reviewStats = useVenueReviewStats(storeId);
  const reviews = useVenueReviews(storeId, { limit: 20, offset: 0 });

  // "Write a review" eligibility: a review belongs to one completed booking
  // and each booking takes at most one, so the customer can review this venue
  // only while they have a completed, not-yet-reviewed booking here. Reuses
  // the bookings list the Activity tab already fetches; the write screen
  // is given that booking.
  const completedBookings = useMyBookings('completed');
  const reviewableBooking = (completedBookings.data ?? []).find(
    (booking) => booking.store_id === storeId && !booking.has_review,
  );
  const canReview = reviewableBooking !== undefined;

  // Multi-service booking draft built up across "+ Add Service" round trips
  // to the booking config screen and back (24-booking-configure.png flow).
  const draftEntries = useDraftEntries(storeId);
  const draftEntryList = useMemo(() => Object.values(draftEntries), [draftEntries]);
  // "Today"/"Tomorrow" in the summaries means the branch's day.
  const branchTimezone = storeDetail.data?.timezone;
  const draftSummaryByServiceId = useMemo(
    () =>
      branchTimezone
        ? Object.fromEntries(
            draftEntryList.map((entry) => [
              entry.service.id,
              formatDraftSummary(entry, branchTimezone),
            ]),
          )
        : {},
    [draftEntryList, branchTimezone],
  );
  const draftTotal = draftEntryList.reduce((sum, entry) => sum + entry.service.price, 0);
  const { confirm: confirmDraft, isPending: isConfirmingDraft } = useConfirmBooking(storeId);
  const [draftError, setDraftError] = useState<string | null>(null);

  // On a slot conflict useConfirmBooking drops only the entries that lost
  // their slot from the draft (the bar updates) and the message names them.
  const handleConfirmDraft = async () => {
    setDraftError(null);
    const outcome = await confirmDraft(draftEntryList, 'Something went wrong. Please try again.'); // TODO i18n
    if (outcome.status === 'booked') {
      router.push({ pathname: '/(modal)/confirmation', params: { bookingId: outcome.id } });
    } else if (outcome.status === 'failed') {
      setDraftError(outcome.message);
    }
  };

  if (storeDetail.isLoading) {
    return (
      <Screen edges={['bottom']} style={styles.screen}>
        <VenueSkeleton onBack={() => router.back()} />
      </Screen>
    );
  }

  if (storeDetail.isError || !storeDetail.data) {
    return (
      <Screen style={styles.screen}>
        <View style={styles.errorBack}>
          <IconButton
            icon="arrow-back"
            accessibilityLabel="Go back" /* TODO i18n */
            onPress={() => router.back()}
            size={44}
          />
        </View>
        <EmptyState
          icon="cloud-offline-outline"
          title="Couldn't load this venue" // TODO i18n
          body="Check your connection and try again." // TODO i18n
          actionLabel="Retry" // TODO i18n
          onAction={() => storeDetail.refetch()}
        />
      </Screen>
    );
  }

  const store = storeDetail.data;
  const categoryLabel =
    categories.data?.find((category) => store.category_slugs.includes(category.slug))?.name ?? null;
  const isFavourite = favouriteCheck.data?.is_favourite ?? false;

  const handleToggleFavourite = () => {
    // The heart flips instantly via useToggleFavourite's optimistic update;
    // this only needs to surface the rare failure case, since silently
    // reverting with no explanation just looks like "favouriting doesn't
    // work".
    const onError = () => Alert.alert("Couldn't update favourites", 'Please try again.'); // TODO i18n
    if (isFavourite) {
      remove.mutate(undefined, { onError });
    } else {
      add.mutate(undefined, { onError });
    }
  };

  const handleBook = (service: Service) => {
    router.push(`/booking/${storeId}/configure?serviceId=${service.id}`);
  };

  const handleOpenDirections = () => {
    Linking.openURL(
      `https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}`,
    );
  };

  // The cheapest listed service, for the "From" price beside the Book now button.
  const startingPrice = (services.data ?? []).reduce<number | null>(
    (min, service) => (min === null || service.price < min ? service.price : min),
    null,
  );
  const hasServices = (services.data?.length ?? 0) > 0;

  return (
    <Screen edges={['bottom']} style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <VenueHeader
          name={store.name}
          categoryLabel={categoryLabel}
          rating={store.rating}
          reviewCount={reviewStats.data?.total_reviews ?? null}
          distanceKm={store.distance_km ?? null}
          status={store.status}
          photos={!gallery.isError ? (gallery.data ?? []) : []}
          coverImage={store.logo}
          // TODO: build a share URL from `store.share_slug` once the public web domain is defined (backend gap).
          shareLink={null}
          isFavourite={isFavourite}
          isFavouriteLoading={add.isPending || remove.isPending}
          onToggleFavourite={handleToggleFavourite}
          onBack={() => router.back()}
          onOpenDirections={handleOpenDirections}
        />

        <VenueTabBar active={activeTab} onChange={setActiveTab} />

        <Animated.View key={activeTab} entering={enter(0)}>
          {activeTab === 'services' ? (
            <ServicesTab
              services={services.data ?? []}
              isLoading={services.isLoading}
              isError={services.isError}
              onRetry={() => services.refetch()}
              onBook={handleBook}
              draftSummaryByServiceId={draftSummaryByServiceId}
            />
          ) : null}

          {activeTab === 'about' ? (
            <AboutTab
              store={store}
              calendarDays={calendar.data ?? []}
              specialDays={specialDays.data ?? []}
              photos={!gallery.isError ? (gallery.data ?? []) : []}
              // Hidden when empty/errored rather than showing a broken-looking section.
              team={!team.isError ? (team.data ?? []) : []}
              isLoading={calendar.isLoading || specialDays.isLoading}
              isError={calendar.isError || specialDays.isError}
            />
          ) : null}

          {activeTab === 'reviews' ? (
            <ReviewsTab
              stats={reviewStats.data}
              timezone={store.timezone}
              reviews={reviews.data ?? []}
              isLoading={reviewStats.isLoading || reviews.isLoading}
              isError={reviewStats.isError || reviews.isError}
              canReview={canReview}
              onWriteReview={() => {
                if (!reviewableBooking) return;
                router.push({
                  pathname: '/(modal)/write-review',
                  params: {
                    storeId,
                    bookingId: reviewableBooking.id,
                    serviceName: reviewableBooking.booking_services_str,
                    date: formatDate(reviewableBooking.booking_date, reviewableBooking.timezone),
                  },
                });
              }}
            />
          ) : null}
        </Animated.View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Also shown with only an error: a slot conflict can empty the draft,
          and the customer still needs to see why it vanished. */}
      {draftEntryList.length > 0 || draftError ? (
        <View style={styles.bar}>
          {draftError ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={18} color={colors.danger} />
              <ThemedText variant="caption" color="danger" style={styles.errorText}>
                {draftError}
              </ThemedText>
            </View>
          ) : null}
          {draftEntryList.length > 0 ? (
            <View style={styles.barRow}>
              <View style={styles.barSummary}>
                <ThemedText variant="caption" color="textSecondary">
                  {/* TODO i18n */}
                  {draftEntryList.length} service{draftEntryList.length > 1 ? 's' : ''} selected
                </ThemedText>
                <ThemedText variant="h3">
                  {formatMoney(draftTotal, draftEntryList[0].service.currency)}
                </ThemedText>
              </View>
              <Button
                label={/* TODO i18n */ 'Confirm booking'}
                fullWidth={false}
                style={styles.barButton}
                onPress={handleConfirmDraft}
                loading={isConfirmingDraft}
              />
            </View>
          ) : null}
        </View>
      ) : hasServices && startingPrice !== null ? (
        <View style={styles.bar}>
          <View style={styles.barRow}>
            <View style={styles.barSummary}>
              <ThemedText variant="caption" color="textSecondary">
                Starting from {/* TODO i18n */}
              </ThemedText>
              <ThemedText variant="h3">
                {formatMoney(startingPrice, services.data?.[0]?.currency ?? store.currency)}
              </ThemedText>
            </View>
            <Button
              label={/* TODO i18n */ 'Book now'}
              fullWidth={false}
              style={styles.barButton}
              onPress={() => router.push(`/booking/${storeId}/configure`)}
            />
          </View>
        </View>
      ) : null}
    </Screen>
  );
}

/** The venue page's final layout in grey: photo, name block, tabs, and a few service cards. */
function VenueSkeleton({ onBack }: { onBack: () => void }) {
  const styles = createStyles(useColors());
  return (
    <ScrollView scrollEnabled={false}>
      <Skeleton height={288} radius={0} />
      <View style={styles.skeletonBack}>
        <IconButton
          variant="overlay"
          icon="arrow-back"
          size={44}
          onPress={onBack}
          accessibilityLabel="Go back"
        />
      </View>
      <View style={styles.skeletonBody}>
        <Skeleton width="70%" height={32} />
        <Skeleton width={110} height={18} />
        <Skeleton width="55%" height={18} />
        <Skeleton height={44} radius={radius.pill} style={styles.skeletonTabs} />
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} height={108} radius={radius.lg} />
        ))}
      </View>
    </ScrollView>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    screen: { padding: 0 },
    errorBack: { paddingHorizontal: spacing.md, paddingTop: spacing.sm, alignItems: 'flex-start' },
    bottomSpacer: { height: spacing.xl },
    skeletonBack: { position: 'absolute', top: spacing.md, start: spacing.md },
    skeletonBody: { padding: spacing.gutter, gap: spacing.sm },
    skeletonTabs: { marginTop: spacing.md, marginBottom: spacing.xs },
    bar: {
      backgroundColor: colors.surface,
      borderTopWidth: StyleSheet.hairlineWidth * 2,
      borderTopColor: colors.border,
      paddingHorizontal: spacing.gutter,
      paddingVertical: spacing.sm,
      gap: spacing.xs,
      ...shadows.md,
    },
    barRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    barSummary: { flex: 1, minWidth: 0 },
    barButton: { minWidth: 160 },
    errorBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      backgroundColor: colors.dangerTint,
      borderRadius: radius.md,
      padding: spacing.sm,
    },
    errorText: { flex: 1 },
  });

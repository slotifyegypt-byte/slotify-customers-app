import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Linking, ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { draftEntryToPayload } from '@/features/booking/api/bookingApi';
import type { Service } from '@/features/booking/api/schemas';
import { useCreateBooking } from '@/features/booking/hooks/useCreateBooking';
import { useMyBookings } from '@/features/booking/hooks/useMyBookings';
import { useStoreServices } from '@/features/booking/hooks/useStoreServices';
import { formatDraftSummary, useBookingDraftStore, useDraftEntries } from '@/features/booking/state/bookingDraftStore';
import { getBookingErrorMessage } from '@/features/booking/utils/apiError';
import { useStoreDetail } from '@/features/explore-search/hooks/useStoreDetail';
import { useFavouriteCheck, useToggleFavourite } from '@/features/favourites/hooks/useToggleFavourite';
import { useCategories } from '@/features/home/hooks/useHomeData';
import { useCustomerLocation } from '@/lib/location/useCustomerLocation';
import { colors, spacing } from '@/theme';

import { AboutTab } from '../components/AboutTab';
import { ReviewsTab } from '../components/ReviewsTab';
import { ServicesTab } from '../components/ServicesTab';
import { TeamSection } from '../components/TeamSection';
import { VenueHeader } from '../components/VenueHeader';
import { VenueTabBar, type VenueTab } from '../components/VenueTabBar';
import { useVenueGallery } from '../hooks/useVenueGallery';
import { useVenueHours } from '../hooks/useVenueHours';
import { useVenueReviewStats, useVenueReviews } from '../hooks/useVenueReviews';
import { useVenueServiceCategories } from '../hooks/useVenueServiceCategories';
import { useVenueTeam } from '../hooks/useVenueTeam';

export function VenueDetailScreen() {
  const { storeId } = useLocalSearchParams<{ storeId: string }>();
  const [activeTab, setActiveTab] = useState<VenueTab>('services');

  // Passing the customer's own location gets `distance_km` back on the
  // response (customer-app-api-map.md §5) — same pattern Home/Explore use
  // for the nearby-stores fetch. `location.latitude`/`longitude` are `null`
  // until permission resolves, so useStoreDetail simply omits them until then.
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
  const serviceCategories = useVenueServiceCategories(storeId);

  const { calendar, specialDays } = useVenueHours(storeId);

  const reviewStats = useVenueReviewStats(storeId);
  const reviews = useVenueReviews(storeId, { limit: 20, offset: 0 });

  // "Write a review" eligibility: there's no dedicated eligibility endpoint
  // and `ReviewCreate` has no booking_id to check against directly
  // (customer-app-api-map.md §5), but a completed booking at this store is
  // the closest real signal available — reuses the same bookings list the
  // Activity tab already fetches rather than inventing a new call.
  const completedBookings = useMyBookings('completed');
  const canReview = (completedBookings.data ?? []).some((booking) => booking.store_id === storeId);

  // Multi-service booking draft built up across "+ Add Service" round trips
  // to the booking config screen and back (24-booking-configure.png flow).
  const draftEntries = useDraftEntries(storeId);
  const clearDraft = useBookingDraftStore((state) => state.clear);
  const draftEntryList = useMemo(() => Object.values(draftEntries), [draftEntries]);
  const draftSummaryByServiceId = useMemo(
    () => Object.fromEntries(draftEntryList.map((entry) => [entry.service.id, formatDraftSummary(entry)])),
    [draftEntryList],
  );
  const draftTotal = draftEntryList.reduce((sum, entry) => sum + entry.service.price, 0);
  const createBooking = useCreateBooking();
  const [draftError, setDraftError] = useState<string | null>(null);

  const handleConfirmDraft = async () => {
    setDraftError(null);
    try {
      const booking = await createBooking.mutateAsync({
        storeId,
        services: draftEntryList.map(draftEntryToPayload),
      });
      clearDraft(storeId);
      router.push({ pathname: '/(modal)/confirmation', params: { bookingId: booking.id } });
    } catch (error) {
      setDraftError(getBookingErrorMessage(error, "Something went wrong. Please try again.")); // TODO i18n
    }
  };

  if (storeDetail.isLoading) {
    return (
      <Screen style={styles.centered}>
        <ActivityIndicator color={colors.brand} />
      </Screen>
    );
  }

  if (storeDetail.isError || !storeDetail.data) {
    return (
      <Screen style={styles.centered}>
        <EmptyState
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
    categories.data?.find((category) => category.id === store.category_id)?.name ?? null;
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
    Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}`);
  };

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
          photos={!gallery.isError ? gallery.data ?? [] : []}
          coverImage={store.logo}
          shareLink={store.share_link}
          isFavourite={isFavourite}
          isFavouriteLoading={add.isPending || remove.isPending}
          onToggleFavourite={handleToggleFavourite}
          onBack={() => router.back()}
          onOpenDirections={handleOpenDirections}
        />

        {/* Team strip — hidden if empty/errored rather than showing a
            broken-looking section. */}
        {!team.isError && team.data && team.data.length > 0 ? <TeamSection members={team.data} /> : null}

        <VenueTabBar active={activeTab} onChange={setActiveTab} />

        {activeTab === 'services' ? (
          <ServicesTab
            services={services.data ?? []}
            categories={serviceCategories.data ?? []}
            isLoading={services.isLoading}
            isError={services.isError}
            onBook={handleBook}
            draftSummaryByServiceId={draftSummaryByServiceId}
          />
        ) : null}

        {activeTab === 'about' ? (
          <AboutTab
            store={store}
            calendarDays={calendar.data ?? []}
            specialDays={specialDays.data ?? []}
            photos={!gallery.isError ? gallery.data ?? [] : []}
            isLoading={calendar.isLoading || specialDays.isLoading}
            isError={calendar.isError || specialDays.isError}
          />
        ) : null}

        {activeTab === 'reviews' ? (
          <ReviewsTab
            stats={reviewStats.data}
            reviews={reviews.data ?? []}
            isLoading={reviewStats.isLoading || reviews.isLoading}
            isError={reviewStats.isError || reviews.isError}
            canReview={canReview}
            onWriteReview={() => router.push({ pathname: '/(modal)/write-review', params: { storeId } })}
          />
        ) : null}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {draftEntryList.length > 0 ? (
        <View style={styles.draftBar}>
          {draftError ? (
            <ThemedText variant="caption" color="danger" style={styles.draftError}>
              {draftError}
            </ThemedText>
          ) : null}
          <View style={styles.draftBarRow}>
            <View>
              <ThemedText variant="caption" color="textSecondary">
                {/* TODO i18n */}
                {draftEntryList.length} service{draftEntryList.length > 1 ? 's' : ''} configured
              </ThemedText>
              <ThemedText variant="h3">
                {draftEntryList[0].service.price_symbol}
                {draftTotal.toFixed(0)}
              </ThemedText>
            </View>
            <Button
              label={/* TODO i18n */ 'Confirm Booking'}
              variant="accent"
              fullWidth={false}
              style={styles.draftConfirmButton}
              onPress={handleConfirmDraft}
              loading={createBooking.isPending}
            />
          </View>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { padding: 0 },
  centered: { alignItems: 'center', justifyContent: 'center' },
  bottomSpacer: { height: 32 },
  draftBar: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  draftError: { marginBottom: spacing.xs },
  draftBarRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  draftConfirmButton: { paddingHorizontal: spacing.lg, minWidth: 168 },
});

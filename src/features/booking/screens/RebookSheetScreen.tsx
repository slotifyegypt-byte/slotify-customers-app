import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';

import type { BookingRead } from '../api/schemas';
import { BookingFlow } from '../components/BookingFlow';
import { BookingSkeleton } from '../components/BookingSkeleton';
import { useBookingDetail } from '../hooks/useBookingDetail';
import { useStoreServices } from '../hooks/useStoreServices';

// developer-guide.md §6: rebook is a normal `POST bookings` prefilled from a
// past booking (same branch, service and, for specialist services, the
// same specialist), with a new time from availability. No dedicated
// endpoint. The branch id and timezone come from the past booking itself.
// Only the first service on the original booking is rebooked (the common
// case, and the only shape the doc's samples show); a notice at the top warns
// the customer if the original booking had more than one.
export function RebookSheetScreen() {
  const { t } = useTranslation();
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const original = useBookingDetail(bookingId);

  const handleBooked = (booking: { id: string }) => {
    router.replace({ pathname: '/(modal)/confirmation', params: { bookingId: booking.id } });
  };

  if (original.isLoading) {
    return (
      <Screen style={styles.container}>
        <BookingSkeleton />
      </Screen>
    );
  }

  if (original.isError || !original.data) {
    return (
      <Screen style={styles.container}>
        <ScreenHeader title="" />
        <EmptyState
          icon="cloud-offline-outline"
          title={t('common.errorGeneric')}
          actionLabel={t('common.retry')}
          onAction={() => original.refetch()}
        />
      </Screen>
    );
  }

  return <RebookFlow originalBooking={original.data} onBooked={handleBooked} />;
}

function RebookFlow({
  originalBooking,
  onBooked,
}: {
  originalBooking: BookingRead;
  onBooked: (booking: { id: string }) => void;
}) {
  const { t } = useTranslation();
  // Guard: only mount useStoreServices once we have a real storeId, avoiding
  // a wasted request with an empty id while `original` above is loading.
  const services = useStoreServices(originalBooking.store_id);
  const firstService = originalBooking.booking_services[0];

  const matchedService = useMemo(
    () => services.data?.find((service) => service.id === firstService?.service_id),
    [services.data, firstService],
  );

  if (services.isLoading) {
    return (
      <Screen style={styles.container}>
        <BookingSkeleton title={firstService?.service_name} subtitle={originalBooking.store_name} />
      </Screen>
    );
  }

  if (services.isError || !firstService || !matchedService) {
    return (
      <Screen style={styles.container}>
        <ScreenHeader title={originalBooking.store_name} />
        <EmptyState
          icon="cloud-offline-outline"
          title={t('common.errorGeneric')}
          actionLabel={t('common.retry')}
          onAction={() => services.refetch()}
        />
      </Screen>
    );
  }

  return (
    <Screen style={styles.container}>
      <BookingFlow
        key={matchedService.id}
        storeId={originalBooking.store_id}
        service={matchedService}
        storeName={originalBooking.store_name}
        timezone={originalBooking.timezone}
        initialEmployeeId={matchedService.requires_specialist ? firstService.employee_id : null}
        notice={
          originalBooking.booking_services.length > 1
            ? t('booking.rebookNotice', { name: matchedService.name })
            : undefined
        }
        onBooked={onBooked}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});

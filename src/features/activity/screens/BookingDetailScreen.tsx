import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import type { ComponentProps } from 'react';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ThemedText } from '@/components/ThemedText';
import type { BookingRead, BookingStatus } from '@/features/booking/api/schemas';
import { useBookingDetail } from '@/features/booking/hooks/useBookingDetail';
import { formatBookingDateStr, formatBookingDateTitle, formatBookingHourStr } from '@/features/booking/utils/time';
import { useStoreDetail } from '@/features/explore-search/hooks/useStoreDetail';
import { formatCountdown } from '@/features/home/utils/countdown';
import { fontFamily, radius, spacing, useColors, type Colors } from '@/theme';

import { useStoreTeam } from '../hooks/useStoreTeam';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

export function BookingDetailScreen() {
  const colors = useColors();
  const styles = createStyles(colors);
  const { t } = useTranslation();
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const booking = useBookingDetail(bookingId);

  // Only fetched when at least one service is specialist-mode, to resolve
  // `employee_id` -> a display name (§9; see api/teamApi.ts for why this
  // lookup is needed instead of a field already on the booking).
  const hasSpecialistService = booking.data?.booking_services.some((s) => s.employee_id) ?? false;
  const team = useStoreTeam(hasSpecialistService ? booking.data?.store_id : undefined);
  // Directions (real lat/lng) and Call (real phone) both need the full store
  // record — BookingRead only carries store_name/address/logo — so this is
  // fetched the same way WriteReviewScreen/VenueDetailScreen already do.
  const store = useStoreDetail(booking.data?.store_id ?? '', {
    enabled: Boolean(booking.data?.store_id),
  });

  if (booking.isLoading) {
    return (
      <Screen>
        <ScreenHeader title="" />
        <View style={styles.centered}>
          <ActivityIndicator color={colors.brand} />
        </View>
      </Screen>
    );
  }

  if (booking.isError || !booking.data) {
    return (
      <Screen>
        <ScreenHeader title="" />
        <View style={styles.centered}>
          <EmptyState
            title={t('common.errorGeneric')}
            actionLabel={t('common.retry')}
            onAction={() => booking.refetch()}
          />
        </View>
      </Screen>
    );
  }

  const data = booking.data;
  // §0.1/§0.2 — VERIFIED against live /openapi.json + response shapes
  // (2026-09-20): BookingRead now returns a server-computed `booking_type`,
  // replacing the old "every service has no employee_id" inference.
  // "drop_off" = capacity mode (tailoring, car wash/repair, detailing);
  // "appointment" = specialist mode (barber/salon/spa).
  const isOrder = data.booking_type === 'drop_off';
  const canCancel = data.booking_status === 'pending' || data.booking_status === 'confirmed';
  const canReview = data.booking_status === 'completed';

  const employeeName = (employeeId: string) => {
    const member = team.data?.find((m) => m.id === employeeId);
    if (!member) return null;
    return [member.first_name, member.last_name].filter(Boolean).join(' ');
  };

  const handleDirections = () => {
    if (!store.data) return;
    Linking.openURL(
      `https://www.google.com/maps/dir/?api=1&destination=${store.data.latitude},${store.data.longitude}`,
    );
  };

  // New endpoint — VERIFIED against live /openapi.json + response shapes
  // (2026-09-20): PUT /bookings/services/{booking_service_id}/reschedule/my-booking.
  // Time-only (same assigned specialist), so this only ever targets the
  // specialist-mode service on the booking — the same one whose
  // employee_id resolves `employeeLabel` in AppointmentDetail below.
  const specialistServiceForReschedule = data.booking_services.find((s) => s.employee_id);
  const handleReschedule = () => {
    if (!specialistServiceForReschedule) return;
    router.push({
      pathname: '/(modal)/reschedule-booking',
      params: { bookingId: data.id, bookingServiceId: String(specialistServiceForReschedule.id) },
    });
  };

  const handleWriteReview = () =>
    router.push({
      pathname: '/(modal)/write-review',
      params: {
        storeId: data.store_id,
        // `canReview` above already gates this handler behind
        // `booking_status === 'completed'`, which is exactly the
        // eligibility the backend enforces for `ReviewCreate.booking_id`
        // (VERIFIED against live /openapi.json, 2026-09-20) — so `data.id`
        // is always a valid value to forward here.
        bookingId: data.id,
        serviceName: data.booking_services.map((s) => s.service_name).join(', '),
        date: formatBookingDateStr(data.booking_date),
      },
    });

  return (
    <Screen style={styles.container}>
      <ScreenHeader title={isOrder ? 'Your Order' : 'Appointment'} /* TODO i18n */ />
      <ScrollView contentContainerStyle={styles.content}>
        {isOrder ? (
          <OrderDetail
            data={data}
            store={store.data}
            onWriteReview={canReview ? handleWriteReview : undefined}
          />
        ) : (
          <AppointmentDetail
            data={data}
            employeeName={employeeName}
            canDirections={Boolean(store.data)}
            canReschedule={Boolean(specialistServiceForReschedule)}
            canCancel={canCancel}
            canReview={canReview}
            onDirections={handleDirections}
            onReschedule={handleReschedule}
            onCancel={() => router.push(`/(modal)/cancel-booking?bookingId=${data.id}`)}
            onWriteReview={handleWriteReview}
          />
        )}
      </ScrollView>
    </Screen>
  );
}

// ---------------------------------------------------------------------------
// Appointment (confirmed, specialist-mode) — 06-venue-detail.png
// ---------------------------------------------------------------------------

// Reuses the Home "Next Up" card's countdown formatter (In 45 min / In 2h)
// so the same pill reads identically wherever a confirmed booking's start
// time is shown. `formatCountdown` falls back to its second argument once
// the appointment is more than a few hours out or already started — an
// empty-string fallback means "hide the pill" here.
function appointmentCountdown(dateIso: string, status: BookingStatus): string | null {
  if (status !== 'confirmed') return null;
  const label = formatCountdown(dateIso, '');
  return label || null;
}

function AppointmentDetail({
  data,
  employeeName,
  canDirections,
  canReschedule,
  canCancel,
  canReview,
  onDirections,
  onReschedule,
  onCancel,
  onWriteReview,
}: {
  data: BookingRead;
  employeeName: (id: string) => string | null;
  canDirections: boolean;
  canReschedule: boolean;
  canCancel: boolean;
  canReview: boolean;
  onDirections: () => void;
  onReschedule: () => void;
  onCancel: () => void;
  onWriteReview: () => void;
}) {
  const colors = useColors();
  const styles = createStyles(colors);
  const countdown = appointmentCountdown(data.booking_date, data.booking_status);
  const specialistService = data.booking_services.find((s) => s.employee_id);
  const employeeLabel = specialistService?.employee_id
    ? employeeName(specialistService.employee_id)
    : null;

  return (
    <>
      <View style={styles.heroCard}>
        <ThemedText variant="caption" color="textInverse" style={styles.heroStatusLabel}>
          {/* TODO i18n */}
          {data.booking_status.toUpperCase()}
        </ThemedText>
        <ThemedText variant="h2" color="textInverse">
          {data.store_name}
        </ThemedText>
        <View style={styles.heroSubRow}>
          {data.store_logo ? (
            <Image source={{ uri: data.store_logo }} style={styles.heroAvatar} contentFit="cover" />
          ) : (
            <View style={[styles.heroAvatar, styles.heroAvatarFallback]} />
          )}
          <ThemedText variant="body" color="textInverse" style={styles.heroSubText}>
            {formatBookingDateTitle(data.booking_date)} · {formatBookingHourStr(data.booking_date)}
            {employeeLabel ? ` · ${employeeLabel}` : ''}
          </ThemedText>
        </View>
        {countdown ? (
          <View style={styles.countdownPill}>
            <ThemedText variant="caption" color="textOnBrand" style={styles.countdownLabel}>
              {countdown}
            </ThemedText>
          </View>
        ) : null}
      </View>

      <View style={styles.infoCard}>
        <InfoRow
          icon="location-outline"
          label={/* TODO i18n */ 'Location'}
          value={data.store_address}
        />
        <InfoRow
          icon="briefcase-outline"
          label={/* TODO i18n */ 'Service'}
          value={data.booking_services_str}
        />
        <InfoRow
          icon="pricetag-outline"
          label={/* TODO i18n */ 'Price'}
          value={
            `${data.total_price} EGP` /* TODO i18n: currency hardcoded — no price_symbol field on BookingRead */
          }
        />
      </View>

      <View style={styles.actionRow}>
        <Pressable style={styles.outlineButton} onPress={onDirections} disabled={!canDirections}>
          <Ionicons
            name="navigate-outline"
            size={16}
            color={canDirections ? colors.brand : colors.disabledText}
          />
          <ThemedText
            variant="button"
            color={canDirections ? 'brand' : 'disabledText'}
            style={styles.outlineButtonLabel}
          >
            {/* TODO i18n */}
            Directions
          </ThemedText>
        </Pressable>
        <Pressable
          style={[styles.outlineButton, styles.outlineButtonSpacing]}
          onPress={onReschedule}
          disabled={!canReschedule}
        >
          <Ionicons
            name="calendar-outline"
            size={16}
            color={canReschedule ? colors.brand : colors.disabledText}
          />
          <ThemedText
            variant="button"
            color={canReschedule ? 'brand' : 'disabledText'}
            style={styles.outlineButtonLabel}
          >
            {/* TODO i18n */}
            Reschedule
          </ThemedText>
        </Pressable>
      </View>

      {canCancel ? (
        <ThemedText variant="caption" color="textSecondary" style={styles.freeCancelNote}>
          {/* TODO i18n */}
          Free cancellation up to 2 hours before your appointment.
        </ThemedText>
      ) : null}

      {canReview ? (
        <Button
          label={/* TODO i18n */ 'Write a review'}
          variant="ghost"
          style={styles.reviewButton}
          onPress={onWriteReview}
        />
      ) : null}

      {canCancel ? (
        <Pressable onPress={onCancel} style={styles.cancelLink} hitSlop={8}>
          <ThemedText variant="bodyMedium" color="danger">
            {/* TODO i18n */}
            Cancel appointment
          </ThemedText>
        </Pressable>
      ) : null}
    </>
  );
}

function InfoRow({ icon, label, value }: { icon: IoniconName; label: string; value: string }) {
  const colors = useColors();
  const styles = createStyles(colors);
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoRowLeft}>
        <Ionicons name={icon} size={16} color={colors.textSecondary} />
        <ThemedText variant="body" color="textSecondary" style={styles.infoLabel}>
          {label}
        </ThemedText>
      </View>
      <ThemedText variant="bodyMedium" numberOfLines={1} style={styles.infoValue}>
        {value}
      </ThemedText>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Order (in-progress, capacity-mode drop-off) — 12-activity-detail-inprogress.png
// ---------------------------------------------------------------------------

// customer-app-api-map.md §0.3 — there is no backend field for which of
// these 4 design stages a drop-off order is in, and Live Queue/per-stage
// tracking is explicitly out of scope ("do not build"). These 4 steps are
// therefore a best-effort projection of the 3 real `booking_status` values
// onto the design's stage labels — "Fitting" can never be the *current*
// step from status alone, only ever passed-through once the order
// completes. That's an honest reflection of the real data, not a bug.
const ORDER_STEPS: { label: string; icon: IoniconName }[] = [
  { label: 'Dropped Off', icon: 'cube-outline' }, // TODO i18n
  { label: 'In Progress', icon: 'pencil-outline' }, // TODO i18n
  { label: 'Fitting', icon: 'body-outline' }, // TODO i18n
  { label: 'Ready for Pickup', icon: 'bag-check-outline' }, // TODO i18n
];

function orderStepIndex(status: BookingStatus): number {
  switch (status) {
    case 'pending':
      return 0;
    case 'confirmed':
      return 1;
    case 'completed':
      return ORDER_STEPS.length;
    case 'cancelled':
    default:
      return -1;
  }
}

function OrderDetail({
  data,
  store,
  onWriteReview,
}: {
  data: BookingRead;
  store: { phone_country_code: string | null; phone_number: string | null } | undefined;
  onWriteReview: (() => void) | undefined;
}) {
  const colors = useColors();
  const styles = createStyles(colors);
  const currentIndex = orderStepIndex(data.booking_status);
  const isCancelled = data.booking_status === 'cancelled';
  const statusLabel = isCancelled
    ? 'Cancelled' /* TODO i18n */
    : ORDER_STEPS[Math.min(currentIndex, ORDER_STEPS.length - 1)].label;
  const showHelpRow = data.booking_status === 'pending' || data.booking_status === 'confirmed';

  const hasPhone = Boolean(store?.phone_number);
  const handleCall = () => {
    if (!store?.phone_number) return;
    Linking.openURL(`tel:${store.phone_country_code ?? ''}${store.phone_number}`);
  };
  const handleMessage = () => router.push(`/chat/${data.id}`);

  return (
    <>
      <View style={styles.orderHeaderRow}>
        {data.store_logo ? (
          <Image
            source={{ uri: data.store_logo }}
            style={styles.orderHeaderAvatar}
            contentFit="cover"
          />
        ) : (
          <View style={[styles.orderHeaderAvatar, styles.heroAvatarFallback]} />
        )}
        <ThemedText
          variant="body"
          color="textSecondary"
          style={styles.orderHeaderText}
          numberOfLines={2}
        >
          {data.booking_services_str} · {data.store_name}
        </ThemedText>
      </View>

      <View style={styles.trackerCard}>
        <View style={styles.trackerIconsRow}>
          {ORDER_STEPS.map((step, index) => (
            <Fragment key={step.label}>
              {index > 0 ? (
                <View style={[styles.connector, index <= currentIndex && styles.connectorDone]} />
              ) : null}
              <StepCircle
                step={step}
                state={
                  index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'future'
                }
              />
            </Fragment>
          ))}
        </View>
        <View style={styles.trackerLabelsRow}>
          {ORDER_STEPS.map((step, index) => (
            <Fragment key={step.label}>
              {index > 0 ? <View style={styles.connectorGap} /> : null}
              <View style={styles.stepLabelBox}>
                <ThemedText
                  variant="caption"
                  color={index === currentIndex ? 'textPrimary' : 'textSecondary'}
                  numberOfLines={2}
                  style={index === currentIndex && styles.stepLabelActive}
                >
                  {step.label}
                </ThemedText>
              </View>
            </Fragment>
          ))}
        </View>
      </View>

      <ThemedText
        variant="bodyMedium"
        color={isCancelled ? 'danger' : 'textPrimary'}
        style={styles.orderStatusLine}
      >
        {/* TODO i18n */}
        {`Status: ${statusLabel}`}
      </ThemedText>

      <View style={styles.infoCard}>
        <View style={styles.whenWhereRow}>
          <View style={styles.whenWhereCol}>
            <ThemedText variant="caption" color="textSecondary" style={styles.whenWhereLabel}>
              {/* TODO i18n */}
              WHEN
            </ThemedText>
            <ThemedText variant="bodyMedium">{formatBookingDateTitle(data.booking_date)}</ThemedText>
          </View>
          <View style={styles.whenWhereCol}>
            <ThemedText variant="caption" color="textSecondary" style={styles.whenWhereLabel}>
              {/* TODO i18n */}
              WHERE
            </ThemedText>
            <ThemedText variant="bodyMedium" numberOfLines={1}>
              {data.store_address}
            </ThemedText>
          </View>
        </View>
        {/* Purely decorative strip echoing the design's simplified map
            illustration — there's no store geometry/route to render here,
            just a WHEN/WHERE summary, so this never claims to be a real map. */}
        <View style={styles.mapStrip} pointerEvents="none">
          <View style={[styles.mapStripBand, styles.mapStripSky]} />
          <View style={[styles.mapStripBand, styles.mapStripLand]} />
          <View style={[styles.mapStripBand, styles.mapStripGreen]} />
          <View style={styles.mapStripDot} />
        </View>
      </View>

      {showHelpRow ? (
        <View style={styles.helpCard}>
          {data.store_logo ? (
            <Image source={{ uri: data.store_logo }} style={styles.helpAvatar} contentFit="cover" />
          ) : (
            <View style={[styles.helpAvatar, styles.heroAvatarFallback]} />
          )}
          <ThemedText variant="bodyMedium" style={styles.helpText}>
            {/* TODO i18n */}
            Need help with your order?
          </ThemedText>
          <Pressable style={styles.helpIconButton} onPress={handleMessage} hitSlop={8}>
            <Ionicons name="chatbubble-outline" size={18} color={colors.brandAccent} />
          </Pressable>
          <Pressable
            style={[styles.helpIconButton, styles.helpIconButtonSpacing]}
            onPress={handleCall}
            disabled={!hasPhone}
            hitSlop={8}
          >
            <Ionicons
              name="call-outline"
              size={18}
              color={hasPhone ? colors.brandAccent : colors.disabledText}
            />
          </Pressable>
        </View>
      ) : null}

      {onWriteReview ? (
        <Button
          label={/* TODO i18n */ 'Write a review'}
          variant="ghost"
          style={styles.reviewButton}
          onPress={onWriteReview}
        />
      ) : null}
    </>
  );
}

function StepCircle({
  step,
  state,
}: {
  step: { icon: IoniconName };
  state: 'done' | 'current' | 'future';
}) {
  const colors = useColors();
  const styles = createStyles(colors);
  if (state === 'done') {
    return (
      <View style={[styles.stepCircle, styles.stepCircleDone]}>
        <Ionicons name="checkmark" size={16} color={colors.textOnBrand} />
      </View>
    );
  }
  if (state === 'current') {
    return (
      <View style={[styles.stepCircle, styles.stepCircleCurrent]}>
        <Ionicons name={step.icon} size={16} color={colors.brandAccent} />
      </View>
    );
  }
  return (
    <View style={[styles.stepCircle, styles.stepCircleFuture]}>
      <Ionicons name={step.icon} size={16} color={colors.disabledText} />
    </View>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: spacing.md, paddingBottom: spacing.xl },

  // Appointment hero (dark, deep-purple — reserved for this kind of hero
  // surface per colors.ts, distinct from the brighter brandAccent used for
  // interactive/selected chrome elsewhere).
  heroCard: {
    backgroundColor: colors.brand,
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  heroStatusLabel: {
    fontFamily: fontFamily.bodySemiBold,
    letterSpacing: 0.6,
    opacity: 0.8,
    marginBottom: spacing.xxs,
  },
  heroSubRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs },
  heroAvatar: { width: 24, height: 24, borderRadius: 12, marginRight: spacing.xs },
  heroAvatarFallback: { backgroundColor: colors.backgroundMuted },
  heroSubText: { opacity: 0.85, flexShrink: 1 },
  countdownPill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.brandAccent,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.pill,
    marginTop: spacing.sm,
  },
  countdownLabel: { fontFamily: fontFamily.bodySemiBold },

  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xxs,
  },
  infoRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    marginRight: spacing.sm,
  },
  infoLabel: { marginLeft: spacing.xs },
  infoValue: { flexShrink: 1, textAlign: 'right' },

  actionRow: { flexDirection: 'row' },
  outlineButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
  },
  outlineButtonSpacing: { marginLeft: spacing.sm },
  outlineButtonLabel: { marginLeft: spacing.xxs },

  freeCancelNote: { textAlign: 'center', marginTop: spacing.md },
  reviewButton: { marginTop: spacing.md },
  cancelLink: { alignSelf: 'center', marginTop: spacing.md },

  // Order ("Your Order") variant
  orderHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  orderHeaderAvatar: { width: 28, height: 28, borderRadius: 14, marginRight: spacing.xs },
  orderHeaderText: { flex: 1 },

  trackerCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  trackerIconsRow: { flexDirection: 'row', alignItems: 'center' },
  connector: { flex: 1, height: 2, backgroundColor: colors.border, marginHorizontal: 2 },
  connectorDone: { backgroundColor: colors.brandAccent },
  connectorGap: { flex: 1 },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleDone: { backgroundColor: colors.brandAccent },
  stepCircleCurrent: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.brandAccent,
  },
  stepCircleFuture: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  trackerLabelsRow: { flexDirection: 'row', marginTop: spacing.xs },
  stepLabelBox: { width: 36, alignItems: 'center' },
  stepLabelActive: { fontFamily: fontFamily.bodySemiBold },

  orderStatusLine: { marginBottom: spacing.md },

  whenWhereRow: { flexDirection: 'row', marginBottom: spacing.sm },
  whenWhereCol: { flex: 1 },
  whenWhereLabel: { letterSpacing: 0.6, marginBottom: 2 },
  mapStrip: {
    height: 56,
    borderRadius: radius.md,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  mapStripBand: { flex: 1, height: '100%' },
  mapStripSky: { backgroundColor: '#CFE0F0' },
  mapStripLand: { backgroundColor: '#EDE3CE' },
  mapStripGreen: { backgroundColor: '#D9ECD8' },
  mapStripDot: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: -6,
    marginLeft: -6,
    backgroundColor: colors.brandAccent,
    borderWidth: 2,
    borderColor: colors.surface,
  },

  helpCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.sm,
  },
  helpAvatar: { width: 36, height: 36, borderRadius: 18, marginRight: spacing.sm },
  helpText: { flex: 1 },
  helpIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.brandTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpIconButtonSpacing: { marginLeft: spacing.xs },
  });

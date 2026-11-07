import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { PressableScale } from '@/components/PressableScale';
import { ScreenHeader } from '@/components/ScreenHeader';
import { TextField } from '@/components/TextField';
import { ThemedText } from '@/components/ThemedText';
import { formatMoney } from '@/lib/money';
import { branchToday } from '@/lib/time/branchTime';
import { enter, radius, shadows, spacing, useColors, type Colors } from '@/theme';

import type { AvailabilitySlot, Service } from '../api/schemas';
import { useAvailability } from '../hooks/useAvailability';
import { useConfirmBooking } from '../hooks/useConfirmBooking';
import {
  useBookingDraftStore,
  useDraftEntries,
  type BookingDraftEntry,
} from '../state/bookingDraftStore';
import { formatDraftDateLabel } from '../utils/dates';
import {
  availabilityParamsFor,
  getDraftBlockedIntervals,
  withDraftHolds,
} from '../utils/draftConflicts';

import { DateStrip } from './DateStrip';
import { SlotGrid } from './SlotGrid';
import { SpecialistPicker } from './SpecialistPicker';

interface BookingFlowProps {
  storeId: string;
  service: Service;
  /** Rendered as the gray subtitle under the service name (24-booking-configure.png). */
  storeName?: string;
  /** The BRANCH's IANA timezone (store detail / booking) — drives "today" and the date strip, never the phone's zone. */
  timezone: string;
  /** Pre-fill for rebook, or for re-opening a service already configured in the current draft — still overridable via the pickers below. */
  initialEmployeeId?: string | null;
  initialDate?: string;
  initialSlot?: AvailabilitySlot | null;
  /** A heads-up shown above the service summary (rebook uses it when the original had several services). */
  notice?: string;
  /** Gets the new booking's id; read the full booking with `getBooking`. */
  onBooked: (booking: { id: string }) => void;
}

/**
 * The shared date -> specialist(optional) -> slot -> confirm flow used by both
 * ServiceBookingConfigScreen (fresh booking) and RebookSheetScreen (repeat a
 * past booking). Branches its UI on `service.requires_specialist`
 * (customer-app-api-map.md §0): specialist-mode services get a specialist
 * picker before the slot grid, capacity-mode services (car wash/repair,
 * tailoring drop-off) skip straight to date + slots and never send
 * `employee_id` when creating the booking.
 *
 * Callers must render this with `key={service.id}` so switching services
 * remounts it with fresh state, rather than resetting state in an effect.
 */
export function BookingFlow({
  storeId,
  service,
  storeName,
  timezone,
  initialEmployeeId = null,
  initialDate,
  initialSlot = null,
  notice,
  onBooked,
}: BookingFlowProps) {
  const colors = useColors();
  const styles = { ...baseStyles, ...createStyles(colors) };
  const { t } = useTranslation();
  const [employeeId, setEmployeeId] = useState<string | null>(initialEmployeeId);
  const [selectedDate, setSelectedDate] = useState(() => initialDate ?? branchToday(timezone));
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(initialSlot);
  const [formError, setFormError] = useState<string | null>(null);
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState('');

  // Same params helper conflict recovery uses, so its refetch lands on this grid's cache entry.
  const availabilityParams = useMemo(
    () => availabilityParamsFor(storeId, { service, employeeId, date: selectedDate }),
    [storeId, service, selectedDate, employeeId],
  );

  const availability = useAvailability(availabilityParams);
  const { confirm, isPending } = useConfirmBooking(storeId);
  const setDraftEntry = useBookingDraftStore((state) => state.setEntry);
  // Other services already configured for this store in "+ Add Service"
  // round trips — excludes this screen's own service, which only joins the
  // draft once "+ Add Service" or "Confirm Booking" is actually pressed.
  const draftEntries = useDraftEntries(storeId);
  const otherEntries = useMemo(
    () => Object.values(draftEntries).filter((entry) => entry.service.id !== service.id),
    [draftEntries, service.id],
  );
  const totalPrice =
    service.price + otherEntries.reduce((sum, entry) => sum + entry.service.price, 0);

  // Specialist/time slots already claimed by this service's siblings in the
  // current draft — invisible to the server's availability since they aren't
  // real bookings yet, so we hold them client-side instead.
  const blockedIntervals = useMemo(
    () => getDraftBlockedIntervals(otherEntries, selectedDate),
    [otherEntries, selectedDate],
  );
  const availabilityWithHolds = useMemo(
    () => withDraftHolds(availability.data, blockedIntervals, service.buffer_minutes),
    [availability.data, blockedIntervals, service.buffer_minutes],
  );

  // Selecting a new date/employee invalidates whichever slot was picked
  // under the old ones — clear it right where the change happens instead of
  // reacting to it in an effect (avoids an extra render pass).
  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    setFormError(null);
  };

  const handleSelectEmployee = (id: string | null) => {
    setEmployeeId(id);
    setSelectedSlot(null);
    setFormError(null);
  };

  const handleSelectSlot = (slot: AvailabilitySlot) => {
    setFormError(null);
    setSelectedSlot(slot);
  };

  // This screen's service as a draft entry (its slot carries the UTC start).
  const currentEntry = (slot: AvailabilitySlot): BookingDraftEntry => ({
    service,
    employeeId,
    date: selectedDate,
    slot,
    note: note.trim() || undefined,
  });

  // Saves this service's config into the shared draft and sends the customer
  // back to the store page to pick another service (24-booking-configure.png
  // flow) — replaces the old same-screen "stack it after this slot" dropdown.
  const handleAddService = () => {
    if (!selectedSlot) return;
    setDraftEntry(storeId, currentEntry(selectedSlot));
    router.back();
  };

  const handleConfirm = async () => {
    if (!selectedSlot) return;
    setFormError(null);
    const outcome = await confirm(
      [currentEntry(selectedSlot), ...otherEntries],
      t('common.errorGeneric'),
    );
    if (outcome.status === 'busy') return; // double tap while the first confirm runs
    if (outcome.status === 'booked') {
      onBooked({ id: outcome.id });
      return;
    }
    setFormError(outcome.message);
    // Slot conflict: useConfirmBooking already refreshed availability and
    // dropped the conflicting draft entries. Clear this screen's pick when it
    // was the culprit — or when the culprit couldn't be pinpointed, since
    // this is the slot the customer is looking at.
    const { conflicting } = outcome;
    if (
      conflicting &&
      (conflicting.length === 0 || conflicting.some((entry) => entry.service.id === service.id))
    ) {
      setSelectedSlot(null);
    }
  };

  const hasSpecialistStep = service.requires_specialist;
  const summaryLine = selectedSlot
    ? [
        formatDraftDateLabel(selectedDate, timezone),
        selectedSlot.time_slot_str,
        otherEntries.length > 0 ? t('booking.moreServices', { count: otherEntries.length }) : null,
      ]
        .filter(Boolean)
        .join(' · ')
    : t('booking.chooseTime');

  return (
    <View style={styles.flex}>
      <ScreenHeader title={service.name} subtitle={storeName} />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {notice ? (
          <Animated.View entering={enter(0)} style={styles.notice}>
            <Ionicons name="information-circle-outline" size={20} color={colors.warning} />
            <ThemedText variant="caption" color="textPrimary" style={styles.noticeText}>
              {notice}
            </ThemedText>
          </Animated.View>
        ) : null}

        <Animated.View entering={enter(0)}>
          <Card>
            {service.description ? (
              <ThemedText variant="body" color="textSecondary" style={styles.description}>
                {service.description}
              </ThemedText>
            ) : null}
            <View style={styles.facts}>
              <View style={styles.fact}>
                <View style={[styles.factIcon, { backgroundColor: colors.brandTint }]}>
                  <Ionicons name="time-outline" size={17} color={colors.brandAccent} />
                </View>
                <View>
                  <ThemedText variant="caption" color="textTertiary">
                    {t('booking.duration')}
                  </ThemedText>
                  <ThemedText variant="bodyMedium">
                    {t('booking.minutes', { count: service.duration_minutes })}
                  </ThemedText>
                </View>
              </View>
              <View style={styles.fact}>
                <View style={[styles.factIcon, { backgroundColor: colors.brandTint }]}>
                  <Ionicons name="pricetag-outline" size={17} color={colors.brandAccent} />
                </View>
                <View>
                  <ThemedText variant="caption" color="textTertiary">
                    {t('booking.price')}
                  </ThemedText>
                  <ThemedText variant="bodyMedium">
                    {formatMoney(service.price, service.currency)}
                  </ThemedText>
                </View>
              </View>
            </View>
          </Card>
        </Animated.View>

        {hasSpecialistStep ? (
          <Animated.View entering={enter(1)} style={styles.section}>
            <StepHeading
              number={1}
              title={t('booking.chooseProfessional')}
              done
              aside={employeeId === null ? t('booking.any') : undefined}
            />
            <SpecialistPicker
              storeId={storeId}
              serviceId={service.id}
              selectedEmployeeId={employeeId}
              onSelect={handleSelectEmployee}
              bleed={spacing.gutter}
            />
          </Animated.View>
        ) : null}

        <Animated.View entering={enter(2)} style={styles.section}>
          <StepHeading
            number={hasSpecialistStep ? 2 : 1}
            title={t('booking.pickDayTime')}
            done={selectedSlot !== null}
            aside={formatDraftDateLabel(selectedDate, timezone)}
          />
          <DateStrip
            selectedDate={selectedDate}
            timezone={timezone}
            onSelectDate={handleSelectDate}
            bleed={spacing.gutter}
          />
          <View style={styles.slotGridWrap}>
            <SlotGrid
              availability={availabilityWithHolds}
              isLoading={availability.isLoading}
              isError={availability.isError}
              error={availability.error}
              selectedSlot={selectedSlot}
              onSelectSlot={handleSelectSlot}
            />
          </View>
        </Animated.View>

        <Animated.View entering={enter(3)} style={styles.section}>
          <Card padding="none">
            <PressableScale
              accessibilityRole="button"
              accessibilityLabel={t('booking.addNote')}
              accessibilityState={{ expanded: noteOpen }}
              onPress={() => setNoteOpen((open) => !open)}
              scaleTo={0.99}
              style={styles.noteRow}
            >
              <Ionicons name="create-outline" size={20} color={colors.brandAccent} />
              <ThemedText variant="bodyMedium" style={styles.noteLabel}>
                {t('booking.addNote')}
              </ThemedText>
              <Ionicons
                name={noteOpen ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={colors.textTertiary}
              />
            </PressableScale>
            {noteOpen ? (
              <View style={styles.noteBody}>
                <TextField
                  value={note}
                  onChangeText={setNote}
                  placeholder={t('booking.notePlaceholder')}
                  multiline
                  style={styles.noteInput}
                />
              </View>
            ) : null}
          </Card>

          <Button
            label={t('booking.addAnother')}
            variant="ghost"
            icon="add"
            disabled={!selectedSlot}
            onPress={handleAddService}
          />
        </Animated.View>
      </ScrollView>

      <View style={styles.bar}>
        {formError ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={18} color={colors.danger} />
            <ThemedText variant="caption" color="danger" style={styles.errorText}>
              {formError}
            </ThemedText>
          </View>
        ) : null}
        <View style={styles.barRow}>
          <View style={styles.barSummary}>
            <ThemedText variant="caption" color="textSecondary" numberOfLines={1}>
              {summaryLine}
            </ThemedText>
            <ThemedText variant="h3">{formatMoney(totalPrice, service.currency)}</ThemedText>
          </View>
          <Button
            label={t('booking.confirm')}
            fullWidth={false}
            style={styles.confirmButton}
            onPress={handleConfirm}
            loading={isPending}
            disabled={!selectedSlot}
          />
        </View>
      </View>
    </View>
  );
}

/** A numbered section title; the number becomes a brand check once the step has a choice. */
function StepHeading({
  number,
  title,
  done,
  aside,
}: {
  number: number;
  title: string;
  done: boolean;
  aside?: string;
}) {
  const colors = useColors();
  return (
    <View style={baseStyles.stepRow}>
      <View
        style={[baseStyles.stepBadge, { backgroundColor: done ? colors.brand : colors.brandTint }]}
      >
        {done ? (
          <Ionicons name="checkmark" size={15} color={colors.textOnBrand} />
        ) : (
          <ThemedText variant="captionStrong" color="brandAccent">
            {number}
          </ThemedText>
        )}
      </View>
      <ThemedText variant="h3" style={baseStyles.stepTitle} numberOfLines={1}>
        {title}
      </ThemedText>
      {aside ? (
        <ThemedText variant="caption" color="textSecondary">
          {aside}
        </ThemedText>
      ) : null}
    </View>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    notice: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      backgroundColor: colors.warningTint,
      borderRadius: radius.md,
      padding: spacing.sm,
    },
    noticeText: { flex: 1 },
    bar: {
      backgroundColor: colors.surface,
      borderTopWidth: StyleSheet.hairlineWidth * 2,
      borderTopColor: colors.border,
      paddingHorizontal: spacing.gutter,
      paddingVertical: spacing.sm,
      gap: spacing.xs,
      ...shadows.md,
    },
    errorBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      backgroundColor: colors.dangerTint,
      borderRadius: radius.md,
      padding: spacing.sm,
    },
  });

const baseStyles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xl,
    gap: 28,
  },
  description: { marginBottom: spacing.sm },
  facts: { flexDirection: 'row', flexWrap: 'wrap', columnGap: spacing.lg, rowGap: spacing.sm },
  fact: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs + 2 },
  factIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: { gap: spacing.sm },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs + 2 },
  stepBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepTitle: { flex: 1 },
  slotGridWrap: { marginTop: spacing.xs },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: 56,
  },
  noteLabel: { flex: 1 },
  noteBody: { paddingHorizontal: spacing.md, paddingBottom: spacing.md },
  noteInput: { minHeight: 88, textAlignVertical: 'top' },
  errorText: { flex: 1 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  barSummary: { flex: 1, minWidth: 0 },
  confirmButton: { minWidth: 160 },
});

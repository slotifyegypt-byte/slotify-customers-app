import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { Button } from '@/components/Button';
import { ThemedText } from '@/components/ThemedText';
import { colors, radius, spacing } from '@/theme';

import { draftEntryToPayload, type AvailabilityParams, type CreateBookingServicePayload } from '../api/bookingApi';
import type { AvailabilitySlot, BookingRead, Service } from '../api/schemas';
import { useAvailability } from '../hooks/useAvailability';
import { useCreateBooking } from '../hooks/useCreateBooking';
import { useBookingDraftStore, useDraftEntries } from '../state/bookingDraftStore';
import { getBookingErrorMessage, isCapacityConflict } from '../utils/apiError';
import { getDraftBlockedIntervals, withDraftHolds } from '../utils/draftConflicts';

import { DateStrip } from './DateStrip';
import { SlotGrid } from './SlotGrid';
import { SpecialistPicker } from './SpecialistPicker';

interface BookingFlowProps {
  storeId: string;
  service: Service;
  /** Rendered as the gray subtitle under the service name (24-booking-configure.png). */
  storeName?: string;
  /** Pre-fill for rebook, or for re-opening a service already configured in the current draft — still overridable via the pickers below. */
  initialEmployeeId?: string | null;
  initialDate?: string;
  initialSlot?: AvailabilitySlot | null;
  onBooked: (booking: BookingRead) => void;
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
  initialEmployeeId = null,
  initialDate,
  initialSlot = null,
  onBooked,
}: BookingFlowProps) {
  const { t } = useTranslation();
  const [employeeId, setEmployeeId] = useState<string | null>(initialEmployeeId);
  const [selectedDate, setSelectedDate] = useState(() => initialDate ?? format(new Date(), 'yyyy-MM-dd'));
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(initialSlot);
  const [formError, setFormError] = useState<string | null>(null);
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState('');

  const availabilityParams: AvailabilityParams = useMemo(
    () => ({
      store_id: storeId,
      service_id: service.id,
      date: selectedDate,
      ...(service.requires_specialist && employeeId ? { employee_id: employeeId } : {}),
    }),
    [storeId, service.id, service.requires_specialist, selectedDate, employeeId],
  );

  const availability = useAvailability(availabilityParams);
  const createBooking = useCreateBooking();
  const setDraftEntry = useBookingDraftStore((state) => state.setEntry);
  const clearDraft = useBookingDraftStore((state) => state.clear);
  // Other services already configured for this store in "+ Add Service"
  // round trips — excludes this screen's own service, which only joins the
  // draft once "+ Add Service" or "Confirm Booking" is actually pressed.
  const draftEntries = useDraftEntries(storeId);
  const otherEntries = useMemo(
    () => Object.values(draftEntries).filter((entry) => entry.service.id !== service.id),
    [draftEntries, service.id],
  );
  const totalPrice = service.price + otherEntries.reduce((sum, entry) => sum + entry.service.price, 0);

  // Specialist/time slots already claimed by this service's siblings in the
  // current draft — hidden from the backend's own availability check since
  // they aren't real bookings yet, so we hold them client-side instead.
  const blockedIntervals = useMemo(
    () => getDraftBlockedIntervals(otherEntries, selectedDate),
    [otherEntries, selectedDate],
  );
  const availabilityWithHolds = useMemo(
    () => withDraftHolds(availability.data, blockedIntervals),
    [availability.data, blockedIntervals],
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

  // Saves this service's config into the shared draft and sends the customer
  // back to the store page to pick another service (24-booking-configure.png
  // flow) — replaces the old same-screen "stack it after this slot" dropdown.
  const handleAddService = () => {
    if (!selectedSlot) return;
    setDraftEntry(storeId, { service, employeeId, date: selectedDate, slot: selectedSlot, note: note.trim() || undefined });
    router.back();
  };

  const handleConfirm = async () => {
    if (!selectedSlot) return;
    setFormError(null);
    try {
      const services: CreateBookingServicePayload[] = [
        draftEntryToPayload({ service, employeeId, date: selectedDate, slot: selectedSlot, note: note.trim() || undefined }),
        ...otherEntries.map(draftEntryToPayload),
      ];

      const booking = await createBooking.mutateAsync({ storeId, services });
      clearDraft(storeId);
      onBooked(booking);
    } catch (error) {
      // 409 = capacity slot filled up since the grid was fetched, 422 =
      // validation error — both carry a human-readable `detail` (§6 samples).
      setFormError(getBookingErrorMessage(error, t('common.errorGeneric')));
      if (isCapacityConflict(error)) {
        setSelectedSlot(null);
        availability.refetch();
      }
    }
  };

  return (
    <View style={styles.flex}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={8}>
          <Ionicons name="chevron-back" size={18} color={colors.brand} />
        </Pressable>
        <View style={styles.headerText}>
          <ThemedText variant="h2" numberOfLines={1}>
            {service.name}
          </ThemedText>
          {storeName ? (
            <ThemedText variant="caption" color="textSecondary" numberOfLines={1}>
              {storeName}
            </ThemedText>
          ) : null}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.infoCard}>
          <View style={styles.infoItem}>
            <View style={styles.infoIcon}>
              <Ionicons name="pricetag-outline" size={16} color={colors.brandAccent} />
            </View>
            <View>
              <ThemedText variant="caption" color="textSecondary">
                {/* TODO i18n */}
                Price
              </ThemedText>
              <ThemedText variant="bodyMedium">
                {service.price} {service.price_symbol}
              </ThemedText>
            </View>
          </View>
          <View style={styles.infoItem}>
            <View style={styles.infoIcon}>
              <Ionicons name="time-outline" size={16} color={colors.brandAccent} />
            </View>
            <View>
              <ThemedText variant="caption" color="textSecondary">
                {/* TODO i18n */}
                Duration
              </ThemedText>
              <ThemedText variant="bodyMedium">
                {/* TODO i18n */}
                {service.duration_minutes} min
              </ThemedText>
            </View>
          </View>
        </View>

        {service.requires_specialist ? (
          <View style={styles.section}>
            <ThemedText variant="bodyMedium" style={styles.label}>
              {/* TODO i18n */}
              Specialist
            </ThemedText>
            <SpecialistPicker
              storeId={storeId}
              serviceId={service.id}
              selectedEmployeeId={employeeId}
              onSelect={handleSelectEmployee}
            />
          </View>
        ) : null}

        <View style={styles.section}>
          <ThemedText variant="bodyMedium" style={styles.label}>
            {/* TODO i18n */}
            Date & Time
          </ThemedText>
          <DateStrip selectedDate={selectedDate} onSelectDate={handleSelectDate} />
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
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => setNoteOpen((open) => !open)}
          style={styles.noteRow}
        >
          <Ionicons name="document-text-outline" size={18} color={colors.brandAccent} />
          <ThemedText variant="bodyMedium" color="brandAccent" style={styles.noteLabel}>
            {/* TODO i18n */}
            Add a note (optional)
          </ThemedText>
          <Ionicons name={noteOpen ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textSecondary} />
        </Pressable>
        {noteOpen ? (
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Anything the specialist should know?" // TODO i18n
            placeholderTextColor={colors.textSecondary}
            style={styles.noteInput}
            multiline
          />
        ) : null}

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: !selectedSlot }}
          disabled={!selectedSlot}
          onPress={handleAddService}
          style={styles.addServiceButton}
        >
          <ThemedText
            variant="bodyMedium"
            color={selectedSlot ? 'brandAccent' : 'textSecondary'}
            style={styles.addServiceLabel}
          >
            {/* TODO i18n */}+ Add Service
          </ThemedText>
        </Pressable>

        {formError ? (
          <View style={styles.errorBanner}>
            <ThemedText variant="caption" color="danger">
              {formError}
            </ThemedText>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <View>
          <ThemedText variant="caption" color="textSecondary">
            {/* TODO i18n */}
            Total
          </ThemedText>
          <ThemedText variant="h3">
            {totalPrice} {service.price_symbol}
          </ThemedText>
        </View>
        <Button
          label={/* TODO i18n */ 'Confirm Booking'}
          variant="accent"
          fullWidth={false}
          style={styles.confirmButton}
          onPress={handleConfirm}
          loading={createBooking.isPending}
          disabled={!selectedSlot}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.brandTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1, minWidth: 0 },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.divider,
    padding: spacing.sm,
    marginBottom: spacing.lg,
    gap: spacing.lg,
  },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.brandTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: { marginBottom: spacing.lg },
  label: { marginBottom: spacing.xs },
  slotGridWrap: { marginTop: spacing.sm },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.divider,
  },
  noteLabel: { flex: 1 },
  noteInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.sm,
    color: colors.textPrimary,
    minHeight: 64,
    textAlignVertical: 'top',
    marginBottom: spacing.sm,
  },
  addServiceButton: { alignSelf: 'center', paddingVertical: spacing.sm },
  addServiceLabel: { textDecorationLine: 'underline' },
  errorBanner: {
    backgroundColor: colors.backgroundMuted,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginTop: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  confirmButton: { paddingHorizontal: spacing.lg, minWidth: 168 },
});

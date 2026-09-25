import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { ActivityIndicator, Linking, Pressable, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { ThemedText } from '@/components/ThemedText';
import type { StoreDetail } from '@/features/explore-search/api/schemas';
import { spacing, useColors, type Colors } from '@/theme';

import type { CalendarDay, GalleryItem, SpecialDay } from '../api/schemas';

import { GallerySection } from './GallerySection';

const WEEK_DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// customer-app-api-map.md §5 — `amenities` is a real backend enum
// (VERIFIED live, 2026-09-20); this is the full set of values it can send.
const AMENITY_LABELS: Record<string, string> = {
  parking: 'Parking available', // TODO i18n
  card_payments: 'Card payments', // TODO i18n
  wheelchair_accessible: 'Wheelchair accessible', // TODO i18n
};

interface AboutTabProps {
  store: StoreDetail;
  calendarDays: CalendarDay[];
  specialDays: SpecialDay[];
  photos: GalleryItem[];
  isLoading: boolean;
  isError: boolean;
}

export function AboutTab({ store, calendarDays, specialDays, photos, isLoading, isError }: AboutTabProps) {
  const colors = useColors();
  const styles = createStyles(colors);

  // Sorted defensively even though the backend already returns all 7 —
  // guards against a future response that's out of order or missing a day,
  // rather than silently truncating the list.
  const sortedDays = useMemo(
    () =>
      [...calendarDays].sort(
        (a, b) => WEEK_DAY_ORDER.indexOf(a.week_day) - WEEK_DAY_ORDER.indexOf(b.week_day),
      ),
    [calendarDays],
  );

  const hasPhone = Boolean(store.phone_number);
  const call = () => {
    if (!hasPhone) return;
    Linking.openURL(`tel:${store.phone_country_code ?? ''}${store.phone_number}`);
  };
  const openDirections = () => {
    Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}`);
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.brand} />
      </View>
    );
  }

  if (isError) {
    return <EmptyState title="Couldn't load opening hours" /* TODO i18n */ />;
  }

  return (
    <View style={styles.container}>
      {store.description ? (
        <ThemedText variant="body" color="textSecondary" style={styles.description}>
          {store.description}
        </ThemedText>
      ) : null}

      <ThemedText variant="h3" style={styles.title}>
        Hours {/* TODO i18n */}
      </ThemedText>
      {sortedDays.length === 0 ? (
        <ThemedText variant="body" color="textSecondary">
          Opening hours aren&apos;t set up yet. {/* TODO i18n */}
        </ThemedText>
      ) : (
        sortedDays.map((day) => (
          <View key={day.id} style={styles.row}>
            <ThemedText variant="body">{day.week_day}</ThemedText>
            <ThemedText variant="body" color={day.status === 'open' ? 'textPrimary' : 'textSecondary'}>
              {day.status === 'open' ? day.hours_str ?? `${day.opening_hour} - ${day.closing_hour}` : 'Closed' /* TODO i18n */}
            </ThemedText>
          </View>
        ))
      )}

      {specialDays.length > 0 ? (
        <View style={styles.specialSection}>
          <ThemedText variant="h3" style={styles.title}>
            Upcoming exceptions {/* TODO i18n */}
          </ThemedText>
          {specialDays.map((day) => (
            <View key={day.id} style={styles.row}>
              <ThemedText variant="body">{day.date}</ThemedText>
              <ThemedText variant="body" color={day.status === 'open' ? 'textPrimary' : 'textSecondary'}>
                {day.status === 'open'
                  ? day.opening_hour && day.closing_hour
                    ? `${day.opening_hour} - ${day.closing_hour}`
                    : 'Open' /* TODO i18n */
                  : 'Closed' /* TODO i18n */}
              </ThemedText>
            </View>
          ))}
        </View>
      ) : null}

      <View style={styles.specialSection}>
        <ThemedText variant="h3" style={styles.title}>
          Contact {/* TODO i18n */}
        </ThemedText>
        <Pressable style={styles.linkRow} onPress={call} disabled={!hasPhone} accessibilityRole="button">
          <Ionicons name="call-outline" size={18} color={hasPhone ? colors.brand : colors.textSecondary} />
          <ThemedText variant="body" color={hasPhone ? 'brand' : 'textSecondary'} style={styles.linkText}>
            {hasPhone ? `${store.phone_country_code ?? ''}${store.phone_number}` : 'No phone number on file' /* TODO i18n */}
          </ThemedText>
        </Pressable>
      </View>

      <View style={styles.specialSection}>
        <ThemedText variant="h3" style={styles.title}>
          Location {/* TODO i18n */}
        </ThemedText>
        <ThemedText variant="body" color="textSecondary">
          {store.address}
        </ThemedText>
        <Pressable style={styles.linkRow} onPress={openDirections} accessibilityRole="button">
          <Ionicons name="navigate-outline" size={18} color={colors.brand} />
          <ThemedText variant="body" color="brand" style={styles.linkText}>
            Get directions {/* TODO i18n */}
          </ThemedText>
        </Pressable>
      </View>

      {store.amenities && store.amenities.length > 0 ? (
        <View style={styles.specialSection}>
          <ThemedText variant="h3" style={styles.title}>
            Amenities {/* TODO i18n */}
          </ThemedText>
          {store.amenities.map((amenity) => (
            <View key={amenity} style={styles.linkRow}>
              <Ionicons name="checkmark-circle-outline" size={18} color={colors.brand} />
              <ThemedText variant="body" style={styles.linkText}>
                {AMENITY_LABELS[amenity] ?? amenity}
              </ThemedText>
            </View>
          ))}
        </View>
      ) : null}

      {photos.length > 0 ? (
        // Cancels this container's own horizontal padding so the gallery's
        // internal ScrollView can bleed to the screen edge — needed for the
        // "peek of next photo" effect the design calls for.
        <View style={styles.galleryBleed}>
          <GallerySection photos={photos} />
        </View>
      ) : null}
    </View>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
  container: { paddingHorizontal: spacing.md, paddingTop: spacing.md },
  centered: { paddingVertical: spacing.xl, alignItems: 'center' },
  description: { marginBottom: spacing.lg },
  title: { marginBottom: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xxs,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  specialSection: { marginTop: spacing.lg },
  galleryBleed: { marginHorizontal: -spacing.md },
  linkRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs },
  linkText: { marginLeft: spacing.xxs },
});

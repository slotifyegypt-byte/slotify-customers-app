import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Linking, Pressable, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { ThemedText } from '@/components/ThemedText';
import type { StoreDetail } from '@/features/explore-search/api/schemas';
import { spacing, useColors, type Colors } from '@/theme';

import type { GalleryItem, HoursDay, SpecialDay } from '../api/schemas';
import { formatInterval, WEEKDAY_NAMES } from '../utils/hours';

import { GallerySection } from './GallerySection';

// `amenity` enum (developer-guide.md §10).
const AMENITY_LABELS: Record<string, string> = {
  parking: 'Parking available', // TODO i18n
  card_payments: 'Card payments', // TODO i18n
  wheelchair_accessible: 'Wheelchair accessible', // TODO i18n
  wifi: 'Wi-Fi', // TODO i18n
  kids_friendly: 'Kids friendly', // TODO i18n
};

interface AboutTabProps {
  store: StoreDetail;
  calendarDays: HoursDay[];
  specialDays: SpecialDay[];
  photos: GalleryItem[];
  isLoading: boolean;
  isError: boolean;
}

export function AboutTab({ store, calendarDays, specialDays, photos, isLoading, isError }: AboutTabProps) {
  const colors = useColors();
  const styles = createStyles(colors);

  const hasPhone = Boolean(store.phone);
  const call = () => {
    if (!hasPhone) return;
    Linking.openURL(`tel:${store.phone}`);
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
      {calendarDays.every((day) => day.intervals.length === 0) ? (
        <ThemedText variant="body" color="textSecondary">
          Opening hours aren&apos;t set up yet. {/* TODO i18n */}
        </ThemedText>
      ) : (
        calendarDays.map((day) => (
          <View key={day.day_of_week} style={styles.row}>
            <ThemedText variant="body">{WEEKDAY_NAMES[day.day_of_week - 1]}</ThemedText>
            {/* One line per shift: split days stack, past-midnight closings say "(next day)". */}
            <View style={styles.hoursColumn}>
              {day.intervals.length === 0 ? (
                <ThemedText variant="body" color="textSecondary">
                  Closed {/* TODO i18n */}
                </ThemedText>
              ) : (
                day.intervals.map((interval) => (
                  <ThemedText key={interval.opens_at} variant="body">
                    {formatInterval(interval.opens_at, interval.closes_at)}
                  </ThemedText>
                ))
              )}
            </View>
          </View>
        ))
      )}

      {specialDays.length > 0 ? (
        <View style={styles.specialSection}>
          <ThemedText variant="h3" style={styles.title}>
            Upcoming exceptions {/* TODO i18n */}
          </ThemedText>
          {specialDays.map((day) => (
            <View key={day.date} style={styles.row}>
              <View>
                <ThemedText variant="body">{day.date}</ThemedText>
                {day.reason ? (
                  <ThemedText variant="caption" color="textSecondary">
                    {day.reason}
                  </ThemedText>
                ) : null}
              </View>
              <ThemedText variant="body" color={day.is_closed ? 'textSecondary' : 'textPrimary'}>
                {day.is_closed
                  ? 'Closed' /* TODO i18n */
                  : day.opens_at && day.closes_at
                    ? formatInterval(day.opens_at, day.closes_at)
                    : 'Open' /* TODO i18n */}
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
            {hasPhone ? store.phone : 'No phone number on file' /* TODO i18n */}
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
  hoursColumn: { alignItems: 'flex-end' },
  specialSection: { marginTop: spacing.lg },
  galleryBleed: { marginHorizontal: -spacing.md },
  linkRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs },
  linkText: { marginLeft: spacing.xxs },
});

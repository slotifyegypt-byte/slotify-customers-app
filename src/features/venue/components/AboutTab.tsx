import { Ionicons } from '@expo/vector-icons';
import { useMemo, type ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';
import { I18nManager, Linking, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Card } from '@/components/Card';
import { Divider } from '@/components/Divider';
import { EmptyState } from '@/components/EmptyState';
import { Pill } from '@/components/Pill';
import { PressableScale } from '@/components/PressableScale';
import { SectionHeader } from '@/components/SectionHeader';
import { Skeleton } from '@/components/Skeleton';
import { ThemedText } from '@/components/ThemedText';
import type { StoreDetail } from '@/features/explore-search/api/schemas';
import { branchToday } from '@/lib/time/branchTime';
import { enter, radius, spacing, useColors } from '@/theme';

import type { GalleryItem, HoursDay, SpecialDay, TeamMember } from '../api/schemas';
import { formatInterval, weekdayName } from '../utils/hours';

import { GallerySection } from './GallerySection';
import { TeamSection } from './TeamSection';

// `amenity` enum (developer-guide.md §10): every value has a `venue.amenity.<value>` label. A value the app
// doesn't know yet (a newly added amenity) is hidden rather than shown as a raw snake_case word.
const KNOWN_AMENITIES = new Set([
  'parking',
  'card_payments',
  'wheelchair_accessible',
  'wifi',
  'kids_friendly',
  'pet_friendly',
  'instapay',
]);

interface AboutTabProps {
  store: StoreDetail;
  calendarDays: HoursDay[];
  specialDays: SpecialDay[];
  photos: GalleryItem[];
  /** The people who work here; the "Meet the team" row is left out when absent or empty. */
  team?: TeamMember[];
  isLoading: boolean;
  isError: boolean;
}

/** 1 = Monday … 7 = Sunday for the branch's current day, or null when the branch's zone is unknown. */
function branchWeekday(timezone: string | undefined): number | null {
  if (!timezone) return null;
  try {
    const day = new Date(`${branchToday(timezone)}T00:00:00Z`).getUTCDay();
    return day === 0 ? 7 : day;
  } catch {
    return null;
  }
}

export function AboutTab({
  store,
  calendarDays,
  specialDays,
  photos,
  team = [],
  isLoading,
  isError,
}: AboutTabProps) {
  const colors = useColors();
  const { t } = useTranslation();
  const today = useMemo(() => branchWeekday(store.timezone), [store.timezone]);

  const hasPhone = Boolean(store.phone);
  const call = () => {
    if (!hasPhone) return;
    Linking.openURL(`tel:${store.phone}`);
  };
  const openDirections = () => {
    Linking.openURL(
      `https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}`,
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Skeleton height={18} width="80%" />
        <Skeleton width={90} height={22} />
        <Skeleton height={260} radius={radius.lg} />
        <Skeleton height={120} radius={radius.lg} />
      </View>
    );
  }

  if (isError) {
    return (
      <EmptyState
        icon="time-outline"
        title={t('venue.hoursLoadError')}
        body={t('venue.hoursLoadErrorBody')}
      />
    );
  }

  const amenities = (store.amenities ?? []).filter((amenity) => KNOWN_AMENITIES.has(amenity));
  const noHours = calendarDays.every((day) => day.intervals.length === 0);
  let block = 0;

  return (
    <View style={styles.container}>
      {store.description ? (
        <Animated.View entering={enter(block++)}>
          <ThemedText variant="bodyLarge" color="textSecondary">
            {store.description}
          </ThemedText>
        </Animated.View>
      ) : null}

      {team.length > 0 ? (
        <Animated.View entering={enter(block++)}>
          <TeamSection members={team} />
        </Animated.View>
      ) : null}

      <Animated.View entering={enter(block++)}>
        <SectionHeader title={t('venue.hours')} />
        {noHours ? (
          <Card>
            <ThemedText variant="body" color="textSecondary">
              {t('venue.hoursNotSet')}
            </ThemedText>
          </Card>
        ) : (
          <Card padding="none">
            {calendarDays.map((day, index) => {
              const isToday = day.day_of_week === today;
              return (
                <View key={day.day_of_week}>
                  {index > 0 ? <Divider /> : null}
                  <View
                    style={[
                      styles.hoursRow,
                      isToday ? { backgroundColor: colors.brandTint } : null,
                    ]}
                  >
                    <View style={styles.weekday}>
                      <ThemedText variant={isToday ? 'bodyMedium' : 'body'}>
                        {weekdayName(day.day_of_week)}
                      </ThemedText>
                      {isToday ? (
                        <ThemedText variant="caption" color="brandAccent">
                          {t('venue.today')}
                        </ThemedText>
                      ) : null}
                    </View>
                    {/* One line per shift: split days stack, past-midnight closings say "(next day)". */}
                    <View style={styles.hoursColumn}>
                      {day.intervals.length === 0 ? (
                        <ThemedText variant="body" color="textTertiary">
                          {t('venue.closed')}
                        </ThemedText>
                      ) : (
                        day.intervals.map((interval) => (
                          <ThemedText
                            key={interval.opens_at}
                            variant={isToday ? 'bodyMedium' : 'body'}
                          >
                            {formatInterval(interval.opens_at, interval.closes_at)}
                          </ThemedText>
                        ))
                      )}
                    </View>
                  </View>
                </View>
              );
            })}
          </Card>
        )}
      </Animated.View>

      {specialDays.length > 0 ? (
        <Animated.View entering={enter(block++)}>
          <SectionHeader title={t('venue.upcomingExceptions')} />
          <Card padding="none">
            {specialDays.map((day, index) => (
              <View key={day.date}>
                {index > 0 ? <Divider /> : null}
                <View style={styles.hoursRow}>
                  <View style={styles.weekday}>
                    <ThemedText variant="body">{day.date}</ThemedText>
                    {day.reason ? (
                      <ThemedText variant="caption" color="textSecondary">
                        {day.reason}
                      </ThemedText>
                    ) : null}
                  </View>
                  <ThemedText
                    variant="body"
                    color={day.is_closed ? 'textTertiary' : 'textPrimary'}
                    style={styles.exceptionValue}
                  >
                    {day.is_closed
                      ? t('venue.closed')
                      : day.opens_at && day.closes_at
                        ? formatInterval(day.opens_at, day.closes_at)
                        : t('venue.open')}
                  </ThemedText>
                </View>
              </View>
            ))}
          </Card>
        </Animated.View>
      ) : null}

      <Animated.View entering={enter(block++)}>
        <SectionHeader title={t('venue.contactLocation')} />
        <Card padding="none">
          <InfoRow
            icon="call-outline"
            label={hasPhone ? t('venue.call') : undefined}
            text={hasPhone ? (store.phone as string) : t('venue.noPhone')}
            onPress={hasPhone ? call : undefined}
          />
          <Divider />
          <InfoRow
            icon="location-outline"
            label={t('venue.getDirections')}
            text={store.address}
            onPress={openDirections}
          />
        </Card>
      </Animated.View>

      {amenities.length > 0 ? (
        <Animated.View entering={enter(block++)}>
          <SectionHeader title={t('venue.amenities')} />
          <View style={styles.amenities}>
            {amenities.map((amenity) => (
              <Pill key={amenity} label={t(`venue.amenity.${amenity}`)} icon="checkmark" />
            ))}
          </View>
        </Animated.View>
      ) : null}

      {photos.length > 0 ? (
        <Animated.View entering={enter(block++)}>
          <GallerySection photos={photos} name={store.name} />
        </Animated.View>
      ) : null}
    </View>
  );
}

function InfoRow({
  icon,
  label,
  text,
  onPress,
}: {
  icon: ComponentProps<typeof Ionicons>['name'];
  /** The small action name above the text; also the accessibility label when tappable. */
  label?: string;
  text: string;
  onPress?: () => void;
}) {
  const colors = useColors();
  const body = (
    <View style={styles.infoRow}>
      <View style={[styles.well, { backgroundColor: colors.brandTint }]}>
        <Ionicons name={icon} size={18} color={colors.brandAccent} />
      </View>
      <View style={styles.infoText}>
        {label ? (
          <ThemedText variant="captionStrong" color="brandAccent">
            {label}
          </ThemedText>
        ) : null}
        <ThemedText variant="body" color={onPress ? 'textPrimary' : 'textSecondary'}>
          {text}
        </ThemedText>
      </View>
      {onPress ? <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} /> : null}
    </View>
  );
  if (!onPress) return body;
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label ?? ''} ${text}`.trim()}
      scaleTo={0.99}
    >
      {body}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: spacing.gutter, paddingTop: spacing.lg, gap: 28 },
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 48,
  },
  weekday: { flexShrink: 1 },
  hoursColumn: { alignItems: 'flex-end', flexShrink: 0 },
  exceptionValue: { textAlign: I18nManager.isRTL ? 'left' : 'right' },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    minHeight: 60,
  },
  well: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: { flex: 1, minWidth: 0 },
  amenities: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
});

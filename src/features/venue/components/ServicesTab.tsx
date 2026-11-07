import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { EmptyState } from '@/components/EmptyState';
import { Pill } from '@/components/Pill';
import { PressableScale } from '@/components/PressableScale';
import { Skeleton } from '@/components/Skeleton';
import { ThemedText } from '@/components/ThemedText';
import type { Service } from '@/features/booking/api/schemas';
import { formatMoney } from '@/lib/money';
import { enter, radius, shadows, spacing, useColors } from '@/theme';

interface ServicesTabProps {
  services: Service[];
  isLoading: boolean;
  isError: boolean;
  onBook: (service: Service) => void;
  /** Retry for the error state. */
  onRetry?: () => void;
  /** Service id -> "Any pro · Today · 3:30" summary for services already configured in the current multi-service booking draft. */
  draftSummaryByServiceId?: Record<string, string>;
}

interface Group {
  categoryId: string | null;
  label: string;
  services: Service[];
}

export function ServicesTab({
  services,
  isLoading,
  isError,
  onBook,
  onRetry,
  draftSummaryByServiceId = {},
}: ServicesTabProps) {
  const colors = useColors();
  const { t } = useTranslation();
  // Services arrive already ordered by category, uncategorised last, so a
  // Map keeps that order; the category comes embedded on each service.
  const groups = useMemo<Group[]>(() => {
    const byCategory = new Map<string | null, Group>();

    services.forEach((service) => {
      const categoryId = service.category?.id ?? null;
      const group = byCategory.get(categoryId) ?? {
        categoryId,
        label: service.category?.name ?? t('venue.servicesTab.other'),
        services: [],
      };
      group.services.push(service);
      byCategory.set(categoryId, group);
    });

    return Array.from(byCategory.values());
  }, [services, t]);

  // Every group starts expanded: collapsing is purely a display
  // preference, not something that should hide services by default.
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const toggleGroup = (key: string) => setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Skeleton width={110} height={22} />
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} height={108} radius={radius.lg} />
        ))}
      </View>
    );
  }

  if (isError) {
    return (
      <EmptyState
        icon="cloud-offline-outline"
        title={t('venue.servicesTab.loadError')}
        body={t('venue.servicesTab.loadErrorBody')}
        actionLabel={onRetry ? t('common.retry') : undefined}
        onAction={onRetry}
      />
    );
  }

  if (services.length === 0) {
    return (
      <EmptyState
        icon="cut-outline"
        title={t('venue.servicesTab.empty')}
        body={t('venue.servicesTab.emptyBody')}
      />
    );
  }

  return (
    <View style={styles.container}>
      {groups.map((group, groupIndex) => {
        const key = group.categoryId ?? 'uncategorised';
        const isCollapsed = collapsed[key] ?? false;
        return (
          <Animated.View key={key} entering={enter(groupIndex)} style={styles.group}>
            <PressableScale
              style={styles.groupHeader}
              onPress={() => toggleGroup(key)}
              accessibilityRole="button"
              accessibilityLabel={group.label}
              accessibilityState={{ expanded: !isCollapsed }}
              scaleTo={0.99}
            >
              <ThemedText variant="h2" numberOfLines={1} style={styles.groupTitle}>
                {group.label}
              </ThemedText>
              <ThemedText variant="caption" color="textTertiary">
                {group.services.length}
              </ThemedText>
              <Ionicons
                name={isCollapsed ? 'chevron-down' : 'chevron-up'}
                size={18}
                color={colors.textTertiary}
              />
            </PressableScale>
            {isCollapsed
              ? null
              : group.services.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    draftSummary={draftSummaryByServiceId[service.id]}
                    onPress={() => onBook(service)}
                  />
                ))}
          </Animated.View>
        );
      })}
    </View>
  );
}

function ServiceCard({
  service,
  draftSummary,
  onPress,
}: {
  service: Service;
  draftSummary: string | undefined;
  onPress: () => void;
}) {
  const colors = useColors();
  const { t } = useTranslation();
  const isSelected = draftSummary != null;
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      accessibilityLabel={t('venue.servicesTab.bookService', { name: service.name })}
      scaleTo={0.985}
      style={[
        styles.card,
        shadows.sm,
        {
          backgroundColor: colors.surface,
          borderColor: isSelected ? colors.brandAccent : colors.border,
          borderWidth: isSelected ? 1.5 : StyleSheet.hairlineWidth * 2,
        },
      ]}
    >
      <View style={styles.cardInfo}>
        <ThemedText variant="h3">{service.name}</ThemedText>
        {service.description ? (
          <ThemedText variant="caption" color="textSecondary" numberOfLines={2}>
            {service.description}
          </ThemedText>
        ) : null}
        <View style={styles.metaRow}>
          <View style={styles.meta}>
            <Ionicons name="time-outline" size={14} color={colors.textTertiary} />
            <ThemedText variant="caption" color="textSecondary">
              {t('booking.minutes', { count: service.duration_minutes })}
            </ThemedText>
          </View>
          {!service.requires_specialist && service.max_concurrent_bookings ? (
            <Pill label={t('venue.servicesTab.upTo', { count: service.max_concurrent_bookings })} />
          ) : null}
        </View>
        {isSelected ? (
          <ThemedText variant="captionStrong" color="brandAccent" numberOfLines={2}>
            {draftSummary}
          </ThemedText>
        ) : null}
      </View>
      <View style={styles.side}>
        <ThemedText variant="h3">{formatMoney(service.price, service.currency)}</ThemedText>
        {isSelected ? (
          <View style={[styles.action, { backgroundColor: colors.brand }]}>
            <Ionicons name="checkmark" size={18} color={colors.textOnBrand} />
          </View>
        ) : (
          <View style={[styles.action, { backgroundColor: colors.brandTint }]}>
            <ThemedText variant="captionStrong" color="brandAccent">
              {t('venue.servicesTab.book')}
            </ThemedText>
          </View>
        )}
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: spacing.gutter, paddingTop: spacing.lg, gap: 28 },
  group: { gap: spacing.sm },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: 44,
  },
  groupTitle: { flex: 1 },
  card: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
  },
  cardInfo: { flex: 1, minWidth: 0, gap: 4 },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: 2,
  },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  side: { alignItems: 'flex-end', justifyContent: 'space-between', gap: spacing.sm },
  action: {
    minWidth: 56,
    height: 36,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

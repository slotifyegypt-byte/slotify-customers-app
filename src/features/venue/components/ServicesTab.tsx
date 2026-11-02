import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { ThemedText } from '@/components/ThemedText';
import type { Service } from '@/features/booking/api/schemas';
import { formatMoney } from '@/lib/money';
import { radius, spacing, useColors, type Colors } from '@/theme';

interface ServicesTabProps {
  services: Service[];
  isLoading: boolean;
  isError: boolean;
  onBook: (service: Service) => void;
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
  draftSummaryByServiceId = {},
}: ServicesTabProps) {
  const colors = useColors();
  const styles = createStyles(colors);
  // Services arrive already ordered by category, uncategorised last, so a
  // Map keeps that order; the category comes embedded on each service.
  const groups = useMemo<Group[]>(() => {
    const byCategory = new Map<string | null, Group>();

    services.forEach((service) => {
      const categoryId = service.category?.id ?? null;
      const group = byCategory.get(categoryId) ?? {
        categoryId,
        label: service.category?.name ?? 'Other services' /* TODO i18n */,
        services: [],
      };
      group.services.push(service);
      byCategory.set(categoryId, group);
    });

    return Array.from(byCategory.values());
  }, [services]);

  // Every group starts expanded — collapsing is purely a display
  // preference, not something that should hide services by default.
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const toggleGroup = (key: string) => setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.brand} />
      </View>
    );
  }

  if (isError) {
    return <EmptyState title="Couldn't load services" body="Pull to refresh to try again." /* TODO i18n */ />;
  }

  if (services.length === 0) {
    return <EmptyState title="No services yet" /* TODO i18n */ />;
  }

  return (
    <View style={styles.container}>
      {groups.map((group) => {
        const key = group.categoryId ?? 'uncategorised';
        const isCollapsed = collapsed[key] ?? false;
        return (
          <View key={key} style={styles.group}>
            <Pressable
              style={styles.groupHeader}
              onPress={() => toggleGroup(key)}
              accessibilityRole="button"
              accessibilityState={{ expanded: !isCollapsed }}
            >
              <ThemedText variant="h3" style={styles.groupTitle}>
                {group.label}
              </ThemedText>
              <Ionicons
                name={isCollapsed ? 'chevron-down' : 'chevron-up'}
                size={18}
                color={colors.textSecondary}
              />
            </Pressable>
            {isCollapsed
              ? null
              : group.services.map((service) => {
                  const draftSummary = draftSummaryByServiceId[service.id];
                  const isSelected = draftSummary != null;
                  return (
                    <Pressable
                      key={service.id}
                      style={({ pressed }) => [styles.card, isSelected && styles.cardSelected, pressed && styles.cardPressed]}
                      onPress={() => onBook(service)}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected }}
                      accessibilityLabel={`Book ${service.name}`} // TODO i18n
                    >
                      <View style={styles.cardInfo}>
                        <ThemedText variant="bodyMedium">{service.name}</ThemedText>
                        {isSelected ? (
                          <ThemedText variant="caption" color="brandAccent" style={styles.description}>
                            {draftSummary}
                          </ThemedText>
                        ) : (
                          <>
                            {service.description ? (
                              <ThemedText variant="caption" color="textSecondary" numberOfLines={2} style={styles.description}>
                                {service.description}
                              </ThemedText>
                            ) : null}
                            <View style={styles.badgeRow}>
                              <ThemedText variant="caption" color="textSecondary">
                                {service.duration_minutes} min {/* TODO i18n */}
                              </ThemedText>
                              {!service.requires_specialist && service.max_concurrent_bookings ? (
                                <View style={styles.badge}>
                                  <ThemedText variant="caption" color="brand">
                                    Up to {service.max_concurrent_bookings} at once {/* TODO i18n */}
                                  </ThemedText>
                                </View>
                              ) : null}
                            </View>
                          </>
                        )}
                      </View>
                      <View style={styles.priceCol}>
                        <ThemedText variant="bodyMedium" style={styles.price}>
                          {formatMoney(service.price, service.currency)}
                        </ThemedText>
                        {isSelected ? (
                          <View style={styles.selectedBadge}>
                            <Ionicons name="checkmark" size={16} color={colors.textOnBrand} />
                          </View>
                        ) : (
                          <Ionicons name="chevron-forward-circle" size={30} color={colors.brand} />
                        )}
                      </View>
                    </Pressable>
                  );
                })}
          </View>
        );
      })}
    </View>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
  container: { paddingHorizontal: spacing.md, paddingTop: spacing.md },
  centered: { paddingVertical: spacing.xl, alignItems: 'center' },
  group: { marginBottom: spacing.lg },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  groupTitle: { letterSpacing: 0.5 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.backgroundMuted,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  cardPressed: { opacity: 0.7 },
  cardSelected: {
    borderLeftWidth: 3,
    borderLeftColor: colors.brandAccent,
    backgroundColor: colors.brandTint,
  },
  cardInfo: { flex: 1, marginRight: spacing.sm },
  description: { marginTop: 2 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xxs },
  badge: {
    marginLeft: spacing.xs,
    paddingHorizontal: spacing.xs,
    paddingVertical: 1,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
  },
  priceCol: { alignItems: 'center' },
  price: { marginBottom: spacing.xxs },
  selectedBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.brandAccent,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

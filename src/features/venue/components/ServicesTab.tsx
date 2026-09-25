import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { ThemedText } from '@/components/ThemedText';
import type { Service } from '@/features/booking/api/schemas';
import { radius, spacing, useColors, type Colors } from '@/theme';

import type { VenueServiceCategory } from '../api/schemas';

interface ServicesTabProps {
  services: Service[];
  categories: VenueServiceCategory[];
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
  categories,
  isLoading,
  isError,
  onBook,
  draftSummaryByServiceId = {},
}: ServicesTabProps) {
  const colors = useColors();
  const styles = createStyles(colors);
  const groups = useMemo<Group[]>(() => {
    const categoryNameById = new Map(categories.map((category) => [category.id, category.name]));
    const byCategory = new Map<string | null, Service[]>();

    services.forEach((service) => {
      const key = service.category_id;
      const list = byCategory.get(key) ?? [];
      list.push(service);
      byCategory.set(key, list);
    });

    return Array.from(byCategory.entries()).map(([categoryId, list]) => ({
      categoryId,
      label: categoryId ? categoryNameById.get(categoryId) ?? 'Other services' /* TODO i18n */ : 'Other services' /* TODO i18n */,
      services: list,
    }));
  }, [services, categories]);

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
                          {service.price_symbol}
                          {service.price.toFixed(0)}
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

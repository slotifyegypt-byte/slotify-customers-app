import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { Linking, Pressable, SectionList, StyleSheet, View, type SectionListRenderItemInfo } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { getStoreDetail } from '@/features/explore-search/api/exploreApi';
import { exploreKeys } from '@/features/explore-search/api/queryKeys';
import { formatRelativeTime } from '@/lib/formatRelativeTime';
import { fontFamily, radius, spacing, useColors, type Colors } from '@/theme';

import { notificationKeys } from '../api/queryKeys';
import type { Notification } from '../api/schemas';
import { useDeleteNotification, useMarkAllNotificationsRead, useNotifications } from '../hooks/useNotifications';
import { extractStoreName, notificationVisual } from '../utils/notificationVisual';

type Section = { title: string; data: Notification[] };

// customer-app-api-map.md §12 — grouping is computed client-side from
// `created_at`; the backend has no grouping concept of its own.
function groupByDay(notifications: Notification[]): Section[] {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  const groups: Record<'Today' | 'Yesterday' | 'Earlier', Notification[]> = {
    Today: [],
    Yesterday: [],
    Earlier: [],
  };

  for (const notification of notifications) {
    const created = new Date(notification.created_at);
    if (!Number.isNaN(created.getTime()) && created >= startOfToday) {
      groups.Today.push(notification);
    } else if (!Number.isNaN(created.getTime()) && created >= startOfYesterday) {
      groups.Yesterday.push(notification);
    } else {
      groups.Earlier.push(notification);
    }
  }

  return (['Today', 'Yesterday', 'Earlier'] as const)
    .map((title) => ({ title, data: groups[title] }))
    .filter((section) => section.data.length > 0);
}

export function NotificationsScreen() {
  const colors = useColors();
  const styles = createStyles(colors);
  const { data: notifications, isLoading, isError, refetch } = useNotifications();
  const markAllRead = useMarkAllNotificationsRead();
  const deleteNotification = useDeleteNotification();
  const queryClient = useQueryClient();

  const sections = useMemo(() => groupByDay(notifications ?? []), [notifications]);
  const hasUnread = (notifications ?? []).some((n) => !n.is_read);

  const handleDelete = useCallback(
    (id: number) => {
      deleteNotification.mutate(id);
    },
    [deleteNotification],
  );

  // The doc (§12) confirms there's still no per-notification "mark read"
  // endpoint — only mark-all-read and delete exist server-side. `store_id`/
  // `booking_id` now exist on NotificationRead (VERIFIED against the live
  // backend's /openapi.json, 2026-09-20), but there's still no dedicated
  // notification-detail screen to deep-link to, so tap just flips it to read
  // locally in the cache; this intentionally doesn't round-trip to the
  // server since there's nothing to call.
  const handlePress = useCallback(
    (id: number) => {
      queryClient.setQueriesData<Notification[]>({ queryKey: notificationKeys.all }, (prev) =>
        prev?.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
      );
    },
    [queryClient],
  );

  // customer-app-api-map.md §12 — VERIFIED against the live backend's
  // /openapi.json (2026-09-20): `store_id` now exists on NotificationRead,
  // so this resolves the store's real coordinates (same directions-URL
  // pattern as AboutTab/BookingDetailScreen) instead of guessing a store
  // name out of the message text. Falls back to the old name-based maps
  // search only if `store_id` is missing or fails to resolve — shouldn't
  // happen for `pickup_ready` per the current contract, but this keeps the
  // action from silently doing nothing if it ever does.
  const handleGetDirections = useCallback(
    async (notification: Notification) => {
      if (notification.store_id) {
        try {
          const store = await queryClient.fetchQuery({
            queryKey: exploreKeys.storeDetail(notification.store_id),
            queryFn: () => getStoreDetail(notification.store_id!),
          });
          Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}`);
          return;
        } catch {
          // Fall through to the name-based fallback below.
        }
      }

      const storeName = extractStoreName(notification.message);
      if (!storeName) return;
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(storeName)}`);
    },
    [queryClient],
  );

  const renderItem = useCallback(
    ({ item }: SectionListRenderItemInfo<Notification, Section>) => {
      const visual = notificationVisual(item.notification_type, colors);
      return (
        <Swipeable
          renderRightActions={() => (
            <Pressable
              style={styles.deleteAction}
              onPress={() => handleDelete(item.id)}
              accessibilityRole="button"
              accessibilityLabel="Delete notification" // TODO i18n
            >
              <ThemedText variant="bodyMedium" color="textOnBrand">
                Delete{/* TODO i18n */}
              </ThemedText>
            </Pressable>
          )}
          overshootRight={false}
        >
          <Pressable style={styles.row} onPress={() => handlePress(item.id)} accessibilityRole="button">
            <View style={[styles.iconWell, { backgroundColor: visual.tint }]}>
              <Ionicons name={visual.icon} size={18} color={visual.iconColor} />
            </View>
            <View style={styles.rowText}>
              <View style={styles.titleRow}>
                {!item.is_read ? <View style={styles.unreadDot} /> : null}
                <ThemedText
                  variant="bodyMedium"
                  style={[styles.titleText, !item.is_read && styles.titleUnread]}
                  numberOfLines={1}
                >
                  {item.title}
                </ThemedText>
                <ThemedText variant="caption" color="textSecondary" style={styles.timestamp}>
                  {formatRelativeTime(item.created_at)}
                </ThemedText>
              </View>
              <ThemedText variant="body" color="textSecondary" style={styles.message}>
                {item.message}
              </ThemedText>
              {visual.showDirections ? (
                <Pressable
                  style={styles.directionsButton}
                  onPress={() => handleGetDirections(item)}
                  accessibilityRole="button"
                >
                  <ThemedText variant="caption" color="brandAccent" style={styles.directionsLabel}>
                    Get Directions{/* TODO i18n */}
                  </ThemedText>
                </Pressable>
              ) : null}
            </View>
          </Pressable>
        </Swipeable>
      );
    },
    [colors, handleDelete, handleGetDirections, handlePress, styles],
  );

  if (isError) {
    return (
      <Screen style={styles.padded}>
        <View style={styles.titleRow2}>
          <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={8}>
            <Ionicons name="chevron-back" size={18} color={colors.brand} />
          </Pressable>
          <ThemedText variant="h1">Notifications</ThemedText>
        </View>
        <EmptyState
          title="Couldn't load notifications" // TODO i18n
          body="Check your connection and try again." // TODO i18n
          actionLabel="Retry" // TODO i18n
          onAction={() => refetch()}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.titleRow2}>
          <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={8}>
            <Ionicons name="chevron-back" size={18} color={colors.brand} />
          </Pressable>
          <ThemedText variant="h1">Notifications</ThemedText>
        </View>
        {hasUnread ? (
          <Pressable
            onPress={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
            accessibilityRole="button"
            hitSlop={8}
            style={[styles.markAllButton, markAllRead.isPending && styles.markAllButtonPending]}
          >
            <ThemedText variant="bodyMedium" color="brandAccent">
              Mark all as read{/* TODO i18n */}
            </ThemedText>
          </Pressable>
        ) : null}
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        renderSectionHeader={({ section }) => (
          <ThemedText variant="caption" color="textSecondary" style={styles.sectionHeader}>
            {section.title}
          </ThemedText>
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !isLoading ? <EmptyState title="No notifications yet" body="You're all caught up." /> : null // TODO i18n
        }
      />
    </Screen>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
  padded: { padding: spacing.lg },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.xs,
  },
  titleRow2: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.brandTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markAllButton: { alignSelf: 'flex-end' },
  markAllButtonPending: { opacity: 0.5 },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, flexGrow: 1 },
  sectionHeader: {
    backgroundColor: colors.background,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  iconWell: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs,
    flexShrink: 0,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  titleText: { flexShrink: 1 },
  titleUnread: { fontFamily: fontFamily.bodySemiBold },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.brandAccent,
    marginRight: spacing.xxs,
  },
  rowText: { flex: 1 },
  message: { marginTop: spacing.xxs },
  timestamp: { marginLeft: 'auto', paddingLeft: spacing.xs, flexShrink: 0 },
  directionsButton: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.brandAccent,
  },
  directionsLabel: { fontFamily: fontFamily.bodyMedium },
  deleteAction: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.danger,
    width: 72,
    borderRadius: radius.md,
    marginBottom: spacing.xs,
  },
  });

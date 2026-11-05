import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Linking,
  SectionList,
  StyleSheet,
  View,
  type SectionListRenderItemInfo,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { IconButton } from '@/components/IconButton';
import { PressableScale } from '@/components/PressableScale';
import { Screen } from '@/components/Screen';
import { Skeleton } from '@/components/Skeleton';
import { ThemedText } from '@/components/ThemedText';
import { getStoreDetail } from '@/features/explore-search/api/exploreApi';
import { exploreKeys } from '@/features/explore-search/api/queryKeys';
import { formatRelativeTime } from '@/lib/formatRelativeTime';
import { enter, fontFamily, radius, spacing, useColors, type Colors } from '@/theme';

import type { Notification } from '../api/schemas';
import {
  useDeleteNotification,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from '../hooks/useNotifications';
import { routeForNotificationData } from '../push';
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

const SECTION_LABEL_KEY = {
  Today: 'notifications.today',
  Yesterday: 'notifications.yesterday',
  Earlier: 'notifications.earlier',
} as const;

export function NotificationsScreen() {
  const { t } = useTranslation();
  const colors = useColors();
  const styles = createStyles(colors);
  const { data: notifications, isLoading, isError, refetch } = useNotifications();
  const markAllRead = useMarkAllNotificationsRead();
  // `.mutate` is stable; the mutation result object is not, so only `.mutate`
  // goes into callback dependencies.
  const { mutate: deleteNotification } = useDeleteNotification();
  const { mutate: markRead } = useMarkNotificationRead();
  const queryClient = useQueryClient();

  const sections = useMemo(() => groupByDay(notifications ?? []), [notifications]);
  const hasUnread = (notifications ?? []).some((n) => !n.is_read);

  const handleDelete = useCallback(
    (id: string) => {
      deleteNotification(id);
    },
    [deleteNotification],
  );

  // Tapping marks the notification read (RLS-scoped update of `read_at`) and
  // opens what it is about: the booking, else the venue.
  const handlePress = useCallback(
    (notification: Notification) => {
      if (!notification.is_read) markRead(notification.id);
      const route = routeForNotificationData({
        booking_id: notification.booking_id,
        branch_id: notification.store_id,
      });
      if (route) router.push(route);
    },
    [markRead],
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
          Linking.openURL(
            `https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}`,
          );
          return;
        } catch {
          // Fall through to the name-based fallback below.
        }
      }

      const storeName = extractStoreName(notification.message);
      if (!storeName) return;
      Linking.openURL(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(storeName)}`,
      );
    },
    [queryClient],
  );

  const renderItem = useCallback(
    ({ item, index }: SectionListRenderItemInfo<Notification, Section>) => {
      const visual = notificationVisual(item.notification_type, colors);
      return (
        <Animated.View entering={enter(index)}>
          <Swipeable
            renderRightActions={() => (
              <PressableScale
                style={styles.deleteAction}
                onPress={() => handleDelete(item.id)}
                accessibilityRole="button"
                accessibilityLabel={t('notifications.deleteLabel')}
              >
                <Ionicons name="trash-outline" size={20} color={colors.textInverse} />
                <ThemedText variant="captionStrong" color="textInverse">
                  {t('notifications.delete')}
                </ThemedText>
              </PressableScale>
            )}
            overshootRight={false}
          >
            <Card
              onPress={() => handlePress(item)}
              accessibilityLabel={`${item.is_read ? '' : `${t('notifications.unread')}. `}${item.title}. ${item.message}`}
            >
              <View style={styles.row}>
                <View style={[styles.iconWell, { backgroundColor: visual.tint }]}>
                  <Ionicons name={visual.icon} size={20} color={visual.iconColor} />
                </View>
                <View style={styles.rowText}>
                  <View style={styles.titleRow}>
                    {!item.is_read ? <View style={styles.unreadDot} /> : null}
                    <ThemedText
                      variant="body"
                      color={item.is_read ? 'textSecondary' : 'textPrimary'}
                      style={[
                        styles.titleText,
                        item.is_read ? styles.titleRead : styles.titleUnread,
                      ]}
                      numberOfLines={2}
                    >
                      {item.title}
                    </ThemedText>
                    <ThemedText variant="caption" color="textTertiary" style={styles.timestamp}>
                      {formatRelativeTime(item.created_at)}
                    </ThemedText>
                  </View>
                  {item.message ? (
                    <ThemedText
                      variant="body"
                      color={item.is_read ? 'textTertiary' : 'textSecondary'}
                      style={styles.message}
                      numberOfLines={3}
                    >
                      {item.message}
                    </ThemedText>
                  ) : null}
                  {visual.showDirections ? (
                    <View style={styles.directions}>
                      <Button
                        label={t('notifications.directions')}
                        variant="secondary"
                        size="sm"
                        icon="navigate-outline"
                        fullWidth={false}
                        onPress={() => handleGetDirections(item)}
                      />
                    </View>
                  ) : null}
                </View>
              </View>
            </Card>
          </Swipeable>
        </Animated.View>
      );
    },
    [colors, handleDelete, handleGetDirections, handlePress, styles, t],
  );

  const empty = isLoading ? (
    <View style={styles.skeletons}>
      {[0, 1, 2, 3].map((i) => (
        <Card key={i}>
          <View style={styles.row}>
            <Skeleton width={44} height={44} radius={radius.md} />
            <View style={styles.skeletonText}>
              <Skeleton width="60%" height={16} />
              <Skeleton width="90%" height={12} />
            </View>
          </View>
        </Card>
      ))}
    </View>
  ) : isError ? (
    <EmptyState
      icon="cloud-offline-outline"
      title={t('notifications.errorTitle')}
      body={t('notifications.errorBody')}
      actionLabel={t('common.retry')}
      onAction={() => refetch()}
    />
  ) : (
    <EmptyState
      icon="checkmark-done-outline"
      title={t('notifications.emptyTitle')}
      body={t('notifications.emptyBody')}
    />
  );

  return (
    <Screen edges={['top']}>
      <SectionList
        sections={isError ? [] : sections}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={Gap}
        ListHeaderComponent={
          <Animated.View entering={enter(0)} style={styles.header}>
            <View style={styles.topRow}>
              <IconButton
                icon="chevron-back"
                accessibilityLabel="Back"
                onPress={() => router.back()}
              />
              {hasUnread && !isError ? (
                <PressableScale
                  onPress={() => markAllRead.mutate()}
                  disabled={markAllRead.isPending}
                  accessibilityRole="button"
                  accessibilityLabel={t('notifications.markAllRead')}
                  hitSlop={8}
                  style={[styles.markAll, markAllRead.isPending && styles.markAllPending]}
                >
                  <ThemedText variant="bodyMedium" color="brandAccent">
                    {t('notifications.markAllRead')}
                  </ThemedText>
                </PressableScale>
              ) : null}
            </View>
            <ThemedText variant="h1" accessibilityRole="header">
              {t('notifications.title')}
            </ThemedText>
          </Animated.View>
        }
        renderSectionHeader={({ section }) => (
          <ThemedText variant="bodyMedium" color="textSecondary" style={styles.sectionHeader}>
            {t(SECTION_LABEL_KEY[section.title as keyof typeof SECTION_LABEL_KEY])}
          </ThemedText>
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={empty}
      />
    </Screen>
  );
}

function Gap() {
  return <View style={{ height: spacing.sm }} />;
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    header: { gap: spacing.sm, paddingTop: spacing.sm, paddingBottom: spacing.xs },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: 44,
    },
    markAll: { minHeight: 44, justifyContent: 'center' },
    markAllPending: { opacity: 0.5 },
    listContent: { flexGrow: 1, paddingHorizontal: spacing.gutter, paddingBottom: 120 },
    sectionHeader: { paddingTop: spacing.md, paddingBottom: spacing.sm },
    row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
    iconWell: {
      width: 44,
      height: 44,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    rowText: { flex: 1, minWidth: 0 },
    titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs },
    titleText: { flex: 1, minWidth: 0 },
    titleRead: { fontFamily: fontFamily.bodyRegular },
    titleUnread: { fontFamily: fontFamily.bodySemiBold },
    unreadDot: {
      width: 8,
      height: 8,
      borderRadius: radius.pill,
      backgroundColor: colors.brandAccent,
      marginTop: 8,
    },
    timestamp: { flexShrink: 0, marginTop: 2 },
    message: { marginTop: spacing.xxs },
    directions: { alignSelf: 'flex-start', marginTop: spacing.sm },
    deleteAction: {
      justifyContent: 'center',
      alignItems: 'center',
      gap: 2,
      backgroundColor: colors.danger,
      width: 84,
      borderRadius: radius.lg,
      marginStart: spacing.xs,
    },
    skeletons: { gap: spacing.sm, paddingTop: spacing.md },
    skeletonText: { flex: 1, gap: 10, paddingTop: 4 },
  });

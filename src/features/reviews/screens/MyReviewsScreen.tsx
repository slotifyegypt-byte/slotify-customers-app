import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, FlatList, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { Photo } from '@/components/Photo';
import { PressableScale } from '@/components/PressableScale';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Skeleton } from '@/components/Skeleton';
import { TextField } from '@/components/TextField';
import { ThemedText } from '@/components/ThemedText';
import type { BookingRead } from '@/features/booking/api/schemas';
import { useMyBookings } from '@/features/booking/hooks/useMyBookings';
import { useMyProfile } from '@/features/profile/hooks/useProfile';
import { formatDate } from '@/lib/time/branchTime';
import { enter, radius, spacing, useColors } from '@/theme';

import type { CustomerReview } from '../api/schemas';
import { StarRating } from '../components/StarRating';
import { useMyReviews } from '../hooks/useMyReviews';
import { useDeleteReview, useUpdateReview } from '../hooks/useReviewMutations';

// Every review carries its `booking_id`, so the visit it was written for is resolved against the customer's full
// booking list (one request for the whole screen, not one per row).
// Same last-resort zone the bookings feature uses (the branches.timezone default).
const FALLBACK_TIMEZONE = 'Africa/Cairo';

export function MyReviewsScreen() {
  const { t } = useTranslation();
  const profile = useMyProfile();
  const customerId = profile.data?.id;
  const reviews = useMyReviews(customerId);
  // Unfiltered (no `status`) so it covers every booking a review could be linked to, fetched once for the whole
  // list, not per review.
  const bookings = useMyBookings();
  const bookingsById = useMemo(() => {
    const map = new Map<string, BookingRead>();
    bookings.data?.forEach((booking) => map.set(booking.id, booking));
    return map;
  }, [bookings.data]);

  const isLoading = profile.isLoading || reviews.isLoading;
  const isError = profile.isError || reviews.isError;

  return (
    <Screen edges={['top']}>
      <ScreenHeader title={t('reviews.title')} />

      {isLoading ? (
        <View style={styles.list}>
          {[0, 1, 2].map((i) => (
            <ReviewSkeleton key={i} />
          ))}
        </View>
      ) : isError ? (
        <View style={styles.flex}>
          <EmptyState
            icon="cloud-offline-outline"
            title={t('common.errorGeneric')}
            actionLabel={t('common.retry')}
            onAction={() => reviews.refetch()}
          />
        </View>
      ) : !reviews.data?.length ? (
        <View style={styles.flex}>
          <EmptyState
            icon="star-outline"
            title={t('reviews.emptyTitle')}
            body={t('reviews.emptyBody')}
            actionLabel={t('reviews.emptyAction')}
            onAction={() => router.push('/(tabs)/activity')}
          />
        </View>
      ) : (
        <FlatList<CustomerReview>
          data={reviews.data}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item, index }) => (
            <Animated.View entering={enter(Math.min(index, 6))}>
              <ReviewCard
                review={item}
                linkedBooking={item.booking_id ? bookingsById.get(item.booking_id) : undefined}
              />
            </Animated.View>
          )}
        />
      )}
    </Screen>
  );
}

function ReviewCard({
  review,
  linkedBooking,
}: {
  review: CustomerReview;
  linkedBooking: BookingRead | undefined;
}) {
  const { t } = useTranslation();
  const colors = useColors();
  const updateReview = useUpdateReview();
  const deleteReview = useDeleteReview();

  const [editing, setEditing] = useState(false);
  const [rating, setRating] = useState(review.rating);
  const [comment, setComment] = useState(review.comment ?? '');

  const venueName = review.store_name ?? t('reviews.unavailableVenue');
  const date = formatDate(
    review.created_at,
    review.timezone ?? linkedBooking?.timezone ?? FALLBACK_TIMEZONE,
  );

  const startEdit = () => {
    setRating(review.rating);
    setComment(review.comment ?? '');
    setEditing(true);
  };

  const handleSave = async () => {
    try {
      await updateReview.mutateAsync({
        reviewId: review.id,
        payload: { rating, comment: comment.trim() },
      });
      setEditing(false);
    } catch {
      Alert.alert(t('reviews.saveError'));
    }
  };

  const handleDelete = () => {
    Alert.alert(t('reviews.deleteConfirmTitle'), t('reviews.deleteConfirmBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('reviews.delete'),
        style: 'destructive',
        onPress: () =>
          deleteReview.mutate(review.id, { onError: () => Alert.alert(t('common.errorGeneric')) }),
      },
    ]);
  };

  return (
    <Card>
      <View style={styles.cardBody}>
        <PressableScale
          // A deactivated branch has no venue page to open.
          disabled={review.store_name === null}
          onPress={() => router.push(`/venue/${review.store_id}`)}
          accessibilityRole="button"
          accessibilityLabel={venueName}
          scaleTo={0.98}
          style={styles.head}
        >
          <Photo name={venueName} style={styles.photo} initialSize={18} />
          <View style={styles.headText}>
            <ThemedText variant="h3" numberOfLines={1}>
              {venueName}
            </ThemedText>
            <ThemedText variant="caption" color="textTertiary" numberOfLines={1}>
              {date}
            </ThemedText>
          </View>
        </PressableScale>

        {linkedBooking ? (
          <View style={styles.visit}>
            <Ionicons name="calendar-outline" size={14} color={colors.textTertiary} />
            <ThemedText variant="caption" color="textSecondary" style={styles.visitText}>
              {t('reviews.linkedVisit')}: {linkedBooking.booking_services_str} ·{' '}
              {formatDate(linkedBooking.booking_date, linkedBooking.timezone)}
            </ThemedText>
          </View>
        ) : null}

        {editing ? (
          <>
            <View style={styles.editStars}>
              <StarRating rating={rating} onChange={setRating} size={32} />
            </View>
            <TextField
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={3}
              placeholder={t('reviews.commentPlaceholder')}
              accessibilityLabel={t('reviews.editTitle')}
              style={styles.input}
            />
            <View style={styles.actions}>
              <Button
                label={t('common.save')}
                size="sm"
                onPress={handleSave}
                loading={updateReview.isPending}
                fullWidth={false}
              />
              <Button
                label={t('common.cancel')}
                size="sm"
                variant="ghost"
                onPress={() => setEditing(false)}
                fullWidth={false}
              />
            </View>
          </>
        ) : (
          <>
            <StarRating rating={review.rating} size={18} spacing={3} />
            {review.comment ? <ThemedText variant="body">{review.comment}</ThemedText> : null}
            {review.owner_reply ? (
              <View style={[styles.reply, { backgroundColor: colors.backgroundMuted }]}>
                <ThemedText variant="captionStrong" color="textSecondary">
                  {t('reviews.venueReply')}
                </ThemedText>
                <ThemedText variant="body">{review.owner_reply}</ThemedText>
              </View>
            ) : null}
            <View style={styles.actions}>
              <Button
                label={t('reviews.edit')}
                icon="create-outline"
                size="sm"
                variant="secondary"
                onPress={startEdit}
                fullWidth={false}
              />
              <Button
                label={t('reviews.delete')}
                icon="trash-outline"
                size="sm"
                variant="ghost"
                tone="danger"
                onPress={handleDelete}
                fullWidth={false}
              />
            </View>
          </>
        )}
      </View>
    </Card>
  );
}

function ReviewSkeleton() {
  const colors = useColors();
  return (
    <View
      style={[styles.skeleton, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <View style={styles.head}>
        <Skeleton width={44} height={44} radius={radius.sm + 2} />
        <View style={styles.headText}>
          <Skeleton width="55%" height={17} />
          <Skeleton width="30%" height={13} />
        </View>
      </View>
      <Skeleton width={110} height={16} />
      <Skeleton width="92%" height={15} />
      <Skeleton width="70%" height={15} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.xs,
    paddingBottom: 120,
    gap: spacing.sm,
  },
  cardBody: { gap: spacing.sm },
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm + 2 },
  photo: { width: 44, height: 44, borderRadius: radius.sm + 2 },
  headText: { flex: 1, minWidth: 0, gap: 2 },
  visit: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  visitText: { flex: 1 },
  reply: { borderRadius: radius.md, padding: spacing.sm + 2, gap: 2 },
  editStars: { alignSelf: 'flex-start', marginStart: -spacing.xs },
  input: { minHeight: 88, paddingTop: spacing.sm, textAlignVertical: 'top' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.xxs },
  skeleton: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth * 2,
    padding: spacing.md,
    gap: spacing.sm,
  },
});

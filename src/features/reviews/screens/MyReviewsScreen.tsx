import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ThemedText } from '@/components/ThemedText';
import type { BookingRead } from '@/features/booking/api/schemas';
import { useMyBookings } from '@/features/booking/hooks/useMyBookings';
import { formatBookingDateStr } from '@/features/booking/utils/time';
import { useStoreDetail } from '@/features/explore-search/hooks/useStoreDetail';
import { useMyProfile } from '@/features/profile/hooks/useProfile';
import { radius, spacing, useColors, type Colors } from '@/theme';

import type { Review } from '../api/schemas';
import { StarRating } from '../components/StarRating';
import { useMyReviews } from '../hooks/useMyReviews';
import { useDeleteReview, useUpdateReview } from '../hooks/useReviewMutations';

// customer-app-api-map.md §11 — GET /reviews/customer/{customer_id}.
// VERIFIED against live /openapi.json (2026-09-20): `ReviewRead` now
// optionally carries `booking_id`, tying a review back to the specific
// visit it was written for. There's no dedicated "booking by id, for
// reviews" lookup endpoint, so rather than fetch per-review (N+1), this
// resolves `booking_id` against the customer's already-cheap-to-fetch full
// booking list (one extra request for the whole screen, not one per row).
export function MyReviewsScreen() {
  const colors = useColors();
  const styles = createStyles(colors);
  const { t } = useTranslation();
  const profile = useMyProfile();
  const customerId = profile.data?.id;
  const reviews = useMyReviews(customerId);
  // Unfiltered (no `status`) so it covers every booking a review could be
  // linked to, fetched once for the whole list — not per review.
  const bookings = useMyBookings();
  const bookingsById = useMemo(() => {
    const map = new Map<string, BookingRead>();
    bookings.data?.forEach((booking) => map.set(booking.id, booking));
    return map;
  }, [bookings.data]);

  const isLoading = profile.isLoading || reviews.isLoading;
  const isError = profile.isError || reviews.isError;

  return (
    <Screen edges={['top']} style={styles.screen}>
      <ScreenHeader title={t('reviews.title')} />

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.brand} />
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <EmptyState
            title={t('common.errorGeneric')}
            actionLabel={t('common.retry')}
            onAction={() => reviews.refetch()}
          />
        </View>
      ) : !reviews.data?.length ? (
        <View style={styles.center}>
          <EmptyState title={t('reviews.emptyTitle')} />
        </View>
      ) : (
        <FlatList<Review>
          data={reviews.data}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <ReviewRow
              review={item}
              customerId={customerId}
              linkedBooking={item.booking_id ? bookingsById.get(item.booking_id) : undefined}
            />
          )}
        />
      )}
    </Screen>
  );
}

function ReviewRow({
  review,
  customerId,
  linkedBooking,
}: {
  review: Review;
  customerId: string | undefined;
  linkedBooking: BookingRead | undefined;
}) {
  const colors = useColors();
  const styles = createStyles(colors);
  const { t } = useTranslation();
  const store = useStoreDetail(review.store_id);
  const updateReview = useUpdateReview(customerId);
  const deleteReview = useDeleteReview(customerId);

  const [editing, setEditing] = useState(false);
  const [rating, setRating] = useState(review.rating);
  const [comment, setComment] = useState(review.comment ?? '');

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
        onPress: () => deleteReview.mutate(review.id),
      },
    ]);
  };

  return (
    <View style={styles.card}>
      <Pressable onPress={() => router.push(`/venue/${review.store_id}`)}>
        <ThemedText variant="h3" numberOfLines={1}>
          {store.data?.name ?? review.store_id}
        </ThemedText>
      </Pressable>
      {linkedBooking ? (
        <ThemedText
          variant="caption"
          color="textSecondary"
          style={styles.linkedVisit}
          numberOfLines={1}
        >
          {t('reviews.linkedVisit')}: {linkedBooking.booking_services_str} ·{' '}
          {formatBookingDateStr(linkedBooking.booking_date)}
        </ThemedText>
      ) : null}

      {editing ? (
        <>
          <StarRating rating={rating} onChange={setRating} />
          <TextInput
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={3}
            placeholder={t('reviews.commentPlaceholder')}
            placeholderTextColor={colors.textSecondary}
            style={styles.input}
          />
          <View style={styles.editActions}>
            <Button
              label={t('common.save')}
              onPress={handleSave}
              loading={updateReview.isPending}
              fullWidth={false}
            />
            <Button
              label={t('common.cancel')}
              variant="ghost"
              onPress={() => setEditing(false)}
              fullWidth={false}
              style={styles.editActionSpacing}
            />
          </View>
        </>
      ) : (
        <>
          <StarRating rating={review.rating} />
          {review.comment ? (
            <ThemedText variant="body" style={styles.comment}>
              {review.comment}
            </ThemedText>
          ) : null}
          {review.owner_reply ? (
            <View style={styles.replyBox}>
              <ThemedText variant="caption" color="textSecondary">
                {t('reviews.storeReply')}
              </ThemedText>
              <ThemedText variant="body">{review.owner_reply}</ThemedText>
            </View>
          ) : null}
          <ThemedText variant="caption" color="textSecondary" style={styles.date}>
            {review.review_date_str ?? review.created_at}
          </ThemedText>
          <View style={styles.rowActions}>
            <Pressable onPress={startEdit} hitSlop={8}>
              <ThemedText variant="bodyMedium" color="brand">
                {t('reviews.edit')}
              </ThemedText>
            </Pressable>
            <Pressable onPress={handleDelete} hitSlop={8} style={styles.deleteAction}>
              <ThemedText variant="bodyMedium" color="danger">
                {t('reviews.delete')}
              </ThemedText>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    screen: { padding: 0 },
    header: { paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.md },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    list: { paddingHorizontal: spacing.md, paddingBottom: spacing.xxl },
    card: {
      backgroundColor: colors.backgroundMuted,
      borderRadius: radius.lg,
      padding: spacing.md,
      marginBottom: spacing.sm,
    },
    linkedVisit: { marginTop: spacing.xxs },
    comment: { marginTop: spacing.xs },
    replyBox: {
      marginTop: spacing.sm,
      padding: spacing.sm,
      borderRadius: radius.md,
      backgroundColor: colors.surface,
    },
    date: { marginTop: spacing.xs },
    rowActions: { flexDirection: 'row', marginTop: spacing.sm },
    deleteAction: { marginLeft: spacing.md },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.sm,
      color: colors.textPrimary,
      marginTop: spacing.xs,
      minHeight: 72,
      textAlignVertical: 'top',
    },
    editActions: { flexDirection: 'row', marginTop: spacing.sm },
    editActionSpacing: { marginLeft: spacing.sm },
  });

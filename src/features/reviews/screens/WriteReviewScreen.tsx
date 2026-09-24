import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { useStoreDetail } from '@/features/explore-search/hooks/useStoreDetail';
import { colors, radius, spacing } from '@/theme';

import { StarRating } from '../components/StarRating';
import { useCreateReview } from '../hooks/useReviewMutations';

// customer-app-api-map.md §5: `ReviewCreate` now optionally accepts a
// `booking_id` (VERIFIED against live /openapi.json, 2026-09-20), which the
// backend validates is one of the customer's own COMPLETED bookings at
// `storeId` — 400s otherwise. `bookingId` is forwarded by
// BookingDetailScreen's `handleWriteReview`, the only entry point that is
// gated on `booking_status === 'completed'`, so it's always eligible when
// present. Other entry points (e.g. VenueDetailScreen's "Write a review"
// button, reached from the venue profile rather than a specific booking)
// don't have a booking in scope and simply omit the param — this screen
// treats it as optional and never requires it. `serviceName`/`date` remain
// optional, display-only params — never sent in the create payload.
export function WriteReviewScreen() {
  const { t } = useTranslation();
  const { storeId, bookingId, serviceName, date } = useLocalSearchParams<{
    storeId: string;
    bookingId?: string;
    serviceName?: string;
    date?: string;
  }>();
  const store = useStoreDetail(storeId);
  const createReview = useCreateReview();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  // Only reachable via BookingDetailScreen's gated "Write a review" button
  // (completed bookings only), which always passes storeId — this guards
  // against a bare/untargeted deep link into the route.
  if (!storeId) {
    return (
      <Screen style={styles.container}>
        <EmptyState
          title={t('reviews.missingContext')}
          actionLabel={t('common.cancel')}
          onAction={() => router.back()}
        />
      </Screen>
    );
  }

  const handleSubmit = async () => {
    try {
      await createReview.mutateAsync({
        store_id: storeId,
        rating,
        comment: comment.trim() || undefined,
        booking_id: bookingId || undefined,
      });
      Alert.alert(t('reviews.submitSuccessTitle'), undefined, [
        { text: t('common.ok'), onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert(t('reviews.submitError'), t('reviews.submitErrorBody'));
    }
  };

  return (
    <Screen style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText variant="h2">{t('reviews.writeReviewTitle')}</ThemedText>
        {store.data ? (
          <ThemedText variant="body" color="textSecondary" style={styles.storeName}>
            {store.data.name}
          </ThemedText>
        ) : null}
        {serviceName || date ? (
          <ThemedText variant="caption" color="textSecondary" style={styles.meta}>
            {[serviceName, date].filter(Boolean).join(' · ')}
          </ThemedText>
        ) : null}

        <View style={styles.starsWrap}>
          <StarRating rating={rating} onChange={setRating} size={32} spacing={8} />
        </View>

        <ThemedText variant="caption" color="textSecondary" style={styles.label}>
          {t('reviews.yourReview')}
        </ThemedText>
        <TextInput
          value={comment}
          onChangeText={setComment}
          placeholder={t('reviews.reviewPlaceholder')}
          placeholderTextColor={colors.textSecondary}
          style={styles.input}
          multiline
          numberOfLines={5}
        />

        <Button
          label={t('reviews.submit')}
          onPress={handleSubmit}
          loading={createReview.isPending}
          disabled={rating === 0}
          style={styles.submitButton}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  storeName: { marginTop: spacing.xxs },
  meta: { marginTop: spacing.xxs },
  starsWrap: { alignItems: 'center', marginVertical: spacing.lg },
  label: { marginBottom: spacing.xxs },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    color: colors.textPrimary,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  submitButton: { marginTop: spacing.xl },
});

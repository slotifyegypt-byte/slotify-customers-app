import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { useStoreDetail } from '@/features/explore-search/hooks/useStoreDetail';
import { isApiError } from '@/lib/api/errors';
import { radius, spacing, useColors, type Colors } from '@/theme';

import { StarRating } from '../components/StarRating';
import { useCreateReview } from '../hooks/useReviewMutations';

// A review is always for one booking (`booking_id` is required), so both
// entry points pass it: BookingDetailScreen (completed, not yet reviewed) and
// VenueDetailScreen (the branch's first completed, unreviewed booking).
// `serviceName`/`date` are display-only params, never sent.
export function WriteReviewScreen() {
  const colors = useColors();
  const styles = createStyles(colors);
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

  // Both entry points always pass storeId and bookingId — this guards
  // against a bare/untargeted deep link into the route.
  if (!storeId || !bookingId) {
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
        booking_id: bookingId,
        rating,
        comment: comment.trim() || undefined,
      });
      Alert.alert(t('reviews.submitSuccessTitle'), undefined, [
        { text: t('common.ok'), onPress: () => router.back() },
      ]);
    } catch (error) {
      const body = isApiError(error, 'duplicate')
        ? t('reviews.alreadyReviewed')
        : isApiError(error, 'forbidden')
          ? t('reviews.notEligible')
          : t('reviews.submitErrorBody');
      Alert.alert(t('reviews.submitError'), body);
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

const createStyles = (colors: Colors) =>
  StyleSheet.create({
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

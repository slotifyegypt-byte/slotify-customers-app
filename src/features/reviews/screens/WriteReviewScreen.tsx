import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { IconButton } from '@/components/IconButton';
import { Photo } from '@/components/Photo';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { ThemedText } from '@/components/ThemedText';
import { useStoreDetail } from '@/features/explore-search/hooks/useStoreDetail';
import { isApiError } from '@/lib/api/errors';
import { enter, radius, spacing, useColors } from '@/theme';

import { StarRating } from '../components/StarRating';
import { useCreateReview } from '../hooks/useReviewMutations';

// A review is always for one booking (`booking_id` is required), so both entry points pass it:
// BookingDetailScreen (completed, not yet reviewed) and VenueDetailScreen (the branch's first completed,
// unreviewed booking). `serviceName`/`date` are display-only params, never sent.
export function WriteReviewScreen() {
  const { t } = useTranslation();
  const colors = useColors();
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

  // Both entry points always pass storeId and bookingId: this guards against a bare/untargeted deep link into
  // the route.
  if (!storeId || !bookingId) {
    return (
      <Screen>
        <EmptyState
          icon="star-outline"
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

  const venueName = store.data?.name ?? '';
  const visit = [serviceName, date].filter(Boolean).join(' · ');

  return (
    <Screen edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <ThemedText variant="h2" style={styles.title} accessibilityRole="header">
            {t('reviews.writeReviewTitle')}
          </ThemedText>
          <IconButton
            icon="close"
            accessibilityLabel={t('reviews.close')}
            onPress={() => router.back()}
          />
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {venueName || visit ? (
            <Animated.View entering={enter(0)}>
              <Card>
                <View style={styles.venue}>
                  <Photo
                    uri={store.data?.logo}
                    name={venueName || '?'}
                    style={styles.photo}
                    initialSize={20}
                  />
                  <View style={styles.venueText}>
                    <ThemedText variant="h3" numberOfLines={2}>
                      {venueName}
                    </ThemedText>
                    {visit ? (
                      <ThemedText variant="caption" color="textSecondary" numberOfLines={2}>
                        {visit}
                      </ThemedText>
                    ) : null}
                  </View>
                </View>
              </Card>
            </Animated.View>
          ) : null}

          <Animated.View entering={enter(1)} style={styles.stars}>
            <StarRating rating={rating} onChange={setRating} size={40} />
            <ThemedText
              variant="bodyMedium"
              color={rating ? 'textPrimary' : 'textTertiary'}
              style={styles.ratingWord}
              accessibilityLiveRegion="polite"
            >
              {rating ? t(`reviews.rate${rating}`) : t('reviews.rateTap')}
            </ThemedText>
          </Animated.View>

          <Animated.View entering={enter(2)}>
            <TextField
              label={t('reviews.yourReview')}
              value={comment}
              onChangeText={setComment}
              placeholder={t('reviews.reviewPlaceholder')}
              multiline
              numberOfLines={5}
              style={styles.input}
            />
          </Animated.View>
        </ScrollView>

        <View
          style={[
            styles.footer,
            { backgroundColor: colors.surface, borderTopColor: colors.border },
          ]}
        >
          {rating === 0 ? (
            <ThemedText variant="caption" color="textSecondary" style={styles.hint}>
              {t('reviews.ratingRequired')}
            </ThemedText>
          ) : null}
          <Button
            label={t('reviews.submit')}
            onPress={handleSubmit}
            loading={createReview.isPending}
            disabled={rating === 0}
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: { flex: 1 },
  content: { paddingHorizontal: spacing.gutter, paddingBottom: spacing.lg, gap: spacing.lg },
  venue: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm + 2 },
  photo: { width: 52, height: 52, borderRadius: radius.md },
  venueText: { flex: 1, minWidth: 0, gap: 2 },
  stars: { alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.sm },
  ratingWord: { textAlign: 'center' },
  input: { minHeight: 132, paddingTop: spacing.sm + 2, textAlignVertical: 'top' },
  footer: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    gap: spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth * 2,
  },
  hint: { textAlign: 'center' },
});

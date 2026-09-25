import { useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { SegmentedControl } from '@/components/SegmentedControl';
import { ThemedText } from '@/components/ThemedText';
import { StarRating } from '@/features/reviews/components/StarRating';
import { radius, spacing, useColors, type Colors } from '@/theme';

import type { VenueReview, VenueReviewStats } from '../api/schemas';

interface ReviewsTabProps {
  stats: VenueReviewStats | undefined;
  reviews: VenueReview[];
  isLoading: boolean;
  isError: boolean;
  canReview: boolean;
  onWriteReview: () => void;
}

type SortKey = 'recent' | 'highest';

const STAR_VALUES = [5, 4, 3, 2, 1] as const;

export function ReviewsTab({
  stats,
  reviews,
  isLoading,
  isError,
  canReview,
  onWriteReview,
}: ReviewsTabProps) {
  const colors = useColors();
  const styles = createStyles(colors);
  const [sort, setSort] = useState<SortKey>('recent');
  const [showGateHint, setShowGateHint] = useState(false);

  const sortedReviews = useMemo(() => {
    const copy = [...reviews];
    return sort === 'highest'
      ? copy.sort((a, b) => b.rating - a.rating)
      : copy.sort((a, b) => b.created_at.localeCompare(a.created_at));
  }, [reviews, sort]);

  // VERIFIED against a live GET /reviews/store/{store_id}/stats response
  // (2026-09-20): the stats endpoint now returns `rating_distribution`, the
  // true full 1★–5★ breakdown across every review for the store — not just
  // whatever page of reviews this screen happens to have loaded. This
  // replaces the previous client-side tally derived from `reviews`.
  const distribution = useMemo(() => {
    const counts = stats?.rating_distribution ?? { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
    const max = Math.max(1, ...Object.values(counts));
    return { counts, max };
  }, [stats]);

  const handleWriteReview = () => {
    if (!canReview) {
      setShowGateHint(true);
      return;
    }
    setShowGateHint(false);
    onWriteReview();
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.brand} />
      </View>
    );
  }

  if (isError) {
    return <EmptyState title="Couldn't load reviews" /* TODO i18n */ />;
  }

  return (
    <View style={styles.container}>
      {stats ? (
        <View style={styles.statsRow}>
          <View style={styles.statsLeft}>
            <ThemedText variant="display" style={styles.average}>
              {stats.average_rating.toFixed(1)}
            </ThemedText>
            <StarRating rating={stats.average_rating} size={16} />
            <ThemedText variant="caption" color="textSecondary" style={styles.totalCount}>
              {stats.total_reviews} {stats.total_reviews === 1 ? 'review' : 'reviews'}{' '}
              {/* TODO i18n */}
            </ThemedText>
          </View>
          <View style={styles.distribution}>
            {STAR_VALUES.map((value) => (
              <View key={value} style={styles.distributionRow}>
                <ThemedText
                  variant="caption"
                  color="textSecondary"
                  style={styles.distributionLabel}
                >
                  {value}
                </ThemedText>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      { width: `${(distribution.counts[`${value}`] / distribution.max) * 100}%` },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      <View style={styles.sortRow}>
        <SegmentedControl
          tone="brand"
          options={[
            { key: 'recent', label: 'Most recent' /* TODO i18n */ },
            { key: 'highest', label: 'Highest rated' /* TODO i18n */ },
          ]}
          value={sort}
          onChange={setSort}
        />
      </View>

      <Button
        label={/* TODO i18n */ 'Write a review'}
        variant="ghost"
        onPress={handleWriteReview}
        style={styles.writeReviewButton}
      />
      {showGateHint ? (
        <ThemedText variant="caption" color="textSecondary" style={styles.gateHint}>
          You can leave a review after your visit {/* TODO i18n */}
        </ThemedText>
      ) : null}

      {sortedReviews.length === 0 ? (
        <EmptyState
          title="No reviews yet"
          body="Be the first to book and leave one." /* TODO i18n */
        />
      ) : (
        sortedReviews.map((review) => (
          <View key={review.id} style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <ThemedText variant="bodyMedium">{review.customer_name ?? 'Customer'}</ThemedText>
              {review.review_date_str ? (
                <ThemedText variant="caption" color="textSecondary">
                  {review.review_date_str}
                </ThemedText>
              ) : null}
            </View>
            <StarRating rating={review.rating} size={14} />
            {review.comment ? (
              <ThemedText variant="body" style={styles.comment}>
                {review.comment}
              </ThemedText>
            ) : null}
            {review.owner_reply ? (
              <View style={styles.ownerReply}>
                <ThemedText variant="caption" color="textSecondary">
                  Owner response {/* TODO i18n */}
                </ThemedText>
                <ThemedText variant="body">{review.owner_reply}</ThemedText>
              </View>
            ) : null}
          </View>
        ))
      )}
    </View>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
  container: { paddingHorizontal: spacing.md, paddingTop: spacing.md },
  centered: { paddingVertical: spacing.xl, alignItems: 'center' },
  statsRow: { flexDirection: 'row', marginBottom: spacing.lg },
  statsLeft: { flex: 1, justifyContent: 'center' },
  average: { marginBottom: spacing.xxs },
  totalCount: { marginTop: spacing.xxs },
  distribution: { flex: 1, justifyContent: 'center' },
  distributionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  distributionLabel: { width: 12 },
  barTrack: {
    flex: 1,
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.backgroundMuted,
    marginLeft: spacing.xxs,
    overflow: 'hidden',
  },
  barFill: { height: '100%', backgroundColor: colors.accentDecorative, borderRadius: radius.pill },
  sortRow: { marginBottom: spacing.md },
  writeReviewButton: { marginBottom: spacing.xxs },
  gateHint: { textAlign: 'center', marginBottom: spacing.md },
  reviewCard: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xxs,
  },
  comment: { marginTop: spacing.xxs },
  ownerReply: {
    marginTop: spacing.xs,
    paddingLeft: spacing.sm,
    borderLeftWidth: 2,
    borderLeftColor: colors.border,
  },
});

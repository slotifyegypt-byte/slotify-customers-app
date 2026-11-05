import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { SegmentedControl } from '@/components/SegmentedControl';
import { Skeleton } from '@/components/Skeleton';
import { ThemedText } from '@/components/ThemedText';
import { formatDate } from '@/lib/time/branchTime';
import { enter, radius, spacing, useColors } from '@/theme';

import type { VenueReview, VenueReviewStats } from '../api/schemas';

import { RatingStars } from './RatingStars';

interface ReviewsTabProps {
  stats: VenueReviewStats | undefined;
  /** The branch's IANA timezone: review dates show in branch time. */
  timezone: string;
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
  timezone,
  reviews,
  isLoading,
  isError,
  canReview,
  onWriteReview,
}: ReviewsTabProps) {
  const colors = useColors();
  const [sort, setSort] = useState<SortKey>('recent');
  const [showGateHint, setShowGateHint] = useState(false);

  const sortedReviews = useMemo(() => {
    const copy = [...reviews];
    return sort === 'highest'
      ? copy.sort((a, b) => b.rating - a.rating)
      : copy.sort((a, b) => b.created_at.localeCompare(a.created_at));
  }, [reviews, sort]);

  // `rating_distribution` is the full 1-5 star breakdown across every review
  // for the branch, not just the page of reviews loaded here.
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
      <View style={styles.container}>
        <Skeleton height={132} radius={radius.lg} />
        <Skeleton height={44} radius={radius.pill} />
        <Skeleton height={112} radius={radius.lg} />
        <Skeleton height={112} radius={radius.lg} />
      </View>
    );
  }

  if (isError) {
    return (
      <EmptyState
        icon="cloud-offline-outline"
        title="Couldn't load reviews" /* TODO i18n */
        body="Check your connection and open this tab again." /* TODO i18n */
      />
    );
  }

  return (
    <View style={styles.container}>
      {stats ? (
        <Animated.View entering={enter(0)}>
          <Card>
            <View style={styles.statsRow}>
              <View style={styles.statsLeft}>
                <ThemedText variant="display">{stats.average_rating.toFixed(1)}</ThemedText>
                <RatingStars rating={stats.average_rating} size={16} />
                <ThemedText variant="caption" color="textSecondary" style={styles.totalCount}>
                  {stats.total_reviews} {stats.total_reviews === 1 ? 'review' : 'reviews'}{' '}
                  {/* TODO i18n */}
                </ThemedText>
              </View>
              <View style={styles.distribution}>
                {STAR_VALUES.map((value) => (
                  <View key={value} style={styles.distributionRow}>
                    <ThemedText variant="captionSmall" color="textSecondary" style={styles.starNo}>
                      {value}
                    </ThemedText>
                    <View style={[styles.barTrack, { backgroundColor: colors.backgroundMuted }]}>
                      <View
                        style={[
                          styles.barFill,
                          {
                            backgroundColor: colors.ratingStar,
                            width: `${(distribution.counts[`${value}`] / distribution.max) * 100}%`,
                          },
                        ]}
                      />
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </Card>
        </Animated.View>
      ) : null}

      <Animated.View entering={enter(1)} style={styles.actions}>
        <Button
          label={/* TODO i18n */ 'Write a review'}
          variant="secondary"
          icon="create-outline"
          onPress={handleWriteReview}
        />
        {showGateHint ? (
          <ThemedText variant="caption" color="textSecondary" style={styles.gateHint}>
            You can leave a review after your visit {/* TODO i18n */}
          </ThemedText>
        ) : null}
      </Animated.View>

      {sortedReviews.length === 0 ? (
        <EmptyState
          icon="chatbubble-ellipses-outline"
          title="No reviews yet"
          body="Be the first to book and leave one." /* TODO i18n */
        />
      ) : (
        <>
          <Animated.View entering={enter(2)}>
            <SegmentedControl
              options={[
                { key: 'recent', label: 'Most recent' /* TODO i18n */ },
                { key: 'highest', label: 'Highest rated' /* TODO i18n */ },
              ]}
              value={sort}
              onChange={setSort}
            />
          </Animated.View>
          <View style={styles.list}>
            {sortedReviews.map((review, index) => (
              <Animated.View key={review.id} entering={enter(3 + index)}>
                <Card>
                  <View style={styles.reviewHeader}>
                    <Avatar
                      label={(review.customer_name ?? 'Customer').charAt(0).toUpperCase()}
                      size={40}
                    />
                    <View style={styles.reviewWho}>
                      <ThemedText variant="bodyMedium" numberOfLines={1}>
                        {review.customer_name ?? 'Customer' /* TODO i18n */}
                      </ThemedText>
                      <ThemedText variant="caption" color="textTertiary">
                        {formatDate(review.created_at, timezone)}
                      </ThemedText>
                    </View>
                    <RatingStars rating={review.rating} size={14} />
                  </View>
                  {review.comment ? (
                    <ThemedText variant="body" style={styles.comment}>
                      {review.comment}
                    </ThemedText>
                  ) : null}
                  {review.owner_reply ? (
                    <View style={[styles.ownerReply, { backgroundColor: colors.backgroundMuted }]}>
                      <ThemedText variant="captionStrong" color="textSecondary">
                        Owner response {/* TODO i18n */}
                      </ThemedText>
                      <ThemedText variant="body">{review.owner_reply}</ThemedText>
                    </View>
                  ) : null}
                </Card>
              </Animated.View>
            ))}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: spacing.gutter, paddingTop: spacing.lg, gap: spacing.md },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  statsLeft: { flex: 1, gap: 4 },
  totalCount: { marginTop: 2 },
  distribution: { flex: 1.2, gap: 6 },
  distributionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  starNo: { width: 10, textAlign: 'center' },
  barTrack: { flex: 1, height: 6, borderRadius: radius.pill, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: radius.pill },
  actions: { gap: spacing.xs },
  gateHint: { textAlign: 'center' },
  list: { gap: spacing.sm },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  reviewWho: { flex: 1, minWidth: 0 },
  comment: { marginTop: spacing.sm },
  ownerReply: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    gap: 2,
  },
});

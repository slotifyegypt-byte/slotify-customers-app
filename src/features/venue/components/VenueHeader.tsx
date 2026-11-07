import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Share,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconButton } from '@/components/IconButton';
import { Photo } from '@/components/Photo';
import { Pill } from '@/components/Pill';
import { ThemedText } from '@/components/ThemedText';
import { radius, spacing, useColors } from '@/theme';

import type { GalleryItem } from '../api/schemas';

const PHOTO_HEIGHT = 288;
// The content sheet rises over the bottom of the photo, so the name reads as part of the picture.
const SHEET_OVERLAP = 28;

interface VenueHeaderProps {
  name: string;
  categoryLabel: string | null;
  rating: number;
  reviewCount: number | null;
  distanceKm: number | null;
  status: 'open' | 'closed' | string;
  photos: GalleryItem[];
  coverImage: string | null;
  shareLink: string | null;
  isFavourite: boolean;
  isFavouriteLoading: boolean;
  onToggleFavourite: () => void;
  onBack: () => void;
  onOpenDirections: () => void;
}

/**
 * The top of a venue page: a full-bleed photo (or `Photo`'s placeholder) with floating back / share / favourite
 * buttons, and a rounded sheet rising over it that carries the name, category, rating, distance and whether the
 * place is open right now.
 */
export function VenueHeader({
  name,
  categoryLabel,
  rating,
  reviewCount,
  distanceKm,
  status,
  photos,
  coverImage,
  shareLink,
  isFavourite,
  isFavouriteLoading,
  onToggleFavourite,
  onBack,
  onOpenDirections,
}: VenueHeaderProps) {
  const colors = useColors();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);

  const isOpen = status === 'open';

  // Falls back to the store's single logo image when the gallery endpoint has nothing yet (it returns `[]` for
  // most seed stores today). The carousel chrome (dots/counter) only appears once there is more than one photo.
  const images =
    photos.length > 0 ? photos.map((photo) => photo.imageUrl) : coverImage ? [coverImage] : [];
  const hasMultiplePhotos = images.length > 1;

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setActiveIndex(Math.round(event.nativeEvent.contentOffset.x / width));
  };

  const handleShare = () => {
    Share.share({ message: shareLink ?? name, url: shareLink ?? undefined }).catch(() => {});
  };

  return (
    <View>
      <View style={{ height: PHOTO_HEIGHT }}>
        {images.length > 0 ? (
          <FlatList
            data={images}
            keyExtractor={(uri, index) => `${uri}-${index}`}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleScrollEnd}
            renderItem={({ item }) => (
              <Photo
                uri={item}
                name={name}
                initialSize={96}
                style={{ width, height: PHOTO_HEIGHT }}
              />
            )}
          />
        ) : (
          <Photo name={name} initialSize={96} style={{ width, height: PHOTO_HEIGHT }} />
        )}

        <View style={[styles.topRow, { top: insets.top + spacing.xs }]} pointerEvents="box-none">
          <IconButton
            variant="overlay"
            icon="arrow-back"
            size={44}
            onPress={onBack}
            accessibilityLabel={t('venue.goBack')}
          />
          <View style={styles.topRowRight}>
            <IconButton
              variant="overlay"
              icon="share-outline"
              size={44}
              onPress={handleShare}
              accessibilityLabel={t('venue.share')}
            />
            {isFavouriteLoading ? (
              <View style={[styles.favouriteBusy, { backgroundColor: colors.surfaceTranslucent }]}>
                <ActivityIndicator size="small" color={colors.brand} />
              </View>
            ) : (
              <IconButton
                variant="overlay"
                icon={isFavourite ? 'heart' : 'heart-outline'}
                size={44}
                color={isFavourite ? colors.danger : undefined}
                onPress={onToggleFavourite}
                accessibilityLabel={
                  isFavourite ? t('venue.removeFavourite') : t('venue.addFavourite')
                }
              />
            )}
          </View>
        </View>

        {hasMultiplePhotos ? (
          <>
            <View
              style={[styles.counterBadge, { backgroundColor: colors.overlay }]}
              pointerEvents="none"
            >
              <ThemedText variant="label" color="textInverse">
                {activeIndex + 1}/{images.length}
              </ThemedText>
            </View>
            <View style={styles.dotsRow} pointerEvents="none">
              {images.map((uri, index) => (
                <View
                  key={`${uri}-${index}`}
                  style={[
                    styles.dot,
                    index === activeIndex ? styles.dotActive : styles.dotIdle,
                    { backgroundColor: index === activeIndex ? colors.onHero : colors.onHeroMuted },
                  ]}
                />
              ))}
            </View>
          </>
        ) : null}
      </View>

      <View style={[styles.sheet, { backgroundColor: colors.background }]}>
        <ThemedText variant="h1">{name}</ThemedText>

        <View style={styles.categoryRow}>
          {categoryLabel ? (
            <ThemedText
              variant="bodyMedium"
              color="brandAccent"
              numberOfLines={1}
              style={styles.category}
            >
              {categoryLabel}
            </ThemedText>
          ) : (
            <View style={styles.category} />
          )}
          <IconButton
            variant="tint"
            icon="navigate-outline"
            size={44}
            onPress={onOpenDirections}
            accessibilityLabel={t('venue.openDirections')}
          />
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="star" size={15} color={colors.ratingStar} />
            <ThemedText variant="bodyMedium">{rating.toFixed(1)}</ThemedText>
            {reviewCount != null ? (
              <ThemedText variant="body" color="textSecondary">
                ({reviewCount})
              </ThemedText>
            ) : null}
          </View>
          {distanceKm != null ? (
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={15} color={colors.textTertiary} />
              <ThemedText variant="body" color="textSecondary">
                {t('venue.km', { value: distanceKm.toFixed(1) })}
              </ThemedText>
            </View>
          ) : null}
          {isOpen ? (
            <Pill label={t('venue.openNow')} tone="mint" dot />
          ) : (
            <Pill label={t('venue.closed')} tone="neutral" />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topRow: {
    position: 'absolute',
    start: spacing.md,
    end: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topRowRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  favouriteBusy: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterBadge: {
    position: 'absolute',
    end: spacing.md,
    bottom: SHEET_OVERLAP + spacing.sm,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  dotsRow: {
    position: 'absolute',
    bottom: SHEET_OVERLAP + spacing.sm + 4,
    start: 0,
    end: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: { height: 6, borderRadius: 3 },
  dotIdle: { width: 6 },
  dotActive: { width: 18 },
  sheet: {
    marginTop: -SHEET_OVERLAP,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.lg,
    gap: spacing.xxs,
  },
  categoryRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  category: { flex: 1, minWidth: 0 },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    columnGap: spacing.md,
    rowGap: spacing.xs,
  },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
});

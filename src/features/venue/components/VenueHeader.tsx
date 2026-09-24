import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { type ReactNode, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  Share,
  StyleSheet,
  type StyleProp,
  View,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { colors, radius, shadows, spacing } from '@/theme';

import type { GalleryItem } from '../api/schemas';

const PHOTO_WIDTH = Dimensions.get('window').width;
const PHOTO_HEIGHT = 260;

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
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(0);

  const isOpen = status === 'open';

  // Falls back to the store's single logo image when the gallery endpoint
  // has nothing yet (it returns `[]` for most seed stores today) — the
  // carousel chrome (dots/counter) only appears once there's more than one
  // photo to page through.
  const images = photos.length > 0 ? photos.map((photo) => photo.imageUrl) : coverImage ? [coverImage] : [];
  const hasMultiplePhotos = images.length > 1;

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / PHOTO_WIDTH);
    setActiveIndex(index);
  };

  const handleShare = () => {
    Share.share({ message: shareLink ?? name, url: shareLink ?? undefined }).catch(() => {});
  };

  return (
    <View>
      <View style={styles.coverWrap}>
        {images.length > 0 ? (
          <FlatList
            data={images}
            keyExtractor={(uri, index) => `${uri}-${index}`}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleScrollEnd}
            renderItem={({ item }) => (
              <Image source={{ uri: item }} style={styles.cover} contentFit="cover" />
            )}
          />
        ) : (
          <View style={[styles.cover, styles.coverFallback]} />
        )}

        <View style={[styles.topRow, { top: insets.top + spacing.xs }]} pointerEvents="box-none">
          <View style={styles.topRowLeft}>
            <CircleButton onPress={onBack} accessibilityLabel="Go back" /* TODO i18n */>
              <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
            </CircleButton>
            {hasMultiplePhotos ? (
              <View style={styles.counterBadge}>
                <ThemedText variant="caption" color="textInverse">
                  {activeIndex + 1}/{images.length}
                </ThemedText>
              </View>
            ) : null}
          </View>
          <View style={styles.topRowRight}>
            <CircleButton onPress={handleShare} accessibilityLabel="Share this venue" /* TODO i18n */>
              <Ionicons name="share-outline" size={18} color={colors.textPrimary} />
            </CircleButton>
            <CircleButton
              onPress={onToggleFavourite}
              disabled={isFavouriteLoading}
              accessibilityLabel={isFavourite ? 'Remove from favourites' : 'Add to favourites'} // TODO i18n
              style={styles.favouriteButton}
            >
              {isFavouriteLoading ? (
                <ActivityIndicator size="small" color={colors.brand} />
              ) : (
                <Ionicons
                  name={isFavourite ? 'heart' : 'heart-outline'}
                  size={20}
                  color={isFavourite ? colors.danger : colors.textPrimary}
                />
              )}
            </CircleButton>
          </View>
        </View>

        {hasMultiplePhotos ? (
          <View style={styles.dotsRow} pointerEvents="none">
            {images.map((uri, index) => (
              <View
                key={`${uri}-${index}`}
                style={[styles.dot, index === activeIndex && styles.dotActive]}
              />
            ))}
          </View>
        ) : null}
      </View>

      <View style={styles.content}>
        <ThemedText variant="h2">{name}</ThemedText>
        {categoryLabel ? (
          <ThemedText variant="bodyMedium" color="brandAccent" style={styles.category}>
            {categoryLabel}
          </ThemedText>
        ) : null}

        <View style={styles.metaRow}>
          <View style={styles.metaLeft}>
            <Ionicons name="star" size={14} color={colors.accentDecorative} />
            <ThemedText variant="bodyMedium" style={styles.metaText}>
              {rating.toFixed(1)}
            </ThemedText>
            {reviewCount != null ? (
              <ThemedText variant="body" color="textSecondary" style={styles.metaText}>
                ({reviewCount})
              </ThemedText>
            ) : null}
            {distanceKm != null ? (
              <ThemedText variant="body" color="textSecondary" style={styles.metaText}>
                · {distanceKm.toFixed(1)} km
              </ThemedText>
            ) : null}
            <ThemedText variant="body" color="textSecondary" style={styles.metaText}>
              · {isOpen ? 'Open now' : 'Closed' /* TODO i18n */}
            </ThemedText>
          </View>
          <Pressable
            onPress={onOpenDirections}
            style={styles.mapButton}
            accessibilityRole="button"
            accessibilityLabel="Open directions" // TODO i18n
            hitSlop={8}
          >
            <Ionicons name="map-outline" size={18} color={colors.brand} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function CircleButton({
  children,
  onPress,
  disabled,
  accessibilityLabel,
  style,
}: {
  children: ReactNode;
  onPress: () => void;
  disabled?: boolean;
  accessibilityLabel: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      disabled={disabled}
      style={[styles.circleButton, style]}
      hitSlop={8}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  coverWrap: { position: 'relative' },
  cover: { width: PHOTO_WIDTH, height: PHOTO_HEIGHT },
  coverFallback: { backgroundColor: colors.backgroundMuted },
  topRow: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topRowLeft: { flexDirection: 'row', alignItems: 'center' },
  topRowRight: { flexDirection: 'row', alignItems: 'center' },
  circleButton: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  favouriteButton: { marginLeft: spacing.xs },
  counterBadge: {
    marginLeft: spacing.xs,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xxs / 2,
    borderRadius: radius.pill,
    backgroundColor: colors.overlay,
  },
  dotsRow: {
    position: 'absolute',
    bottom: spacing.sm,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: radius.pill,
    marginHorizontal: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  dotActive: { backgroundColor: colors.background, width: 8, height: 8 },
  content: { paddingHorizontal: spacing.md, paddingTop: spacing.sm },
  category: { marginTop: spacing.xxs / 2 },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  metaLeft: { flexDirection: 'row', alignItems: 'center', flexShrink: 1, flexWrap: 'wrap' },
  metaText: { marginLeft: spacing.xxs },
  mapButton: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.backgroundMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Photo } from '@/components/Photo';
import { SectionHeader } from '@/components/SectionHeader';
import { radius, spacing } from '@/theme';

import type { GalleryItem } from '../api/schemas';

interface GallerySectionProps {
  photos: GalleryItem[];
  /** Names the venue, for the placeholder shown while a photo loads. */
  name?: string;
}

/** A row of photos that bleeds to the screen edge so the next one peeks in. */
export function GallerySection({ photos, name = 'Photo' }: GallerySectionProps) {
  const { t } = useTranslation();
  if (photos.length === 0) return null;

  return (
    <View>
      <SectionHeader title={t('venue.photos')} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.bleed}
        contentContainerStyle={styles.row}
      >
        {photos.map((photo) => (
          <Photo
            key={photo.id}
            uri={photo.imageUrl}
            name={name}
            initialSize={28}
            style={styles.photo}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  bleed: { marginHorizontal: -spacing.gutter },
  row: { paddingHorizontal: spacing.gutter, gap: spacing.xs },
  photo: { width: 168, height: 120, borderRadius: radius.md },
});

import { Image } from 'expo-image';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { radius, spacing } from '@/theme';

import type { GalleryItem } from '../api/schemas';

interface GallerySectionProps {
  photos: GalleryItem[];
}

export function GallerySection({ photos }: GallerySectionProps) {
  if (photos.length === 0) return null;

  return (
    <View style={styles.container}>
      <ThemedText variant="h3" style={styles.title}>
        Photos {/* TODO i18n */}
      </ThemedText>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {photos.map((photo) => (
          <Image key={photo.id} source={{ uri: photo.imageUrl }} style={styles.photo} contentFit="cover" />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: spacing.lg, paddingHorizontal: spacing.md },
  title: { marginBottom: spacing.sm },
  photo: {
    width: 140,
    height: 100,
    borderRadius: radius.md,
    marginRight: spacing.xs,
  },
});

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { useColors, type Colors } from '@/theme';

import { iconForCategory, imageForCategory } from '../utils/categoryIcon';

interface MapPinProps {
  categoryName: string;
  color: string;
  size?: number;
  isOpen?: boolean;
}

// Same circular category badge as the Home screen's CategoryChip (see
// categoryIcon.ts) — a plain "sticker" marker centered on its coordinate,
// rather than a teardrop shape.
export function MapPin({ categoryName, color, size = 34, isOpen }: MapPinProps) {
  const colors = useColors();
  const styles = createStyles(colors);
  const image = imageForCategory(categoryName);

  return (
    <View style={{ width: size, height: size }}>
      <View
        style={[
          styles.circle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: image ? colors.surface : color,
            borderColor: image ? color : colors.surface,
          },
        ]}
      >
        {image ? (
          <Image
            source={image.source}
            style={[styles.image, { transform: [{ scale: image.scale }] }]}
            contentFit="cover"
          />
        ) : (
          <Ionicons name={iconForCategory(categoryName)} size={size * 0.52} color={colors.surface} />
        )}
      </View>
      {isOpen ? <View style={styles.dot} /> : null}
    </View>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    circle: {
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      borderWidth: 2.5,
      shadowColor: '#000000',
      shadowOpacity: 0.2,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
      elevation: 4,
    },
    image: { width: '100%', height: '100%' },
    dot: {
      position: 'absolute',
      top: -2,
      right: -2,
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.success,
      borderWidth: 2,
      borderColor: colors.surface,
    },
  });

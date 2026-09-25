import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import { useColors, type Colors } from '@/theme';

import { ThemedText } from './ThemedText';

interface AvatarProps {
  uri?: string | null;
  /** Fallback initial shown when there's no photo yet. */
  label: string;
  size?: number;
  /** Shows the small purple camera badge in the bottom-right corner. */
  editable?: boolean;
  onPressEdit?: () => void;
}

/**
 * Circular profile photo + optional camera-badge affordance, shared by the
 * Profile header (small) and Edit Profile (large) so both reuse the exact
 * same visual pattern instead of two separate implementations.
 */
export function Avatar({ uri, label, size = 64, editable, onPressEdit }: AvatarProps) {
  const colors = useColors();
  const styles = createStyles(colors);
  const badgeSize = Math.max(22, Math.round(size * 0.34));

  return (
    <View style={{ width: size, height: size }}>
      {uri ? (
        <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} />
      ) : (
        <View
          style={[
            styles.fallback,
            { width: size, height: size, borderRadius: size / 2 },
          ]}
        >
          <ThemedText variant={size >= 80 ? 'h1' : 'h3'} color="textOnBrand">
            {label}
          </ThemedText>
        </View>
      )}
      {editable ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Change profile photo" // TODO i18n
          hitSlop={8}
          onPress={onPressEdit}
          style={[
            styles.badge,
            {
              width: badgeSize,
              height: badgeSize,
              borderRadius: badgeSize / 2,
              bottom: -badgeSize * 0.08,
              right: -badgeSize * 0.08,
            },
          ]}
        >
          <Ionicons name="camera" size={Math.round(badgeSize * 0.55)} color={colors.textOnBrand} />
        </Pressable>
      ) : null}
    </View>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    fallback: { backgroundColor: colors.brand, alignItems: 'center', justifyContent: 'center' },
    badge: {
      position: 'absolute',
      backgroundColor: colors.brandAccent,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: colors.surface,
    },
  });

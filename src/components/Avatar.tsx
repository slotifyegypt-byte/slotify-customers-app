import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { hueFor, useColors, type Colors } from '@/theme';

import { ThemedText } from './ThemedText';

interface AvatarProps {
  uri?: string | null;
  /** Fallback initial shown when there's no photo yet. */
  label: string;
  size?: number;
  /** Shows the small camera badge in the bottom-right corner. */
  editable?: boolean;
  onPressEdit?: () => void;
}

/**
 * A round profile photo, or the person's initial on a soft wash of their own hue, plus the optional camera
 * badge. Shared by the Profile header (small) and Edit Profile (large).
 */
export function Avatar({ uri, label, size = 64, editable, onPressEdit }: AvatarProps) {
  const { t } = useTranslation();
  const colors = useColors();
  const styles = createStyles(colors);
  const badgeSize = Math.max(24, Math.round(size * 0.34));
  const hue = hueFor(label);

  return (
    <View style={{ width: size, height: size }}>
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
          contentFit="cover"
          transition={200}
          recyclingKey={uri}
          accessibilityIgnoresInvertColors
        />
      ) : (
        <View
          style={[
            styles.fallback,
            { width: size, height: size, borderRadius: size / 2, backgroundColor: `${hue}22` },
          ]}
        >
          <ThemedText variant={size >= 80 ? 'h1' : 'h3'} style={{ color: hue }}>
            {label}
          </ThemedText>
        </View>
      )}
      {editable ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('editProfile.changePhoto')}
          hitSlop={8}
          onPress={onPressEdit}
          style={[
            styles.badge,
            {
              width: badgeSize,
              height: badgeSize,
              borderRadius: badgeSize / 2,
              bottom: -badgeSize * 0.08,
              end: -badgeSize * 0.08,
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
    fallback: { alignItems: 'center', justifyContent: 'center' },
    badge: {
      position: 'absolute',
      backgroundColor: colors.brand,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: colors.surface,
    },
  });

import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import { ThemedText } from '@/components/ThemedText';
import { ANDROID_MAP_STYLE_DARK, ANDROID_MAP_STYLE_LIGHT, MAP_PROVIDER } from '@/lib/maps';
import { radius, shadows, spacing, useColors, useTheme, type Colors } from '@/theme';

import { pinColorForCategory } from '../utils/categoryIcon';

import { MapPin } from './MapPin';

export interface MapPreviewPin {
  id: string;
  categoryName: string;
  latitude: number;
  longitude: number;
  isOpen?: boolean;
}

interface NearbyMapPreviewProps {
  pins: MapPreviewPin[];
  region: { latitude: number; longitude: number } | null;
  onPress: () => void;
}

export function NearbyMapPreview({ pins, region, onPress }: NearbyMapPreviewProps) {
  const { t } = useTranslation();
  const colors = useColors();
  const { scheme } = useTheme();
  const styles = createStyles(colors);

  return (
    <Pressable onPress={onPress} style={styles.card}>
      {region ? (
        <MapView
          // `initialRegion` only applies on first mount — remount when the
          // resolved location moves meaningfully (e.g. the Cairo fallback
          // is replaced by a real GPS fix) so the preview recenters instead
          // of staying stuck on whatever region it first rendered with.
          key={`${region.latitude.toFixed(2)},${region.longitude.toFixed(2)}`}
          provider={MAP_PROVIDER}
          userInterfaceStyle={scheme}
          customMapStyle={scheme === 'dark' ? ANDROID_MAP_STYLE_DARK : ANDROID_MAP_STYLE_LIGHT}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
          scrollEnabled={false}
          zoomEnabled={false}
          rotateEnabled={false}
          pitchEnabled={false}
          initialRegion={{
            latitude: region.latitude,
            longitude: region.longitude,
            latitudeDelta: 0.03,
            longitudeDelta: 0.03,
          }}
        >
          {pins.map((pin) => (
            <Marker key={pin.id} coordinate={{ latitude: pin.latitude, longitude: pin.longitude }} anchor={{ x: 0.5, y: 0.5 }}>
              <MapPin categoryName={pin.categoryName} color={pinColorForCategory(pin.categoryName, colors)} isOpen={pin.isOpen} size={26} />
            </Marker>
          ))}
        </MapView>
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.fallback]}>
          <Ionicons name="map-outline" size={28} color={colors.textSecondary} />
        </View>
      )}

      <View style={styles.labelPill}>
        <Ionicons name="navigate" size={12} color={colors.brandAccent} />
        <ThemedText variant="captionStrong">{t('home.nearbyMapLabel')}</ThemedText>
      </View>
      <View style={styles.expandButton}>
        <Ionicons name="expand-outline" size={16} color={colors.textPrimary} />
      </View>
    </Pressable>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    card: {
      height: 140,
      borderRadius: radius.lg,
      overflow: 'hidden',
      position: 'relative',
      ...shadows.md,
    },
    fallback: { backgroundColor: colors.backgroundMuted, alignItems: 'center', justifyContent: 'center' },
    labelPill: {
      position: 'absolute',
      left: spacing.xs + 2,
      top: spacing.xs + 2,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      // Translucent `surface`-toned background (not hardcoded white) — a
      // solid-white pill would make dark-mode's near-white default text
      // illegible on it. `opacity` isn't used here since it would also fade
      // the icon/text inside, not just the backdrop.
      backgroundColor: colors.surfaceTranslucent,
      paddingHorizontal: spacing.sm - 2,
      paddingVertical: spacing.xxs + 2,
      borderRadius: radius.pill,
    },
    expandButton: {
      position: 'absolute',
      right: spacing.xs + 2,
      bottom: spacing.xs + 2,
      width: 34,
      height: 34,
      borderRadius: radius.pill,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      ...shadows.sm,
    },
  });

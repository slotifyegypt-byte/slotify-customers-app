import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import { ThemedText } from '@/components/ThemedText';
import { ANDROID_MAP_STYLE, MAP_PROVIDER } from '@/lib/maps';
import { colors, radius, shadows, spacing } from '@/theme';

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

  return (
    <Pressable onPress={onPress} style={styles.card}>
      {region ? (
        <MapView
          provider={MAP_PROVIDER}
          customMapStyle={ANDROID_MAP_STYLE}
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
              <MapPin categoryName={pin.categoryName} color={pinColorForCategory(pin.categoryName)} isOpen={pin.isOpen} size={26} />
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

const styles = StyleSheet.create({
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
    backgroundColor: 'rgba(255,255,255,0.94)',
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

import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { spacing, useColors } from '@/theme';

import { Card } from './Card';
import { Photo } from './Photo';
import { Pill } from './Pill';
import { ThemedText } from './ThemedText';

interface StoreCardProps {
  name: string;
  logo?: string | null;
  address?: string | null;
  rating: number;
  distanceKm?: number | null;
  isOpen?: boolean;
  onPress?: () => void;
  width?: number;
}

/** A venue in a horizontal list: its photo, whether it is open, name, address, rating and distance. */
export function StoreCard({
  name,
  logo,
  address,
  rating,
  distanceKm,
  isOpen,
  onPress,
  width = 232,
}: StoreCardProps) {
  const colors = useColors();
  const { t } = useTranslation();
  return (
    <Card
      onPress={onPress}
      padding="none"
      style={{ width, marginEnd: spacing.sm }}
      accessibilityLabel={name}
    >
      <Photo uri={logo} name={name} style={styles.photo} initialSize={44}>
        {isOpen !== undefined ? (
          <View style={styles.badge}>
            <Pill
              label={isOpen ? t('venue.openNow') : t('venue.closed')}
              tone={isOpen ? 'mint' : 'neutral'}
              dot={isOpen}
            />
          </View>
        ) : null}
      </Photo>
      <View style={styles.body}>
        <ThemedText variant="h3" numberOfLines={1}>
          {name}
        </ThemedText>
        {address ? (
          <ThemedText variant="caption" color="textTertiary" numberOfLines={1}>
            {address}
          </ThemedText>
        ) : null}
        <View style={styles.meta}>
          <Ionicons name="star" size={13} color={colors.ratingStar} />
          <ThemedText variant="captionStrong">{rating.toFixed(1)}</ThemedText>
          {distanceKm != null ? (
            <ThemedText variant="caption" color="textTertiary">
              · {distanceKm.toFixed(1)} km
            </ThemedText>
          ) : null}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  photo: { height: 128, width: '100%' },
  badge: { position: 'absolute', top: spacing.xs, left: spacing.xs },
  body: { padding: spacing.sm + 2, gap: 2 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
});

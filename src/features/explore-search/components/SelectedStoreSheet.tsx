import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Linking, Platform, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Animated from 'react-native-reanimated';

import { Button } from '@/components/Button';
import { Photo } from '@/components/Photo';
import { Pill } from '@/components/Pill';
import { PressableScale } from '@/components/PressableScale';
import { ThemedText } from '@/components/ThemedText';
import { enter, radius, shadows, spacing, useColors } from '@/theme';

import type { NearbyStore } from '../api/schemas';

import { SheetDragHandle } from './SheetDragHandle';

interface SelectedStoreSheetProps {
  store: NearbyStore;
  categoryName?: string;
  expanded: boolean;
  onExpand: () => void;
  onCollapse: () => void;
  onLayout: (e: LayoutChangeEvent) => void;
}

function Meta({ store, categoryName }: { store: NearbyStore; categoryName?: string }) {
  const colors = useColors();
  return (
    <View style={styles.meta}>
      {store.rating > 0 ? (
        <View style={styles.rating}>
          <Ionicons name="star" size={13} color={colors.ratingStar} />
          <ThemedText variant="captionStrong">{store.rating.toFixed(1)}</ThemedText>
        </View>
      ) : null}
      {categoryName ? (
        <ThemedText variant="caption" color="textSecondary" numberOfLines={1} style={styles.shrink}>
          {categoryName}
        </ThemedText>
      ) : null}
      {store.distance_km != null ? (
        <ThemedText variant="caption" color="textSecondary">
          {store.distance_km.toFixed(1)} km
        </ThemedText>
      ) : null}
    </View>
  );
}

/**
 * The venue behind the tapped pin. Peek: photo, name, a line of facts. Expanded: a bigger photo and the three
 * actions (Book, Call, Directions). The handle and the peek both expand it; the photo and name open the venue.
 */
export function SelectedStoreSheet({
  store,
  categoryName,
  expanded,
  onExpand,
  onCollapse,
  onLayout,
}: SelectedStoreSheetProps) {
  const { t } = useTranslation();
  const colors = useColors();
  const isOpen = store.status === 'open';

  const openVenue = () => router.push(`/venue/${store.id}`);
  const call = () => {
    if (!store.phone) return;
    Linking.openURL(`tel:${store.phone}`);
  };
  const openDirections = async () => {
    const destination = `${store.latitude},${store.longitude}`;
    // canOpenURL throws rather than resolving false when the target scheme
    // isn't declared in LSApplicationQueriesSchemes (or simply isn't
    // installed, e.g. the Simulator) — treat either case as "not available".
    const hasGoogleMapsApp =
      Platform.OS === 'ios' && (await Linking.canOpenURL('comgooglemaps://').catch(() => false));
    if (hasGoogleMapsApp) {
      Linking.openURL(`comgooglemaps://?daddr=${destination}&directionsmode=driving`);
      return;
    }
    Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${destination}`);
  };

  return (
    <Animated.View
      entering={enter(0)}
      onLayout={onLayout}
      style={[styles.sheet, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <SheetDragHandle
        onExpand={expanded ? undefined : onExpand}
        onCollapse={expanded ? onCollapse : undefined}
        accessibilityLabel={store.name}
      />

      {expanded ? (
        <View style={styles.expanded}>
          <PressableScale
            onPress={openVenue}
            scaleTo={0.99}
            accessibilityRole="button"
            accessibilityLabel={store.name}
            style={styles.expandedTop}
          >
            <Photo
              uri={store.logo}
              name={store.name}
              style={styles.expandedPhoto}
              initialSize={48}
            />
            <View style={styles.expandedInfo}>
              <ThemedText variant="h2" numberOfLines={2}>
                {store.name}
              </ThemedText>
              <Meta store={store} categoryName={categoryName} />
              {isOpen ? <Pill label={t('explore.openNow')} tone="mint" dot /> : null}
            </View>
          </PressableScale>

          <View style={styles.actions}>
            <Button label={t('explore.book')} icon="calendar-outline" onPress={openVenue} />
            <View style={styles.secondaryActions}>
              <Button
                label={t('explore.call')}
                icon="call-outline"
                variant="secondary"
                size="sm"
                disabled={!store.phone}
                onPress={call}
                style={styles.flex}
              />
              <Button
                label={t('explore.directions')}
                icon="navigate-outline"
                variant="secondary"
                size="sm"
                onPress={openDirections}
                style={styles.flex}
              />
            </View>
          </View>
        </View>
      ) : (
        <PressableScale
          onPress={onExpand}
          scaleTo={0.99}
          accessibilityRole="button"
          accessibilityLabel={store.name}
          style={styles.peek}
        >
          <Photo uri={store.logo} name={store.name} style={styles.peekPhoto} initialSize={26} />
          <View style={styles.peekInfo}>
            <ThemedText variant="h3" numberOfLines={1}>
              {store.name}
            </ThemedText>
            <Meta store={store} categoryName={categoryName} />
          </View>
          {isOpen ? <Pill label={t('explore.openNow')} tone="mint" dot /> : null}
        </PressableScale>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderBottomWidth: 0,
    ...shadows.lg,
  },
  flex: { flex: 1 },
  shrink: { flexShrink: 1 },
  meta: { flexDirection: 'row', alignItems: 'center', columnGap: spacing.sm, flexWrap: 'wrap' },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  peek: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.gutter,
    paddingBottom: spacing.md,
  },
  peekPhoto: { width: 64, height: 64, borderRadius: radius.md },
  peekInfo: { flex: 1, minWidth: 0, gap: 4 },
  expanded: { paddingHorizontal: spacing.gutter, paddingBottom: spacing.md, gap: spacing.md },
  expandedTop: { gap: spacing.sm },
  expandedPhoto: { width: '100%', height: 136, borderRadius: radius.lg },
  expandedInfo: { gap: 6 },
  actions: { gap: spacing.xs },
  secondaryActions: { flexDirection: 'row', gap: spacing.xs },
});

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Linking, Platform, Pressable, ScrollView, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import MapView, { Marker, type Region } from 'react-native-maps';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Supercluster from 'supercluster';
import type * as SuperclusterNS from 'supercluster';

import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { MapPin } from '@/features/home/components/MapPin';
import { useCategories } from '@/features/home/hooks/useHomeData';
import { iconForCategory, pinColorForCategory } from '@/features/home/utils/categoryIcon';
import { useCustomerLocation } from '@/lib/location/useCustomerLocation';
import { ANDROID_MAP_STYLE, CLUSTER_COLOR, MAP_PROVIDER, MAP_SHADOW_COLOR } from '@/lib/maps';
import { colors, fontFamily, radius, shadows, spacing } from '@/theme';

import { type NearbyStore } from '../api/schemas';
import { useNearbyStores } from '../hooks/useNearbyStores';

const RATING_OPTIONS = [4, 4.5];
const DEFAULT_ZOOM = 13;
const DEFAULT_DELTA = 360 / 2 ** DEFAULT_ZOOM;
// How far the selected-pin callout floats above its pin — clears the
// circular pin's radius (selected pins render at size 36) plus a small gap.
// The pin is center-anchored, so this only needs to clear its top half.
const CALLOUT_LIFT = 30;
// Drag distance (px) past which the sheet handle's pan gesture commits to
// expanding/collapsing, instead of springing back to rest.
const DRAG_TRIGGER_DISTANCE = 28;

function regionToZoom(region: Region) {
  return Math.round(Math.log2(360 / region.longitudeDelta));
}

function regionToBBox(region: Region): [number, number, number, number] {
  return [
    region.longitude - region.longitudeDelta,
    region.latitude - region.latitudeDelta,
    region.longitude + region.longitudeDelta,
    region.latitude + region.latitudeDelta,
  ];
}

type StorePointProps = { cluster: false; storeId: string };
type StorePoint = SuperclusterNS.PointFeature<StorePointProps>;

export function ExploreScreen() {
  const { t } = useTranslation();
  const location = useCustomerLocation();
  const categories = useCategories();

  const nearbyParams = { latitude: location.latitude, longitude: location.longitude, radius_km: 15, limit: 50 };
  const nearby = useNearbyStores(nearbyParams);

  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [openNowOnly, setOpenNowOnly] = useState(false);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [openPanel, setOpenPanel] = useState<'category' | 'rating' | null>(null);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const [sheetHeight, setSheetHeight] = useState(0);

  const categoryNameById = useMemo(() => {
    const map = new Map<number, string>();
    categories.data?.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [categories.data]);

  const filteredStores = useMemo(() => {
    if (!nearby.data) return [];
    return nearby.data.filter((store) => {
      if (selectedCategoryId !== null && store.category_id !== selectedCategoryId) return false;
      if (openNowOnly && store.status !== 'open') return false;
      if (minRating !== null && store.rating < minRating) return false;
      return true;
    });
  }, [nearby.data, selectedCategoryId, openNowOnly, minRating]);

  const selectedStore = useMemo(
    () => nearby.data?.find((s) => s.id === selectedStoreId) ?? null,
    [nearby.data, selectedStoreId],
  );

  const selectedCategoryName = selectedCategoryId !== null ? categoryNameById.get(selectedCategoryId) : undefined;

  // A pin tap always opens the compact peek first, like Google/Apple Maps —
  // re-selecting the same pin while expanded shouldn't keep it expanded.
  const selectStore = (id: string) => {
    setSelectedStoreId(id);
    setSheetExpanded(false);
  };
  const deselect = () => {
    setSelectedStoreId(null);
    setSheetExpanded(false);
  };

  return (
    <Screen edges={[]} style={styles.screen}>
      <ExploreMap
        latitude={location.latitude}
        longitude={location.longitude}
        showsUserLocation={location.status === 'granted'}
        isLoading={nearby.isLoading}
        isError={nearby.isError}
        filteredStores={filteredStores}
        categoryNameById={categoryNameById}
        selectedStore={selectedStore}
        selectedStoreId={selectedStoreId}
        sheetExpanded={sheetExpanded}
        sheetHeight={sheetHeight}
        openPanel={openPanel}
        onClosePanel={() => setOpenPanel(null)}
        onSelectStore={selectStore}
        onDeselect={deselect}
        onExpandSheet={() => setSheetExpanded(true)}
        onCollapseSheet={() => setSheetExpanded(false)}
        onSheetHeightChange={setSheetHeight}
      />

      <SafeAreaView edges={['top']} style={styles.headerCard}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.push('/(tabs)/home')} style={styles.backButton}>
            <Ionicons name="chevron-back" size={18} color={colors.brand} />
          </Pressable>
          <ThemedText variant="h3" color="brand">{t('explore.title')}</ThemedText>
        </View>

        <View style={styles.searchBar}>
          <Pressable onPress={() => router.push('/(tabs)/home/search')} style={styles.searchField}>
            <Ionicons name="search" size={15} color={colors.textSecondary} />
            <ThemedText variant="caption" color="textSecondary" numberOfLines={1} style={styles.searchText}>
              {t('home.searchPlaceholder')}
            </ThemedText>
          </Pressable>
          <View style={styles.searchDivider} />
          <View style={styles.locationField}>
            <Ionicons name="location" size={12} color={colors.brand} />
            <ThemedText variant="caption" color="brand">{t('explore.yourLocation')}</ThemedText>
          </View>
        </View>

        <View style={styles.filterRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            <FilterChip
              icon="menu-outline"
              label={selectedCategoryName ?? t('explore.category')}
              active={selectedCategoryId !== null}
              onPress={() => setOpenPanel((p) => (p === 'category' ? null : 'category'))}
            />
            <FilterChip
              label={t('explore.openNow')}
              active={openNowOnly}
              onPress={() => {
                setOpenNowOnly((v) => !v);
                setOpenPanel(null);
              }}
            />
            <FilterChip
              label={minRating ? t('explore.ratingPlus', { rating: minRating }) : t('explore.rating')}
              active={minRating !== null}
              onPress={() => setOpenPanel((p) => (p === 'rating' ? null : 'rating'))}
            />
          </ScrollView>

          {openPanel === 'category' ? (
            <View style={[styles.panel, styles.panelLeft]}>
              <View style={[styles.panelCaret, styles.panelCaretLeft]} />
              <PanelRow
                label={t('explore.allCategories')}
                selected={selectedCategoryId === null}
                onPress={() => {
                  setSelectedCategoryId(null);
                  setOpenPanel(null);
                }}
              />
              {categories.data?.map((category) => (
                <PanelRow
                  key={category.id}
                  label={category.name}
                  icon={iconForCategory(category.name)}
                  selected={selectedCategoryId === category.id}
                  onPress={() => {
                    setSelectedCategoryId(category.id);
                    setOpenPanel(null);
                  }}
                />
              ))}
            </View>
          ) : null}

          {openPanel === 'rating' ? (
            <View style={[styles.panel, styles.panelRight]}>
              <View style={[styles.panelCaret, styles.panelCaretRight]} />
              <PanelRow
                label={t('explore.anyRating')}
                selected={minRating === null}
                onPress={() => {
                  setMinRating(null);
                  setOpenPanel(null);
                }}
              />
              {RATING_OPTIONS.map((r) => (
                <PanelRow
                  key={r}
                  label={t('explore.ratingPlus', { rating: r })}
                  selected={minRating === r}
                  onPress={() => {
                    setMinRating(r);
                    setOpenPanel(null);
                  }}
                />
              ))}
            </View>
          ) : null}
        </View>
      </SafeAreaView>
    </Screen>
  );
}

// Owns the map itself: camera/region, clustering, and the pin/sheet overlay.
// Split out from ExploreScreen so `region`'s initial state can be seeded
// directly from `latitude`/`longitude` on mount. Those start as a fallback
// (Cairo) position so the screen never blocks on GPS — see the recenter
// effect below, which moves the camera once useCustomerLocation resolves a
// real fix.
function ExploreMap({
  latitude,
  longitude,
  showsUserLocation,
  isLoading,
  isError,
  filteredStores,
  categoryNameById,
  selectedStore,
  selectedStoreId,
  sheetExpanded,
  sheetHeight,
  openPanel,
  onClosePanel,
  onSelectStore,
  onDeselect,
  onExpandSheet,
  onCollapseSheet,
  onSheetHeightChange,
}: {
  latitude: number;
  longitude: number;
  showsUserLocation: boolean;
  isLoading: boolean;
  isError: boolean;
  filteredStores: NearbyStore[];
  categoryNameById: Map<number, string>;
  selectedStore: NearbyStore | null;
  selectedStoreId: string | null;
  sheetExpanded: boolean;
  sheetHeight: number;
  openPanel: 'category' | 'rating' | null;
  onClosePanel: () => void;
  onSelectStore: (id: string) => void;
  onDeselect: () => void;
  onExpandSheet: () => void;
  onCollapseSheet: () => void;
  onSheetHeightChange: (height: number) => void;
}) {
  const { t } = useTranslation();
  const mapRef = useRef<MapView>(null);
  const [region, setRegion] = useState<Region>(() => ({
    latitude,
    longitude,
    latitudeDelta: DEFAULT_DELTA,
    longitudeDelta: DEFAULT_DELTA,
  }));

  // `region` above is only seeded once, on mount — it won't pick up a later
  // `latitude`/`longitude` change on its own. Since those start as a Cairo
  // fallback and update in place once useCustomerLocation resolves a real
  // fix, recenter the camera whenever that resolved position actually
  // changes (skipping the mount itself, which already used it as the seed).
  const centeredOnRef = useRef({ latitude, longitude });
  useEffect(() => {
    if (latitude === centeredOnRef.current.latitude && longitude === centeredOnRef.current.longitude) return;
    centeredOnRef.current = { latitude, longitude };
    const next: Region = { latitude, longitude, latitudeDelta: DEFAULT_DELTA, longitudeDelta: DEFAULT_DELTA };
    mapRef.current?.animateToRegion(next, 350);
    setRegion(next);
  }, [latitude, longitude]);

  const storesById = useMemo(() => {
    const map = new Map<string, NearbyStore>();
    filteredStores.forEach((store) => map.set(store.id, store));
    return map;
  }, [filteredStores]);

  const clusterIndex = useMemo(() => {
    const index = new Supercluster<StorePointProps>({ radius: 50, maxZoom: 17 });
    const points: StorePoint[] = filteredStores.map((store) => ({
      type: 'Feature',
      properties: { cluster: false, storeId: store.id },
      geometry: { type: 'Point', coordinates: [store.longitude, store.latitude] },
    }));
    index.load(points);
    return index;
  }, [filteredStores]);

  const clusters = useMemo(() => {
    const zoom = Math.min(20, Math.max(0, regionToZoom(region)));
    return clusterIndex.getClusters(regionToBBox(region), zoom);
  }, [clusterIndex, region]);

  const recenter = () => {
    const next: Region = { latitude, longitude, latitudeDelta: DEFAULT_DELTA, longitudeDelta: DEFAULT_DELTA };
    mapRef.current?.animateToRegion(next, 350);
    setRegion(next);
  };

  const expandCluster = (clusterId: number, coordinate: { latitude: number; longitude: number }) => {
    const targetZoom = Math.min(20, clusterIndex.getClusterExpansionZoom(clusterId));
    const delta = 360 / 2 ** targetZoom;
    const next: Region = { ...coordinate, latitudeDelta: delta, longitudeDelta: delta };
    mapRef.current?.animateToRegion(next, 350);
    setRegion(next);
  };

  return (
    <View style={styles.mapLayer}>
      {isError ? (
        <View style={styles.center}>
          <ThemedText variant="bodyMedium" color="textSecondary">
            {t('explore.loadError')}
          </ThemedText>
        </View>
      ) : (
        <MapView
          ref={mapRef}
          provider={MAP_PROVIDER}
          customMapStyle={ANDROID_MAP_STYLE}
          style={styles.map}
          initialRegion={region}
          onRegionChangeComplete={setRegion}
          showsUserLocation={showsUserLocation}
          showsMyLocationButton={false}
          onPress={() => (openPanel ? onClosePanel() : onDeselect())}
        >
          {clusters.map((point) => {
            const [pointLongitude, pointLatitude] = point.geometry.coordinates;
            if (point.properties.cluster) {
              const { cluster_id: clusterId, point_count: pointCount } = point.properties;
              return (
                <Marker
                  key={`cluster-${clusterId}`}
                  coordinate={{ latitude: pointLatitude, longitude: pointLongitude }}
                  onPress={(e) => {
                    // A Marker tap otherwise bubbles up to MapView's own
                    // onPress too, which would immediately deselect/close
                    // right after this — swallow it here.
                    e.stopPropagation();
                    expandCluster(clusterId, { latitude: pointLatitude, longitude: pointLongitude });
                  }}
                >
                  <ClusterBadge count={pointCount} />
                </Marker>
              );
            }

            const store = storesById.get(point.properties.storeId);
            if (!store) return null;
            return (
              <Marker
                key={store.id}
                coordinate={{ latitude: store.latitude, longitude: store.longitude }}
                anchor={{ x: 0.5, y: 0.5 }}
                onPress={(e) => {
                  e.stopPropagation();
                  onSelectStore(store.id);
                }}
              >
                <MapPin
                  categoryName={categoryNameById.get(store.category_id) ?? ''}
                  color={pinColorForCategory(categoryNameById.get(store.category_id) ?? '')}
                  isOpen={store.status === 'open'}
                  size={store.id === selectedStoreId ? 36 : 30}
                />
              </Marker>
            );
          })}

          {/* Mounted fresh (keyed by store id) whenever selection changes,
              never mutated in place — sidesteps react-native-maps' known
              Marker tracksViewChanges/Fabric re-snapshot quirk without
              needing an offscreen view-shot capture. */}
          {selectedStore ? (
            <Marker
              key={`sel-${selectedStore.id}`}
              coordinate={{ latitude: selectedStore.latitude, longitude: selectedStore.longitude }}
              anchor={{ x: 0.5, y: 1 }}
              zIndex={10}
            >
              <SelectedStoreCallout store={selectedStore} />
            </Marker>
          ) : null}
        </MapView>
      )}

      {isLoading ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator color={colors.brandAccent} />
        </View>
      ) : null}

      {!isLoading && !isError && filteredStores.length === 0 ? (
        <View style={styles.noResultsPill} pointerEvents="none">
          <ThemedText variant="caption" color="textSecondary">
            {t('explore.noMatches')}
          </ThemedText>
        </View>
      ) : null}

      <Pressable
        style={[styles.recenterButton, { bottom: (selectedStore ? sheetHeight : 0) + spacing.md }]}
        onPress={recenter}
      >
        <Ionicons name="locate" size={18} color={colors.brandAccent} />
      </Pressable>

      {selectedStore ? (
        <View style={styles.sheetPositioner} pointerEvents="box-none">
          {sheetExpanded ? (
            <ExploreSheetExpanded
              store={selectedStore}
              categoryName={categoryNameById.get(selectedStore.category_id)}
              onCollapse={onCollapseSheet}
              onLayout={(e) => onSheetHeightChange(e.nativeEvent.layout.height)}
            />
          ) : (
            <ExploreSheetCollapsed
              store={selectedStore}
              categoryName={categoryNameById.get(selectedStore.category_id)}
              onExpand={onExpandSheet}
              onLayout={(e) => onSheetHeightChange(e.nativeEvent.layout.height)}
            />
          )}
        </View>
      ) : null}
    </View>
  );
}

function ClusterBadge({ count }: { count: number }) {
  return (
    <View style={styles.clusterBadge}>
      <ThemedText variant="bodyMedium" color="textInverse" style={styles.clusterCount}>
        {count}
      </ThemedText>
    </View>
  );
}

function SelectedStoreCallout({ store }: { store: NearbyStore }) {
  return (
    <View style={styles.callout} pointerEvents="none">
      <ThemedText variant="bodyMedium" numberOfLines={1}>
        {store.name}
      </ThemedText>
      <View style={styles.previewMetaRow}>
        <Ionicons name="star" size={11} color={colors.warning} />
        <ThemedText variant="caption" style={styles.previewMetaText}>
          {store.rating.toFixed(1)}
        </ThemedText>
        {store.distance_km != null ? (
          <ThemedText variant="caption" color="textSecondary">
            {' '}
            · {store.distance_km.toFixed(1)} km
          </ThemedText>
        ) : null}
      </View>
    </View>
  );
}

// Drag the sheet's grip handle to expand/collapse (in addition to tapping
// it) — a Race between Pan and Tap so a plain tap still resolves instantly
// while a real drag past DRAG_TRIGGER_DISTANCE commits to the transition.
function SheetDragHandle({ onExpand, onCollapse }: { onExpand?: () => void; onCollapse?: () => void }) {
  // Callers always pass exactly one of the two; the no-op fallback only
  // guards against a hook-order violation if that were ever not the case.
  const trigger = onExpand ?? onCollapse ?? (() => {});
  const expanding = Boolean(onExpand);
  const translateY = useSharedValue(0);

  const pan = Gesture.Pan()
    .minDistance(6)
    .onUpdate((e) => {
      translateY.value = e.translationY;
    })
    .onEnd((e) => {
      const committed = expanding ? e.translationY < -DRAG_TRIGGER_DISTANCE : e.translationY > DRAG_TRIGGER_DISTANCE;
      if (committed) runOnJS(trigger)();
      translateY.value = withSpring(0, { damping: 18 });
    });

  const tap = Gesture.Tap().onEnd(() => runOnJS(trigger)());

  const composed = Gesture.Race(pan, tap);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value * 0.35 }],
  }));

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={[styles.sheetHandleWrap, animatedStyle]}>
        <View style={styles.sheetHandle} />
      </Animated.View>
    </GestureDetector>
  );
}

function FilterChip({
  icon,
  label,
  active,
  onPress,
}: {
  icon?: keyof typeof Ionicons.glyphMap;
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      {icon ? <Ionicons name={icon} size={13} color={active ? colors.textInverse : colors.brand} /> : null}
      <ThemedText variant="caption" color={active ? 'textInverse' : 'brand'} style={active && styles.chipTextActive}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

function PanelRow({
  label,
  icon,
  selected,
  onPress,
}: {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.panelRow, selected && styles.panelRowSelected]}>
      {icon ? (
        <View style={styles.panelIconWrap}>
          <Ionicons name={icon} size={14} color={colors.brandAccent} />
        </View>
      ) : null}
      <ThemedText variant="body" style={styles.panelLabel}>
        {label}
      </ThemedText>
      {selected ? <Ionicons name="checkmark" size={16} color={colors.brandAccent} /> : null}
    </Pressable>
  );
}

function StorePhoto({ store, style }: { store: NearbyStore; style: object }) {
  return store.logo ? (
    <Image source={{ uri: store.logo }} style={style} contentFit="cover" />
  ) : (
    <View style={[style, styles.photoFallback]} />
  );
}

function StatusPill({ open }: { open: boolean }) {
  const { t } = useTranslation();
  return (
    <View style={[styles.statusPill, open ? styles.statusPillOpen : styles.statusPillClosed]}>
      <ThemedText variant="caption" color={open ? 'success' : 'textSecondary'} style={styles.statusPillText}>
        {open ? t('explore.openNow') : t('explore.closedNow')}
      </ThemedText>
    </View>
  );
}

// Compact peek — matches the design's collapsed sheet: tapping anywhere on
// it (or dragging/tapping the handle) expands to the full sheet below.
function ExploreSheetCollapsed({
  store,
  categoryName,
  onExpand,
  onLayout,
}: {
  store: NearbyStore;
  categoryName?: string;
  onExpand: () => void;
  onLayout: (e: LayoutChangeEvent) => void;
}) {
  return (
    <View style={styles.sheetCollapsed} onLayout={onLayout}>
      <SheetDragHandle onExpand={onExpand} />
      <Pressable style={styles.collapsedBody} onPress={onExpand}>
        <View style={styles.collapsedRow}>
          <StorePhoto store={store} style={styles.collapsedPhoto} />
          <View style={styles.collapsedInfo}>
            <ThemedText variant="bodyMedium" numberOfLines={1}>
              {store.name}
            </ThemedText>
            <View style={styles.previewMetaRow}>
              <Ionicons name="star" size={11} color={colors.warning} />
              <ThemedText variant="caption" style={styles.previewMetaText}>
                {store.rating.toFixed(1)}
              </ThemedText>
              {categoryName ? (
                <ThemedText variant="caption" color="textSecondary" numberOfLines={1}>
                  {' '}
                  · {categoryName}
                </ThemedText>
              ) : null}
              {store.distance_km != null ? (
                <ThemedText variant="caption" color="textSecondary">
                  {' '}
                  · {store.distance_km.toFixed(1)} km
                </ThemedText>
              ) : null}
            </View>
          </View>
          <StatusPill open={store.status === 'open'} />
        </View>
      </Pressable>
    </View>
  );
}

// Full sheet — matches the design's expanded state: the handle collapses
// back to the peek, the photo/info block opens the venue, and the action
// row is independent of both.
function ExploreSheetExpanded({
  store,
  categoryName,
  onCollapse,
  onLayout,
}: {
  store: NearbyStore;
  categoryName?: string;
  onCollapse: () => void;
  onLayout: (e: LayoutChangeEvent) => void;
}) {
  const { t } = useTranslation();

  const call = () => {
    if (!store.phone_number) return;
    Linking.openURL(`tel:${store.phone_country_code ?? ''}${store.phone_number}`);
  };
  const openDirections = async () => {
    const destination = `${store.latitude},${store.longitude}`;
    // canOpenURL throws rather than resolving false when the target scheme
    // isn't declared in LSApplicationQueriesSchemes (or simply isn't
    // installed, e.g. the Simulator) — treat either case as "not available".
    const hasGoogleMapsApp = Platform.OS === 'ios' && (await Linking.canOpenURL('comgooglemaps://').catch(() => false));
    if (hasGoogleMapsApp) {
      Linking.openURL(`comgooglemaps://?daddr=${destination}&directionsmode=driving`);
      return;
    }
    Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${destination}`);
  };

  return (
    <View style={styles.sheetExpanded} onLayout={onLayout}>
      <SheetDragHandle onCollapse={onCollapse} />

      <View style={styles.sheetExpandedContent}>
        <Pressable style={styles.expandedTop} onPress={() => router.push(`/venue/${store.id}`)}>
          <StorePhoto store={store} style={styles.expandedPhoto} />
          <View style={styles.expandedInfo}>
            <ThemedText variant="h3" numberOfLines={1}>
              {store.name}
            </ThemedText>
            <View style={styles.previewMetaRow}>
              <Ionicons name="star" size={12} color={colors.warning} />
              <ThemedText variant="caption" style={styles.previewMetaText}>
                {store.rating.toFixed(1)}
              </ThemedText>
              {categoryName ? (
                <ThemedText variant="caption" color="textSecondary">
                  {' '}
                  · {categoryName}
                </ThemedText>
              ) : null}
              {store.distance_km != null ? (
                <ThemedText variant="caption" color="textSecondary">
                  {' '}
                  · {store.distance_km.toFixed(1)} km
                </ThemedText>
              ) : null}
            </View>
            <ThemedText
              variant="caption"
              color={store.status === 'open' ? 'success' : 'textSecondary'}
              style={styles.previewStatus}
            >
              {store.status === 'open' ? t('explore.openNow') : t('explore.closedNow')}
            </ThemedText>
          </View>
        </Pressable>

        <View style={styles.previewActions}>
          <Pressable style={styles.previewActionBtn} onPress={call} disabled={!store.phone_number}>
            <Ionicons name="call-outline" size={16} color={colors.textPrimary} />
            <ThemedText variant="caption" style={styles.previewActionLabel}>
              {t('explore.call')}
            </ThemedText>
          </Pressable>
          <Pressable style={styles.previewActionBtn} onPress={openDirections}>
            <Ionicons name="navigate-outline" size={16} color={colors.textPrimary} />
            <ThemedText variant="caption" style={styles.previewActionLabel}>
              {t('explore.directions')}
            </ThemedText>
          </Pressable>
          <Pressable style={[styles.previewActionBtn, styles.previewBookBtn]} onPress={() => router.push(`/venue/${store.id}`)}>
            <Ionicons name="calendar-outline" size={16} color={colors.textInverse} />
            <ThemedText variant="caption" color="textInverse" style={styles.previewActionLabel}>
              {t('explore.book')}
            </ThemedText>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { padding: 0 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  mapLayer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  map: { flex: 1 },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  headerCard: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
    ...shadows.md,
    shadowColor: MAP_SHADOW_COLOR,
    zIndex: 10,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.brandTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    ...shadows.sm,
    shadowColor: MAP_SHADOW_COLOR,
  },
  searchField: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.sm + 2, paddingVertical: spacing.sm },
  searchText: { flexShrink: 1 },
  searchDivider: { width: 1, backgroundColor: colors.border },
  locationField: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: spacing.sm + 2, flexShrink: 0 },
  filterRow: { position: 'relative' },
  filterScroll: { gap: spacing.xs, paddingVertical: 2 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 1,
    borderRadius: radius.pill,
    marginRight: spacing.xs,
    ...shadows.sm,
    shadowColor: MAP_SHADOW_COLOR,
  },
  chipActive: { backgroundColor: colors.brandAccent },
  chipTextActive: { fontFamily: fontFamily.bodySemiBold },
  panel: {
    position: 'absolute',
    top: '100%',
    marginTop: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.xxs + 2,
    minWidth: 190,
    ...shadows.lg,
    shadowColor: MAP_SHADOW_COLOR,
    zIndex: 20,
  },
  panelLeft: { left: 0 },
  panelRight: { right: 0 },
  panelCaret: {
    position: 'absolute',
    top: -6,
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderBottomWidth: 7,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: colors.surface,
  },
  panelCaretLeft: { left: 22 },
  panelCaretRight: { right: 22 },
  panelRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.xs + 2, paddingVertical: spacing.xs + 2, borderRadius: radius.sm },
  panelRowSelected: { backgroundColor: colors.brandTint },
  panelIconWrap: {
    width: 26,
    height: 26,
    borderRadius: radius.pill,
    backgroundColor: colors.brandTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  panelLabel: { flex: 1 },
  noResultsPill: {
    position: 'absolute',
    top: spacing.md,
    alignSelf: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    ...shadows.sm,
    shadowColor: MAP_SHADOW_COLOR,
  },
  recenterButton: {
    position: 'absolute',
    right: spacing.md,
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
    shadowColor: MAP_SHADOW_COLOR,
  },
  clusterBadge: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: CLUSTER_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
    shadowColor: MAP_SHADOW_COLOR,
  },
  clusterCount: { fontFamily: fontFamily.bodySemiBold },
  callout: {
    marginBottom: CALLOUT_LIFT,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
    minWidth: 120,
    maxWidth: 220,
    ...shadows.md,
    shadowColor: MAP_SHADOW_COLOR,
  },
  photoFallback: { backgroundColor: colors.backgroundMuted },
  previewMetaRow: { flexDirection: 'row', alignItems: 'center' },
  previewMetaText: { fontFamily: fontFamily.bodySemiBold },
  previewStatus: { fontFamily: fontFamily.bodySemiBold },
  previewActions: { flexDirection: 'row', gap: spacing.xs },
  previewActionBtn: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.backgroundMuted,
    borderRadius: radius.md,
    paddingVertical: spacing.xs + 3,
  },
  previewActionLabel: { fontFamily: fontFamily.bodySemiBold },
  previewBookBtn: { backgroundColor: colors.brandAccent },
  statusPill: { paddingHorizontal: spacing.xs + 2, paddingVertical: 4, borderRadius: radius.pill, flexShrink: 0, alignSelf: 'flex-start' },
  statusPillOpen: { backgroundColor: colors.successTint },
  statusPillClosed: { backgroundColor: colors.neutralTint },
  statusPillText: { fontFamily: fontFamily.bodySemiBold },

  // Fills the whole map layer (not just the sheet's own height) so the
  // sheet's `maxHeight: '55%'` below has a definite parent height to
  // resolve against — Yoga can't compute a percentage against an
  // auto-sized parent. `box-none` lets taps on the empty area above the
  // sheet still reach the map underneath.
  sheetPositioner: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'flex-end' },
  sheetHandle: { width: 36, height: 5, borderRadius: radius.pill, backgroundColor: colors.border },
  sheetHandleWrap: { paddingTop: spacing.xs + 2, paddingBottom: spacing.xs, alignItems: 'center' },

  sheetCollapsed: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    ...shadows.lg,
    shadowColor: MAP_SHADOW_COLOR,
  },
  collapsedBody: { paddingHorizontal: spacing.md, paddingBottom: spacing.md + 2 },
  collapsedRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  collapsedPhoto: { width: 56, height: 56, borderRadius: radius.md },
  collapsedInfo: { flex: 1, minWidth: 0, gap: 3 },

  sheetExpanded: {
    maxHeight: '55%',
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    ...shadows.lg,
    shadowColor: MAP_SHADOW_COLOR,
  },
  sheetExpandedContent: { paddingHorizontal: spacing.md, paddingBottom: spacing.md + 2, gap: spacing.sm + 2 },
  expandedTop: { gap: spacing.sm },
  expandedPhoto: { width: '100%', height: 160, borderRadius: radius.lg },
  expandedInfo: { gap: 4 },
});

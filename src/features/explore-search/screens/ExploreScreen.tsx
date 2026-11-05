import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, type Region } from 'react-native-maps';
import Supercluster from 'supercluster';
import type * as SuperclusterNS from 'supercluster';

import { EmptyState } from '@/components/EmptyState';
import { IconButton } from '@/components/IconButton';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { MapPin } from '@/features/home/components/MapPin';
import { useCategories } from '@/features/home/hooks/useHomeData';
import { pinColorForCategory } from '@/features/home/utils/categoryIcon';
import { useCustomerLocation } from '@/lib/location/useCustomerLocation';
import {
  ANDROID_MAP_STYLE_DARK,
  ANDROID_MAP_STYLE_LIGHT,
  CLUSTER_COLOR,
  MAP_PROVIDER,
  MAP_SHADOW_COLOR,
} from '@/lib/maps';
import { fontFamily, radius, shadows, spacing, useColors, useTheme, type Colors } from '@/theme';

import { isMappable } from '../api/mappers';
import { type MappableStore, type NearbyStore } from '../api/schemas';
import { ExploreHeader, type FilterPanel } from '../components/ExploreHeader';
import { ResultsSheet } from '../components/ResultsSheet';
import { SelectedStoreSheet } from '../components/SelectedStoreSheet';
import { useNearbyStores } from '../hooks/useNearbyStores';

const RATING_OPTIONS = [4, 4.5];
const DEFAULT_ZOOM = 13;
const DEFAULT_DELTA = 360 / 2 ** DEFAULT_ZOOM;
// How far the selected-pin callout floats above its pin — clears the
// circular pin's radius (selected pins render at size 36) plus a small gap.
// The pin is center-anchored, so this only needs to clear its top half.
const CALLOUT_LIFT = 30;

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
  const location = useCustomerLocation();
  const categories = useCategories();

  const nearbyParams = {
    latitude: location.latitude,
    longitude: location.longitude,
    radius_km: 15,
    limit: 50,
  };
  const nearby = useNearbyStores(nearbyParams);

  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(null);
  const [openNowOnly, setOpenNowOnly] = useState(false);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [openPanel, setOpenPanel] = useState<FilterPanel>(null);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const [sheetHeight, setSheetHeight] = useState(0);

  const categoryNameBySlug = useMemo(() => {
    const map = new Map<string, string>();
    categories.data?.forEach((c) => map.set(c.slug, c.name));
    return map;
  }, [categories.data]);

  // Stores without coordinates can't be pinned, so they never reach the map.
  const mappableStores = useMemo(() => nearby.data?.filter(isMappable) ?? [], [nearby.data]);

  const filteredStores = useMemo(() => {
    return mappableStores.filter((store) => {
      if (selectedCategorySlug !== null && !store.category_slugs.includes(selectedCategorySlug))
        return false;
      if (openNowOnly && store.status !== 'open') return false;
      if (minRating !== null && store.rating < minRating) return false;
      return true;
    });
  }, [mappableStores, selectedCategorySlug, openNowOnly, minRating]);

  const selectedStore = useMemo(
    () => mappableStores.find((s) => s.id === selectedStoreId) ?? null,
    [mappableStores, selectedStoreId],
  );

  const selectedCategoryName =
    selectedCategorySlug !== null ? categoryNameBySlug.get(selectedCategorySlug) : undefined;

  const filtersActive = selectedCategorySlug !== null || openNowOnly || minRating !== null;
  const clearFilters = () => {
    setSelectedCategorySlug(null);
    setOpenNowOnly(false);
    setMinRating(null);
    setOpenPanel(null);
  };

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
    <Screen edges={[]}>
      <ExploreMap
        latitude={location.latitude}
        longitude={location.longitude}
        showsUserLocation={location.status === 'granted'}
        isLoading={nearby.isLoading}
        isError={nearby.isError}
        onRetry={() => nearby.refetch()}
        filteredStores={filteredStores}
        filtersActive={filtersActive}
        onClearFilters={clearFilters}
        categoryNameBySlug={categoryNameBySlug}
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

      <ExploreHeader
        categories={categories.data ?? []}
        ratingOptions={RATING_OPTIONS}
        selectedCategorySlug={selectedCategorySlug}
        selectedCategoryName={selectedCategoryName}
        openNowOnly={openNowOnly}
        minRating={minRating}
        openPanel={openPanel}
        onTogglePanel={(panel) => setOpenPanel((p) => (p === panel ? null : panel))}
        onSelectCategory={(slug) => {
          setSelectedCategorySlug(slug);
          setOpenPanel(null);
        }}
        onToggleOpenNow={() => {
          setOpenNowOnly((v) => !v);
          setOpenPanel(null);
        }}
        onSelectRating={(rating) => {
          setMinRating(rating);
          setOpenPanel(null);
        }}
        onClearFilters={clearFilters}
      />
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
  onRetry,
  filteredStores,
  filtersActive,
  onClearFilters,
  categoryNameBySlug,
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
  onRetry: () => void;
  filteredStores: MappableStore[];
  filtersActive: boolean;
  onClearFilters: () => void;
  categoryNameBySlug: Map<string, string>;
  selectedStore: MappableStore | null;
  selectedStoreId: string | null;
  sheetExpanded: boolean;
  sheetHeight: number;
  openPanel: FilterPanel;
  onClosePanel: () => void;
  onSelectStore: (id: string) => void;
  onDeselect: () => void;
  onExpandSheet: () => void;
  onCollapseSheet: () => void;
  onSheetHeightChange: (height: number) => void;
}) {
  const { t } = useTranslation();
  const colors = useColors();
  const { scheme } = useTheme();
  const styles = createStyles(colors);
  // The results list is its own sheet (peek or pulled up); a selected pin swaps it for that venue's sheet.
  const [resultsExpanded, setResultsExpanded] = useState(false);
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
    if (
      latitude === centeredOnRef.current.latitude &&
      longitude === centeredOnRef.current.longitude
    )
      return;
    centeredOnRef.current = { latitude, longitude };
    const next: Region = {
      latitude,
      longitude,
      latitudeDelta: DEFAULT_DELTA,
      longitudeDelta: DEFAULT_DELTA,
    };
    mapRef.current?.animateToRegion(next, 350);
    setRegion(next);
  }, [latitude, longitude]);

  const storesById = useMemo(() => {
    const map = new Map<string, MappableStore>();
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
    const next: Region = {
      latitude,
      longitude,
      latitudeDelta: DEFAULT_DELTA,
      longitudeDelta: DEFAULT_DELTA,
    };
    mapRef.current?.animateToRegion(next, 350);
    setRegion(next);
  };

  const expandCluster = (
    clusterId: number,
    coordinate: { latitude: number; longitude: number },
  ) => {
    const targetZoom = Math.min(20, clusterIndex.getClusterExpansionZoom(clusterId));
    const delta = 360 / 2 ** targetZoom;
    const next: Region = { ...coordinate, latitudeDelta: delta, longitudeDelta: delta };
    mapRef.current?.animateToRegion(next, 350);
    setRegion(next);
  };

  const sheetVisible = !isError;

  return (
    <View style={styles.mapLayer}>
      {isError ? (
        <View style={styles.center}>
          <EmptyState
            icon="cloud-offline-outline"
            title={t('explore.loadError')}
            body={t('explore.loadErrorBody')}
            actionLabel={t('common.retry')}
            onAction={onRetry}
          />
        </View>
      ) : (
        <MapView
          ref={mapRef}
          provider={MAP_PROVIDER}
          userInterfaceStyle={scheme}
          customMapStyle={scheme === 'dark' ? ANDROID_MAP_STYLE_DARK : ANDROID_MAP_STYLE_LIGHT}
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
                    expandCluster(clusterId, {
                      latitude: pointLatitude,
                      longitude: pointLongitude,
                    });
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
                  categorySlug={store.category_slugs[0] ?? ''}
                  color={pinColorForCategory(store.category_slugs[0] ?? '', colors)}
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

      {sheetVisible ? (
        <View style={styles.recenterWrap} pointerEvents="box-none">
          <View style={{ marginBottom: sheetHeight + spacing.md }}>
            <IconButton
              icon="locate"
              variant="overlay"
              size={46}
              color={colors.brandAccent}
              accessibilityLabel={t('explore.recenter')}
              onPress={recenter}
            />
          </View>
        </View>
      ) : null}

      {sheetVisible ? (
        <View style={styles.sheetPositioner} pointerEvents="box-none">
          {selectedStore ? (
            <SelectedStoreSheet
              key={selectedStore.id}
              store={selectedStore}
              categoryName={categoryNameBySlug.get(selectedStore.category_slugs[0] ?? '')}
              expanded={sheetExpanded}
              onExpand={onExpandSheet}
              onCollapse={onCollapseSheet}
              onLayout={(e) => onSheetHeightChange(e.nativeEvent.layout.height)}
            />
          ) : (
            <ResultsSheet
              stores={filteredStores}
              categoryNameBySlug={categoryNameBySlug}
              isLoading={isLoading}
              filtersActive={filtersActive}
              onClearFilters={onClearFilters}
              expanded={resultsExpanded}
              onExpand={() => setResultsExpanded(true)}
              onCollapse={() => setResultsExpanded(false)}
              onLayout={(e) => onSheetHeightChange(e.nativeEvent.layout.height)}
            />
          )}
        </View>
      ) : null}
    </View>
  );
}

function ClusterBadge({ count }: { count: number }) {
  const styles = createStyles(useColors());
  return (
    <View style={styles.clusterBadge}>
      <ThemedText variant="bodyMedium" color="textInverse" style={styles.clusterCount}>
        {count}
      </ThemedText>
    </View>
  );
}

function SelectedStoreCallout({ store }: { store: NearbyStore }) {
  const colors = useColors();
  const styles = createStyles(colors);
  return (
    <View style={styles.callout} pointerEvents="none">
      <ThemedText variant="captionStrong" numberOfLines={1}>
        {store.name}
      </ThemedText>
      <View style={styles.calloutMeta}>
        {store.rating > 0 ? (
          <>
            <Ionicons name="star" size={11} color={colors.ratingStar} />
            <ThemedText variant="caption">{store.rating.toFixed(1)}</ThemedText>
          </>
        ) : null}
        {store.distance_km != null ? (
          <ThemedText variant="caption" color="textSecondary">
            {store.rating > 0 ? ' · ' : ''}
            {store.distance_km.toFixed(1)} km
          </ThemedText>
        ) : null}
      </View>
    </View>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 140 },
    mapLayer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
    map: { flex: 1 },
    recenterWrap: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'flex-end',
      alignItems: 'flex-end',
      paddingEnd: spacing.gutter,
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
    calloutMeta: { flexDirection: 'row', alignItems: 'center', gap: 3 },

    // Fills the whole map layer (not just the sheet's own height) so the
    // sheets' percentage `maxHeight` has a definite parent height to
    // resolve against — Yoga can't compute a percentage against an
    // auto-sized parent. `box-none` lets taps on the empty area above the
    // sheet still reach the map underneath.
    sheetPositioner: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'flex-end',
    },
  });

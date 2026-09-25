import { Platform } from 'react-native';
import { PROVIDER_GOOGLE } from 'react-native-maps';

// Apple Maps on iOS (no key, no billing), Google Maps on Android (key set in
// app.config.ts from GOOGLE_MAPS_API_KEY) — same split as most production
// Expo apps use react-native-maps with, avoiding a Google Maps key/billing
// requirement on iOS entirely.
export const MAP_PROVIDER = Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined;

// Suppresses Google's own POI pins/labels on Android so our custom category
// pins are the only markers on the map (Apple Maps has no equivalent knob,
// but it also doesn't clutter the map with POI pins by default).
const HIDE_POI = { featureType: 'poi', elementType: 'all', stylers: [{ visibility: 'off' }] };

export const ANDROID_MAP_STYLE_LIGHT = [HIDE_POI];

// Dark basemap for Android (Google Maps only — customMapStyle is a
// react-native-maps/Google-only prop; iOS/Apple Maps gets its dark mode via
// MapView's `userInterfaceStyle` prop instead, set alongside this). Values
// chosen to sit close to the app's dark theme surfaces
// (src/theme/colors.ts's darkColors: background #121016, surface #1E1B26,
// textSecondary #A7A5B3) rather than Google's stock "Night" style, so the
// map doesn't look like a different app from the chrome around it.
export const ANDROID_MAP_STYLE_DARK = [
  HIDE_POI,
  { elementType: 'geometry', stylers: [{ color: '#1A1720' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#A7A5B3' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#121016' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#332F3D' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#292532' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1E1B26' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#332F3D' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#1E1B26' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0D2A38' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#16261C' }] },
];

// Brand-tinted shadow/cluster color used across the map screens, kept out of
// the shared theme so it doesn't change shadows anywhere else in the app.
export const MAP_SHADOW_COLOR = '#241B4E';
export const CLUSTER_COLOR = '#241B4E';

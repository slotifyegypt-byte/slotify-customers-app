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
export const ANDROID_MAP_STYLE = [{ featureType: 'poi', elementType: 'all', stylers: [{ visibility: 'off' }] }];

// Brand-tinted shadow/cluster color used across the map screens, kept out of
// the shared theme so it doesn't change shadows anywhere else in the app.
export const MAP_SHADOW_COLOR = '#241B4E';
export const CLUSTER_COLOR = '#241B4E';

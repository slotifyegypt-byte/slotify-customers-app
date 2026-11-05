import type { ReactNode } from 'react';
import { View, type ViewStyle } from 'react-native';

// Web-only stand-in for react-native-maps (see metro.config.js): a flat panel where the map would be, so
// layouts around it can be seen in a browser. It draws nothing from `children` (markers are native views).
export const PROVIDER_GOOGLE = 'google';

export type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

export function Marker(_props: Record<string, unknown>): ReactNode {
  return null;
}

export default function MapView({
  style,
}: {
  style?: ViewStyle | ViewStyle[];
  children?: ReactNode;
}) {
  return <View style={[{ backgroundColor: '#E7E9EE', flex: 1 }, style]} />;
}

import { StyleSheet, View } from 'react-native';

import { SegmentedControl } from '@/components/SegmentedControl';
import { spacing } from '@/theme';

export type VenueTab = 'services' | 'about' | 'reviews';

const TABS: { key: VenueTab; label: string }[] = [
  { key: 'services', label: 'Services' /* TODO i18n */ },
  { key: 'about', label: 'About' /* TODO i18n */ },
  { key: 'reviews', label: 'Reviews' /* TODO i18n */ },
];

interface VenueTabBarProps {
  active: VenueTab;
  onChange: (tab: VenueTab) => void;
}

export function VenueTabBar({ active, onChange }: VenueTabBarProps) {
  return (
    <View style={styles.wrap}>
      <SegmentedControl options={TABS} value={active} onChange={onChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: spacing.lg, paddingHorizontal: spacing.md },
});

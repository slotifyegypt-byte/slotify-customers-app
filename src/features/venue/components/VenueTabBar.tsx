import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { SegmentedControl } from '@/components/SegmentedControl';
import { spacing } from '@/theme';

export type VenueTab = 'services' | 'about' | 'reviews';

interface VenueTabBarProps {
  active: VenueTab;
  onChange: (tab: VenueTab) => void;
}

export function VenueTabBar({ active, onChange }: VenueTabBarProps) {
  const { t } = useTranslation();
  const tabs: { key: VenueTab; label: string }[] = [
    { key: 'services', label: t('venue.tabServices') },
    { key: 'about', label: t('venue.tabAbout') },
    { key: 'reviews', label: t('venue.tabReviews') },
  ];
  return (
    <View style={styles.wrap}>
      <SegmentedControl options={tabs} value={active} onChange={onChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: spacing.lg, paddingHorizontal: spacing.gutter },
});

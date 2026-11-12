import type { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { I18nManager } from 'react-native';

type IconName = ComponentProps<typeof Ionicons>['name'];

const MIRROR: Partial<Record<IconName, IconName>> = {
  'chevron-back': 'chevron-forward',
  'chevron-forward': 'chevron-back',
  'arrow-back': 'arrow-forward',
  'arrow-forward': 'arrow-back',
  'arrow-back-outline': 'arrow-forward-outline',
  'arrow-forward-outline': 'arrow-back-outline',
  'chevron-back-outline': 'chevron-forward-outline',
  'chevron-forward-outline': 'chevron-back-outline',
};

/** An icon that points along the reading direction: "back" points right in Arabic and left in English. */
export const directional = (name: IconName): IconName => (I18nManager.isRTL ? (MIRROR[name] ?? name) : name);

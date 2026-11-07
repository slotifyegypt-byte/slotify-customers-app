import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Photo } from '@/components/Photo';
import { PressableScale } from '@/components/PressableScale';
import { ThemedText } from '@/components/ThemedText';
import { spacing } from '@/theme';

interface BookAgainCardProps {
  name: string;
  logo?: string | null;
  serviceLabel: string;
  ctaLabel: string;
  onPress: () => void;
  onCtaPress: () => void;
}

/** A place you have been to, with the service you had, and one tap to book it again. */
export function BookAgainCard({
  name,
  logo,
  serviceLabel,
  ctaLabel,
  onPress,
  onCtaPress,
}: BookAgainCardProps) {
  return (
    <Card padding="none" style={styles.card}>
      <PressableScale
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={name}
        scaleTo={0.99}
      >
        <Photo uri={logo} name={name} style={styles.photo} initialSize={32} />
        <View style={styles.text}>
          <ThemedText variant="captionStrong" numberOfLines={1}>
            {name}
          </ThemedText>
          <ThemedText variant="captionSmall" color="textTertiary" numberOfLines={1}>
            {serviceLabel}
          </ThemedText>
        </View>
      </PressableScale>
      <View style={styles.cta}>
        <Button label={ctaLabel} variant="secondary" size="sm" onPress={onCtaPress} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { width: 156, marginEnd: spacing.sm },
  photo: { width: '100%', height: 88 },
  text: { paddingHorizontal: spacing.sm, paddingTop: spacing.sm, gap: 2 },
  cta: { padding: spacing.sm },
});

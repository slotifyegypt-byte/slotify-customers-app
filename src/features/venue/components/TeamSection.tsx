import { Image } from 'expo-image';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { radius, spacing, useColors } from '@/theme';

import type { TeamMember } from '../api/schemas';

interface TeamSectionProps {
  members: TeamMember[];
}

// Small, white-text-safe palette — cycled by a hash of the member's id so
// each avatar fallback gets a stable-but-distinct color instead of every
// member rendering the same brand tint (matches the design's lavender/pink
// per-person avatars).
function avatarColorFor(id: string, palette: readonly string[]) {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  return palette[Math.abs(hash) % palette.length];
}

export function TeamSection({ members }: TeamSectionProps) {
  const colors = useColors();
  const avatarPalette = [colors.brand, colors.accentSecondary, colors.brandAccent, colors.success, colors.warning, colors.danger];

  if (members.length === 0) return null;

  return (
    <View style={styles.container}>
      <ThemedText variant="h3" style={styles.title}>
        Meet the team {/* TODO i18n */}
      </ThemedText>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {members.map((member) => {
          const fullName = [member.first_name, member.last_name].filter(Boolean).join(' ');
          return (
            <View key={member.id} style={styles.member}>
              {member.profile_picture ? (
                <Image source={{ uri: member.profile_picture }} style={styles.avatar} contentFit="cover" />
              ) : (
                <View style={[styles.avatar, styles.avatarFallback, { backgroundColor: avatarColorFor(member.id, avatarPalette) }]}>
                  <ThemedText variant="h3" color="textInverse">
                    {member.first_name.charAt(0).toUpperCase()}
                  </ThemedText>
                </View>
              )}
              <ThemedText variant="bodyMedium" numberOfLines={1} style={styles.name}>
                {fullName}
              </ThemedText>
              {member.role_name ? (
                <ThemedText variant="caption" color="textSecondary" numberOfLines={1}>
                  {member.role_name}
                </ThemedText>
              ) : null}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: spacing.lg, paddingHorizontal: spacing.md },
  title: { marginBottom: spacing.sm },
  member: { width: 88, marginRight: spacing.sm, alignItems: 'center' },
  avatar: { width: 64, height: 64, borderRadius: radius.pill, marginBottom: spacing.xxs },
  avatarFallback: { alignItems: 'center', justifyContent: 'center' },
  name: { textAlign: 'center' },
});

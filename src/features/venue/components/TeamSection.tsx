import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { SectionHeader } from '@/components/SectionHeader';
import { ThemedText } from '@/components/ThemedText';
import { spacing } from '@/theme';

import type { TeamMember } from '../api/schemas';

interface TeamSectionProps {
  members: TeamMember[];
}

/** "Meet the team": tidy round avatars with first name and role, in a row that bleeds to the screen edge. */
export function TeamSection({ members }: TeamSectionProps) {
  const { t } = useTranslation();
  if (members.length === 0) return null;

  return (
    <View>
      <SectionHeader title={t('venue.meetTeam')} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.bleed}
        contentContainerStyle={styles.row}
      >
        {members.map((member) => {
          const fullName = [member.first_name, member.last_name].filter(Boolean).join(' ');
          return (
            <View
              key={member.id}
              style={styles.member}
              accessible
              accessibilityLabel={member.role_name ? `${fullName}, ${member.role_name}` : fullName}
            >
              <Avatar
                uri={member.profile_picture}
                label={member.first_name.charAt(0).toUpperCase()}
                size={64}
              />
              <ThemedText variant="bodyMedium" numberOfLines={1} style={styles.name}>
                {member.first_name}
              </ThemedText>
              {member.role_name ? (
                <ThemedText
                  variant="caption"
                  color="textSecondary"
                  numberOfLines={2}
                  style={styles.name}
                >
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
  bleed: { marginHorizontal: -spacing.gutter },
  row: { paddingHorizontal: spacing.gutter, gap: spacing.md },
  member: { width: 84, alignItems: 'center', gap: 2 },
  name: { textAlign: 'center', alignSelf: 'stretch' },
});

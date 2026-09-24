import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ThemedText } from '@/components/ThemedText';
import { colors, radius, spacing } from '@/theme';

import type { CustomerProfile } from '../api/schemas';
import { useMyProfile, useUpdateMyProfile } from '../hooks/useProfile';

export function EditProfileScreen() {
  const { data: profile, isLoading } = useMyProfile();

  if (isLoading || !profile) {
    return (
      <Screen>
        <ScreenHeader title="Edit Profile" />
        <View style={styles.padded}>
          <ThemedText variant="body" color="textSecondary">
            Loading...
          </ThemedText>
        </View>
      </Screen>
    );
  }

  // Rendered only once `profile` exists, so the form's local state can be
  // initialized straight from it (lazy useState initializer) instead of
  // syncing it in via an effect.
  return <EditProfileForm profile={profile} />;
}

/** "First Last" -> `{ first_name, last_name }`, matching the design's single
 * "Full Name" field to the backend's separate first/last name columns. */
function splitFullName(fullName: string): { first_name: string; last_name: string | null } {
  const trimmed = fullName.trim().replace(/\s+/g, ' ');
  const firstSpace = trimmed.indexOf(' ');
  if (firstSpace === -1) return { first_name: trimmed, last_name: null };
  return { first_name: trimmed.slice(0, firstSpace), last_name: trimmed.slice(firstSpace + 1) };
}

function EditProfileForm({ profile }: { profile: CustomerProfile }) {
  const updateProfile = useUpdateMyProfile();

  const initialFullName = [profile.first_name, profile.last_name].filter(Boolean).join(' ');
  const initialPhone = [profile.phone_country_code, profile.phone_number].filter(Boolean).join(' ').trim();

  const [fullName, setFullName] = useState(initialFullName);
  const [phone, setPhone] = useState(initialPhone);

  const isDirty = useMemo(
    () => fullName.trim() !== initialFullName.trim() || phone.trim() !== initialPhone.trim(),
    [fullName, phone, initialFullName, initialPhone],
  );

  const handleSave = async () => {
    if (!isDirty) return;
    const { first_name, last_name } = splitFullName(fullName);
    if (!first_name) {
      Alert.alert('Full name is required', 'Please enter your name.'); // TODO i18n
      return;
    }

    // A leading "+<country code>" followed by the rest of the number is the
    // only shape this splits — anything else is sent as-is in phone_number
    // so we never silently drop digits the user typed.
    const phoneMatch = phone.trim().match(/^(\+\d{1,4})\s*(.*)$/);
    const phonePayload = phone.trim()
      ? phoneMatch
        ? { phone_country_code: phoneMatch[1], phone_number: phoneMatch[2].replace(/\s+/g, '') }
        : { phone_number: phone.trim().replace(/\s+/g, '') }
      : { phone_country_code: null, phone_number: null };

    try {
      await updateProfile.mutateAsync({
        first_name,
        last_name,
        ...phonePayload,
      });
      router.back();
    } catch {
      Alert.alert('Could not save changes', 'Please check your details and try again.'); // TODO i18n
    }
  };

  return (
    <Screen>
      <ScreenHeader title="Edit Profile" />
      <ScrollView contentContainerStyle={styles.padded}>
        <View style={styles.avatarRow}>
          <Avatar
            uri={profile.profile_picture}
            label={(initialFullName || profile.email || '?').trim().charAt(0).toUpperCase()}
            size={96}
            editable
            onPressEdit={() =>
              Alert.alert('Not available yet', 'Changing your profile photo isn\'t supported yet.') // TODO i18n
            }
          />
        </View>

        <ThemedText variant="caption" color="textSecondary" style={styles.label}>
          FULL NAME
        </ThemedText>
        <TextInput
          value={fullName}
          onChangeText={setFullName}
          placeholder="Full name" // TODO i18n
          placeholderTextColor={colors.textSecondary}
          style={styles.input}
        />

        <ThemedText variant="caption" color="textSecondary" style={styles.label}>
          EMAIL
        </ThemedText>
        <TextInput
          value={profile.email}
          editable={false}
          style={[styles.input, styles.inputDisabled]}
        />

        <ThemedText variant="caption" color="textSecondary" style={styles.label}>
          PHONE
        </ThemedText>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          placeholder="+20 10 0234567" // TODO i18n
          placeholderTextColor={colors.textSecondary}
          style={styles.input}
          keyboardType="phone-pad"
        />
        <ThemedText variant="caption" color="textSecondary" style={styles.note}>
          {/* §11: PUT /customers/me overwrites the phone number directly, no OTP/verification step on this backend. */}
          Changes to your phone number are saved immediately and are not verified.
        </ThemedText>

        <Button
          label="Save Changes" // TODO i18n
          onPress={handleSave}
          disabled={!isDirty}
          loading={updateProfile.isPending}
          style={styles.saveButton}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  padded: { padding: spacing.lg },
  title: { marginBottom: spacing.lg },
  avatarRow: { alignItems: 'center', marginBottom: spacing.lg },
  label: { marginBottom: spacing.xxs, marginTop: spacing.md },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    color: colors.textPrimary,
  },
  inputDisabled: { color: colors.textSecondary, backgroundColor: colors.backgroundMuted },
  note: { marginTop: spacing.sm },
  saveButton: { marginTop: spacing.xl },
});

import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ThemedText } from '@/components/ThemedText';
import { isApiError } from '@/lib/api/errors';
import { radius, spacing, useColors, type Colors } from '@/theme';

import { isE164 } from '../api/profileApi';
import type { CustomerProfile } from '../api/schemas';
import { useMyProfile, useUpdateMyProfile } from '../hooks/useProfile';

export function EditProfileScreen() {
  const colors = useColors();
  const styles = createStyles(colors);
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
  const colors = useColors();
  const styles = createStyles(colors);
  const updateProfile = useUpdateMyProfile();

  const initialFullName = [profile.first_name, profile.last_name].filter(Boolean).join(' ');
  const initialPhone = profile.phone ?? '';

  const [fullName, setFullName] = useState(initialFullName);
  const [phone, setPhone] = useState(initialPhone);
  const [phoneError, setPhoneError] = useState<string | null>(null);

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

    // One E.164 number (+201001234567); empty clears it. Spaces and dashes
    // typed for readability are stripped before validating.
    const phoneValue = phone.replace(/[\s-]+/g, '');
    if (phoneValue && !isE164(phoneValue)) {
      setPhoneError('Enter your number with the country code, e.g. +201001234567.'); // TODO i18n
      return;
    }
    setPhoneError(null);

    try {
      await updateProfile.mutateAsync({
        first_name,
        last_name,
        phone: phoneValue || null,
      });
      router.back();
    } catch (err) {
      if (isApiError(err, 'invalid_field')) {
        setPhoneError('That phone number isn\'t valid. Use the format +201001234567.'); // TODO i18n
        return;
      }
      Alert.alert('Could not save changes', 'Please check your details and try again.'); // TODO i18n
    }
  };

  return (
    <Screen>
      <ScreenHeader title="Edit Profile" />
      <ScrollView contentContainerStyle={styles.padded}>
        <View style={styles.avatarRow}>
          <Avatar
            uri={profile.avatar_url}
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
          value={profile.email ?? ''}
          editable={false}
          style={[styles.input, styles.inputDisabled]}
        />

        <ThemedText variant="caption" color="textSecondary" style={styles.label}>
          PHONE
        </ThemedText>
        <TextInput
          value={phone}
          onChangeText={(text) => {
            setPhone(text);
            if (phoneError) setPhoneError(null);
          }}
          placeholder="+201001234567" // TODO i18n
          placeholderTextColor={colors.textSecondary}
          style={[styles.input, phoneError ? styles.inputError : null]}
          keyboardType="phone-pad"
        />
        {phoneError ? (
          <ThemedText variant="caption" color="danger" style={styles.note}>
            {phoneError}
          </ThemedText>
        ) : null}
        <ThemedText variant="caption" color="textSecondary" style={styles.note}>
          {/* The phone number is overwritten directly, no OTP/verification step on this backend. */}
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

const createStyles = (colors: Colors) =>
  StyleSheet.create({
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
    inputError: { borderColor: colors.danger },
    inputDisabled: { color: colors.textSecondary, backgroundColor: colors.backgroundMuted },
    note: { marginTop: spacing.sm },
    saveButton: { marginTop: spacing.xl },
  });

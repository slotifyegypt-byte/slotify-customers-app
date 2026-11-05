import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Skeleton } from '@/components/Skeleton';
import { TextField } from '@/components/TextField';
import { isApiError } from '@/lib/api/errors';
import { enter, radius, spacing, useColors } from '@/theme';

import { isE164 } from '../api/profileApi';
import type { CustomerProfile } from '../api/schemas';
import { useMyProfile, useUpdateMyProfile } from '../hooks/useProfile';

export function EditProfileScreen() {
  const { t } = useTranslation();
  const { data: profile, isLoading } = useMyProfile();

  if (isLoading || !profile) {
    return (
      <Screen>
        <ScreenHeader title={t('editProfile.title')} />
        <View style={styles.loading}>
          <Skeleton width={96} height={96} radius={48} />
          <View style={styles.loadingCard}>
            <Skeleton height={52} radius={radius.md} />
            <Skeleton height={52} radius={radius.md} />
            <Skeleton height={52} radius={radius.md} />
          </View>
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
  const { t } = useTranslation();
  const colors = useColors();
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
      Alert.alert(t('editProfile.nameRequiredTitle'), t('editProfile.nameRequiredBody'));
      return;
    }

    // One E.164 number (+201001234567); empty clears it. Spaces and dashes
    // typed for readability are stripped before validating.
    const phoneValue = phone.replace(/[\s-]+/g, '');
    if (phoneValue && !isE164(phoneValue)) {
      setPhoneError(t('editProfile.phoneFormat'));
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
        setPhoneError(t('editProfile.phoneInvalid'));
        return;
      }
      Alert.alert(t('editProfile.saveFailedTitle'), t('editProfile.saveFailedBody'));
    }
  };

  return (
    <Screen>
      <ScreenHeader title={t('editProfile.title')} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={enter(0)} style={styles.avatarRow}>
            <Avatar
              uri={profile.avatar_url}
              label={(initialFullName || profile.email || '?').trim().charAt(0).toUpperCase()}
              size={96}
              editable
              onPressEdit={() =>
                Alert.alert(
                  t('editProfile.photoUnavailableTitle'),
                  t('editProfile.photoUnavailableBody'),
                )
              }
            />
          </Animated.View>

          <Animated.View entering={enter(1)}>
            <Card style={styles.form}>
              <TextField
                label={t('editProfile.fullName')}
                value={fullName}
                onChangeText={setFullName}
                placeholder={t('editProfile.fullNamePlaceholder')}
                autoCapitalize="words"
                textContentType="name"
              />
              <TextField
                label={t('editProfile.email')}
                value={profile.email ?? ''}
                editable={false}
                hint={t('editProfile.emailHint')}
                style={{ color: colors.textTertiary }}
              />
              <TextField
                label={t('editProfile.phone')}
                value={phone}
                onChangeText={(text) => {
                  setPhone(text);
                  if (phoneError) setPhoneError(null);
                }}
                placeholder="+201001234567"
                keyboardType="phone-pad"
                textContentType="telephoneNumber"
                error={phoneError}
                hint={t('editProfile.phoneHint')}
              />
            </Card>
          </Animated.View>
        </ScrollView>

        <View
          style={[styles.bar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}
        >
          <Button
            label={t('editProfile.save')}
            onPress={handleSave}
            disabled={!isDirty}
            loading={updateProfile.isPending}
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  avatarRow: { alignItems: 'center', paddingVertical: spacing.xs },
  form: { gap: spacing.md },
  loading: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.sm,
    gap: spacing.lg,
    alignItems: 'center',
  },
  loadingCard: { alignSelf: 'stretch', gap: spacing.md },
  bar: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth * 2,
  },
});

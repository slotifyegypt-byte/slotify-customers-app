import { useQueryClient } from '@tanstack/react-query';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { ListRow } from '@/components/ListRow';
import { PressableScale } from '@/components/PressableScale';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { useLogout } from '@/features/auth/hooks/useLogout';
import { useFavourites } from '@/features/favourites/hooks/useFavourites';
import { openLegalUrl } from '@/lib/legal';
import { useThemePreferenceStore } from '@/lib/theme/themePreferenceStore';
import { enter, spacing } from '@/theme';

import { deleteMe } from '../api/profileApi';
import { SettingsGroup } from '../components/SettingsGroup';
import { useMyProfile } from '../hooks/useProfile';

// The account hub: who you are, then settings in labelled groups, then the quiet account actions.
export function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const { data: profile } = useMyProfile();
  const favourites = useFavourites();
  const logout = useLogout();
  const queryClient = useQueryClient();
  const themePreference = useThemePreferenceStore((state) => state.preference);
  const [logoutConfirmVisible, setLogoutConfirmVisible] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const displayName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ');
  const initials = (displayName || profile?.email || '?').trim().charAt(0).toUpperCase();
  const appVersion = Constants.expoConfig?.version ?? '1.0.0';
  const favouritesCount = favourites.data?.length;
  const languageLabel = i18n.language === 'ar' ? 'العربية' : 'English';

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
      setLogoutConfirmVisible(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await deleteMe();
      queryClient.clear();
      await logout();
    } catch {
      Alert.alert(t('profile.deleteFailedTitle'), t('profile.deleteFailedBody'));
    } finally {
      setDeleting(false);
      setDeleteConfirmVisible(false);
    }
  };

  return (
    <Screen edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={enter(0)} style={styles.identity}>
          <Avatar uri={profile?.avatar_url} label={initials} size={96} />
          <View style={styles.identityText}>
            <ThemedText variant="h2" style={styles.center} numberOfLines={2}>
              {displayName || t('profile.addYourName')}
            </ThemedText>
            {(profile?.email ?? profile?.phone) ? (
              <ThemedText
                variant="body"
                color="textSecondary"
                style={styles.center}
                numberOfLines={1}
              >
                {profile?.email ?? profile?.phone}
              </ThemedText>
            ) : null}
          </View>
          <Button
            label={t('profile.editProfile')}
            variant="secondary"
            size="sm"
            icon="create-outline"
            fullWidth={false}
            onPress={() => router.push('/(tabs)/profile/edit')}
          />
        </Animated.View>

        <Animated.View entering={enter(1)}>
          <SettingsGroup title={t('profile.groupActivity')}>
            <ListRow
              title={t('profile.favourites')}
              icon="heart-outline"
              iconTone="danger"
              value={favouritesCount !== undefined ? String(favouritesCount) : undefined}
              onPress={() => router.push('/(tabs)/profile/favourites')}
            />
            <ListRow
              title={t('profile.myReviews')}
              icon="star-outline"
              iconTone="warning"
              onPress={() => router.push('/(tabs)/profile/my-reviews')}
            />
          </SettingsGroup>
        </Animated.View>

        <Animated.View entering={enter(2)}>
          <SettingsGroup title={t('profile.groupPreferences')}>
            <ListRow
              title={t('notificationSettings.title')}
              icon="notifications-outline"
              iconTone="brand"
              onPress={() => router.push('/(tabs)/profile/notification-settings')}
            />
            <ListRow
              title={t('language.title')}
              icon="globe-outline"
              iconTone="brand"
              value={languageLabel}
              onPress={() => router.push('/(tabs)/profile/language')}
            />
            <ListRow
              title={t('appearance.title')}
              icon="contrast-outline"
              iconTone="neutral"
              value={t(`appearance.${themePreference}`)}
              onPress={() => router.push('/(tabs)/profile/appearance')}
            />
          </SettingsGroup>
        </Animated.View>

        <Animated.View entering={enter(3)}>
          <SettingsGroup title={t('profile.groupSupport')}>
            <ListRow
              title={t('helpFaq.title')}
              icon="help-circle-outline"
              iconTone="success"
              onPress={() => router.push('/(tabs)/profile/help')}
            />
            <ListRow
              title={t('contactUs.title')}
              icon="chatbubble-ellipses-outline"
              iconTone="success"
              onPress={() => router.push('/(tabs)/profile/contact')}
            />
            <ListRow
              title={t('profile.privacyPolicy')}
              icon="shield-checkmark-outline"
              iconTone="neutral"
              onPress={() => openLegalUrl('privacy')}
            />
            <ListRow
              title={t('profile.termsOfService')}
              icon="document-text-outline"
              iconTone="neutral"
              onPress={() => openLegalUrl('terms')}
            />
          </SettingsGroup>
        </Animated.View>

        <Animated.View entering={enter(4)} style={styles.footer}>
          <Button
            label={t('profile.logOut')}
            variant="ghost"
            icon="log-out-outline"
            onPress={() => setLogoutConfirmVisible(true)}
          />
          <PressableScale
            onPress={() => setDeleteConfirmVisible(true)}
            accessibilityRole="button"
            accessibilityLabel={t('profile.deleteAccount')}
            scaleTo={0.97}
            style={styles.deleteAccount}
          >
            <ThemedText variant="bodyMedium" color="danger">
              {t('profile.deleteAccount')}
            </ThemedText>
          </PressableScale>
          <ThemedText variant="caption" color="textTertiary" style={styles.center}>
            {t('profile.version', { version: appVersion })}
          </ThemedText>
        </Animated.View>
      </ScrollView>

      <ConfirmDialog
        visible={logoutConfirmVisible}
        title={t('profile.logOutTitle')}
        primaryLabel={t('common.cancel')}
        onPrimary={() => setLogoutConfirmVisible(false)}
        secondaryLabel={t('profile.logOut')}
        onSecondary={handleLogout}
        secondaryLoading={loggingOut}
      />
      <ConfirmDialog
        visible={deleteConfirmVisible}
        title={t('profile.deleteAccount')}
        body={t('profile.deleteBody')}
        primaryLabel={t('common.cancel')}
        onPrimary={() => setDeleteConfirmVisible(false)}
        secondaryLabel={t('profile.delete')}
        onSecondary={handleDeleteAccount}
        secondaryTone="danger"
        secondaryLoading={deleting}
        linkLabel={t('profile.deleteLearnMore')}
        onLinkPress={() => openLegalUrl('deleteAccount')}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.lg,
    paddingBottom: 120,
    gap: 28,
  },
  identity: { alignItems: 'center', gap: spacing.sm },
  identityText: { alignItems: 'center', gap: 2, alignSelf: 'stretch' },
  center: { textAlign: 'center' },
  footer: { gap: spacing.xs, alignItems: 'stretch' },
  deleteAccount: {
    alignSelf: 'center',
    minHeight: 44,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
  },
});

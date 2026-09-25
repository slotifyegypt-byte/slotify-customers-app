import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { useLogout } from '@/features/auth/hooks/useLogout';
import { useFavourites } from '@/features/favourites/hooks/useFavourites';
import { radius, spacing, useColors, type Colors } from '@/theme';

import { deleteMe } from '../api/profileApi';
import { useMyProfile } from '../hooks/useProfile';

interface ProfileRowConfig {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  iconColor: string;
  onPress: () => void;
  trailingText?: string;
}

// TODO i18n — every label below
function buildRowGroups(favouritesCount: number | undefined, colors: Colors): ProfileRowConfig[][] {
  return [
  [
    {
      key: 'favourites',
      label: 'Favourites',
      icon: 'heart',
      iconBg: 'rgba(226, 74, 74, 0.12)',
      iconColor: colors.danger,
      onPress: () => router.push('/(tabs)/profile/favourites'),
      trailingText: favouritesCount !== undefined ? String(favouritesCount) : undefined,
    },
    {
      key: 'reviews',
      label: 'My Reviews',
      icon: 'star',
      iconBg: 'rgba(224, 167, 45, 0.15)',
      iconColor: colors.warning,
      onPress: () => router.push('/(tabs)/profile/my-reviews'),
    },
  ],
  [
    {
      key: 'notifications',
      label: 'Notification Settings',
      icon: 'notifications',
      iconBg: 'rgba(124, 111, 240, 0.12)',
      iconColor: colors.brandAccent,
      onPress: () => router.push('/(tabs)/profile/notification-settings'),
    },
    {
      key: 'language',
      label: 'Language',
      icon: 'globe',
      iconBg: 'rgba(124, 111, 240, 0.24)',
      iconColor: colors.brandAccent,
      onPress: () => router.push('/(tabs)/profile/language'),
    },
    {
      key: 'appearance',
      label: 'Appearance',
      icon: 'contrast',
      iconBg: 'rgba(58, 36, 107, 0.12)',
      iconColor: colors.brand,
      onPress: () => router.push('/(tabs)/profile/appearance'),
    },
  ],
  [
    {
      key: 'help',
      label: 'Help & FAQ',
      icon: 'help-circle',
      iconBg: 'rgba(47, 175, 99, 0.15)',
      iconColor: colors.success,
      onPress: () => router.push('/(tabs)/profile/help'),
    },
    {
      key: 'contact',
      label: 'Contact Us',
      icon: 'chatbubble-ellipses',
      iconBg: 'rgba(226, 74, 74, 0.10)',
      iconColor: colors.danger,
      onPress: () => router.push('/(tabs)/profile/contact'),
    },
  ],
  ];
}

function ProfileRow({
  label,
  icon,
  iconBg,
  iconColor,
  onPress,
  trailingText,
  isLast,
}: Omit<ProfileRowConfig, 'key'> & { isLast: boolean }) {
  const colors = useColors();
  const styles = createStyles(colors);
  return (
    <Pressable style={[styles.row, isLast && styles.rowLast]} onPress={onPress} accessibilityRole="button">
      <View style={[styles.iconWell, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <ThemedText variant="bodyMedium" color="textPrimary" style={styles.rowLabel}>
        {label}
      </ThemedText>
      {trailingText ? (
        <ThemedText variant="body" color="textSecondary" style={styles.trailingText}>
          {trailingText}
        </ThemedText>
      ) : null}
      <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
    </Pressable>
  );
}

export function ProfileScreen() {
  const colors = useColors();
  const styles = createStyles(colors);
  const { data: profile } = useMyProfile();
  const favourites = useFavourites();
  const logout = useLogout();
  const queryClient = useQueryClient();
  const [logoutConfirmVisible, setLogoutConfirmVisible] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const rowGroups = buildRowGroups(favourites.data?.length, colors);

  const displayName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ');
  const initials = (displayName || profile?.email || '?').trim().charAt(0).toUpperCase();
  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
      setLogoutConfirmVisible(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete account', // TODO i18n
      'This permanently deletes your account and can\'t be undone. Are you sure?', // TODO i18n
      [
        { text: 'Cancel', style: 'cancel' }, // TODO i18n
        {
          text: 'Delete', // TODO i18n
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMe();
              queryClient.clear();
              await logout();
            } catch {
              Alert.alert('Something went wrong', 'Could not delete your account. Please try again.'); // TODO i18n
            }
          },
        },
      ],
    );
  };

  return (
    <Screen edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable
          style={styles.header}
          onPress={() => router.push('/(tabs)/profile/edit')}
          accessibilityRole="button"
          accessibilityLabel="Edit profile" // TODO i18n
        >
          <Avatar uri={profile?.profile_picture} label={initials} size={64} />
          <View style={styles.headerText}>
            <ThemedText variant="h3">{displayName || 'Add your name'}</ThemedText>
            <ThemedText variant="body" color="textSecondary">
              {profile?.email ?? profile?.phone_number ?? ''}
            </ThemedText>
          </View>
        </Pressable>

        {rowGroups.map((rows, groupIndex) => (
          <View key={groupIndex} style={styles.section}>
            {rows.map(({ key, ...row }, index) => (
              <ProfileRow key={key} {...row} isLast={index === rows.length - 1} />
            ))}
          </View>
        ))}

        <Button
          label="Log Out" // TODO i18n
          variant="ghost"
          onPress={() => setLogoutConfirmVisible(true)}
          style={styles.logOut}
        />
        <Pressable onPress={handleDeleteAccount} accessibilityRole="button" style={styles.deleteAccount}>
          <ThemedText variant="bodyMedium" color="danger" style={styles.deleteAccountText}>
            Delete Account
          </ThemedText>
        </Pressable>
        <ThemedText variant="caption" color="textSecondary" style={styles.version}>
          {`Slotify v${appVersion}`}
        </ThemedText>
      </ScrollView>

      <ConfirmDialog
        visible={logoutConfirmVisible}
        title="Log out of Slotify?" // TODO i18n
        primaryLabel="Cancel" // TODO i18n
        onPrimary={() => setLogoutConfirmVisible(false)}
        secondaryLabel="Log Out" // TODO i18n
        onSecondary={handleLogout}
        secondaryLoading={loggingOut}
      />
    </Screen>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    content: { padding: spacing.md, paddingBottom: spacing.xxl },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg, paddingHorizontal: spacing.xs },
    headerText: { marginLeft: spacing.md, flexShrink: 1 },
    section: {
      borderRadius: radius.lg,
      backgroundColor: colors.surface,
      overflow: 'hidden',
      marginBottom: spacing.md,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
      gap: spacing.sm,
    },
    rowLast: { borderBottomWidth: 0 },
    iconWell: {
      width: 32,
      height: 32,
      borderRadius: radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
    },
    rowLabel: { flex: 1 },
    trailingText: { marginRight: spacing.xxs },
    logOut: { marginTop: spacing.sm },
    deleteAccount: { alignSelf: 'center', marginTop: spacing.md, padding: spacing.xxs },
    deleteAccountText: { textDecorationLine: 'underline' },
    version: { alignSelf: 'center', marginTop: spacing.sm },
  });

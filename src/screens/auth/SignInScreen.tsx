import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { colors, radius, shadows } from '@/theme';
import { useAuthStore } from '@/store/authStore';
import { exchangeGoogleToken } from '@/api/endpoints';

WebBrowser.maybeCompleteAuthSession();

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:8000/api/v1';

const LOGO = require('../../../Assets/Icon Logo (1).png');

function parseCode(url: string): string | null {
  const match = url.match(/[?&]code=([^&#]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export default function SignInScreen() {
  const setTokens = useAuthStore((s) => s.setTokens);
  const [loading, setLoading] = useState(false);

  const redirectUri = makeRedirectUri({ scheme: 'slotify', path: 'auth/callback' });

  async function handleGoogleSignIn() {
    if (loading) return;
    setLoading(true);
    try {
      const result = await WebBrowser.openAuthSessionAsync(
        `${BASE_URL}/customers/auth/google`,
        redirectUri,
      );

      if (result.type !== 'success') {
        // User cancelled — silent exit
        return;
      }

      const code = parseCode(result.url);
      if (!code) {
        Alert.alert('Sign In Failed', 'No authentication code received from Google.');
        return;
      }

      const tokens = await exchangeGoogleToken({ code });
      setTokens(tokens.access_token, tokens.refresh_token);
      // Navigation is automatic — authStore change re-renders RootNavigator
    } catch (e: unknown) {
      const msg = (e as any)?.response?.data?.detail ?? 'Sign in failed. Please try again.';
      Alert.alert('Sign In Failed', msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={s.root}>
      {/* ── Logo + tagline ── */}
      <View style={s.logoSection}>
        <Image source={LOGO} style={s.logoImage} resizeMode="contain" />
        <Text style={s.appName}>Slotify</Text>
        <Text style={s.tagline}>Book barbers, spas, and more near you</Text>
      </View>

      <View style={s.spacer} />

      {/* ── Auth buttons ── */}
      <View style={s.buttonsSection}>

        {/* Apple — no backend, visually disabled */}
        <Pressable style={[s.appleBtn, s.dimmed]} disabled>
          <AppleLogo />
          <Text style={s.appleBtnLabel}>Continue with Apple</Text>
        </Pressable>

        {/* Google — active */}
        <Pressable
          style={[s.googleBtn, loading && s.dimmed]}
          disabled={loading}
          onPress={handleGoogleSignIn}
        >
          {loading ? (
            <ActivityIndicator color={colors.ink} size="small" />
          ) : (
            <>
              <GoogleLogo />
              <Text style={s.googleBtnLabel}>Continue with Google</Text>
            </>
          )}
        </Pressable>

        {/* OR divider */}
        <View style={s.dividerRow}>
          <View style={s.dividerLine} />
          <Text style={s.dividerLabel}>or</Text>
          <View style={s.dividerLine} />
        </View>

        {/* Phone row — OTP backend not yet implemented, coming soon */}
        <View style={[s.phoneRow, s.dimmed]} pointerEvents="none">
          <View style={s.countryBox}>
            <Text style={s.countryCode}>EG +20</Text>
            <ChevronDown />
          </View>
          <View style={s.phoneDivider} />
          <Text style={s.phonePlaceholder}>10 123 4567</Text>
        </View>

        <Pressable style={[s.phoneBtn, s.dimmed]} disabled>
          <Text style={s.phoneBtnLabel}>Continue with Phone</Text>
        </Pressable>
      </View>

      {/* ── Terms — email link omitted per product direction ── */}
      <Text style={s.terms}>
        {'By continuing, you agree to our '}
        <Text style={s.termsLink}>Terms</Text>
        {' & '}
        <Text style={s.termsLink}>Privacy Policy</Text>
      </Text>
    </SafeAreaView>
  );
}

// ── Inline SVG icons ──────────────────────────────────────────────────────────

function AppleLogo() {
  return (
    <Svg width={17} height={17} viewBox="0 0 24 24">
      <Path
        fill="#fff"
        d="M16.365 1.43c0 1.14-.47 2.11-1.24 2.86-.83.83-2.02 1.44-3.05 1.36-.13-1.1.43-2.24 1.19-2.98.83-.82 2.24-1.42 3.1-1.24zM20.7 17.2c-.5 1.15-.74 1.66-1.38 2.68-.9 1.43-2.16 3.21-3.73 3.22-1.4.02-1.76-.9-3.66-.9-1.9 0-2.3.88-3.69.92-1.5.05-2.65-1.55-3.55-2.97C2.7 17.02 1.3 12.4 3.2 9.28c.94-1.55 2.63-2.53 4.46-2.56 1.44-.02 2.8.97 3.68.97.87 0 2.53-1.2 4.27-1.02.73.03 2.77.29 4.09 2.2-.1.07-2.44 1.42-2.41 4.24.03 3.37 2.96 4.5 3 4.5-.03.1-.47 1.6-1.59 3.09z"
      />
    </Svg>
  );
}

function GoogleLogo() {
  return (
    <Svg width={17} height={17} viewBox="0 0 48 48">
      <Path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.8 0 5.3 1 7.3 2.7l6-6C33.9 6.5 29.2 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.4-.3-3.5z" />
      <Path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 18.9 13 24 13c2.8 0 5.3 1 7.3 2.7l6-6C33.9 6.5 29.2 4.5 24 4.5c-7.7 0-14.4 4.4-17.7 10.2z" />
      <Path fill="#4CAF50" d="M24 43.5c5.1 0 9.8-2 13.2-5.1l-6.1-5.2C29.2 34.7 26.7 35.5 24 35.5c-5.3 0-9.7-3.4-11.3-8.1l-6.5 5C9.2 39 16 43.5 24 43.5z" />
      <Path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.6l6.1 5.2C40.5 36 43.5 30.6 43.5 24c0-1.2-.1-2.4-.3-3.5z" />
    </Svg>
  );
}

function ChevronDown() {
  return (
    <Svg width={10} height={6} viewBox="0 0 10 6">
      <Path
        d="M1 1l4 4 4-4"
        stroke={colors.textMuted}
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.canvas,
    paddingHorizontal: 28,
    paddingBottom: 36,
  },
  logoSection: {
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
  },
  logoImage: {
    width: 60,
    height: 60,
    borderRadius: radius.lg,
  },
  appName: {
    fontSize: 23,
    fontFamily: 'PlusJakartaSans-Bold',
    color: colors.ink,
    letterSpacing: -0.23,
  },
  tagline: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans-Regular',
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 230,
    lineHeight: 19.5,
  },
  spacer: {
    flex: 1,
  },
  buttonsSection: {
    gap: 12,
  },
  appleBtn: {
    height: 52,
    borderRadius: radius.full,
    backgroundColor: '#000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  appleBtnLabel: {
    fontSize: 15,
    fontFamily: 'PlusJakartaSans-SemiBold',
    color: '#fff',
  },
  googleBtn: {
    height: 52,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 0.5,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    ...shadows.sm,
  },
  googleBtnLabel: {
    fontSize: 15,
    fontFamily: 'PlusJakartaSans-SemiBold',
    color: colors.ink,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerLabel: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans-Regular',
    color: colors.textMuted,
  },
  phoneRow: {
    height: 52,
    borderRadius: radius.md,
    borderWidth: 0.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  countryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 18,
    gap: 6,
    height: '100%',
  },
  countryCode: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans-Regular',
    color: colors.ink,
  },
  phoneDivider: {
    width: 0.5,
    height: '100%',
    backgroundColor: colors.border,
  },
  phonePlaceholder: {
    flex: 1,
    paddingHorizontal: 16,
    fontSize: 14,
    fontFamily: 'PlusJakartaSans-Regular',
    color: '#B4AFC7',
  },
  phoneBtn: {
    height: 52,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneBtnLabel: {
    fontSize: 15,
    fontFamily: 'PlusJakartaSans-SemiBold',
    color: colors.brand,
  },
  dimmed: {
    opacity: 0.4,
  },
  terms: {
    fontSize: 11,
    fontFamily: 'PlusJakartaSans-Regular',
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 17.6,
    marginTop: 22,
  },
  termsLink: {
    color: colors.brand,
    textDecorationLine: 'underline',
  },
});

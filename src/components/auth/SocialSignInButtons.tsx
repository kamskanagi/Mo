import { useEffect, useCallback } from 'react';
import { View, Text, Pressable, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useTheme } from '../../theme';
import { spacing, radius } from '../../theme/spacing';
import { fontSize, fontWeight } from '../../theme/typography';
import { useAuthStore } from '../../stores/useAuthStore';
import { storage } from '../../services/auth';
import { GOOGLE_IOS_CLIENT_ID, GOOGLE_ANDROID_CLIENT_ID, GOOGLE_WEB_CLIENT_ID } from '../../config/oauth';

WebBrowser.maybeCompleteAuthSession();

interface Props {
  onSuccess: () => void;
}

export function SocialSignInButtons({ onSuccess }: Props) {
  const { colors } = useTheme();
  const { socialLogin, isLoading, clearError } = useAuthStore();

  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    webClientId: GOOGLE_WEB_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type !== 'success') return;
    const { access_token } = response.params;
    (async () => {
      try {
        const res = await fetch('https://www.googleapis.com/userinfo/v2/me', {
          headers: { Authorization: `Bearer ${access_token}` },
        });
        const user = await res.json();
        const ok = await socialLogin('google', user.id, user.email, user.name ?? user.email);
        if (ok) onSuccess();
      } catch {
        // error already set in store
      }
    })();
  }, [response]);

  const handleGoogleSignIn = useCallback(() => {
    clearError();
    promptAsync();
  }, [promptAsync, clearError]);

  const handleAppleSignIn = useCallback(async () => {
    clearError();
    try {
      const AppleAuthentication = await import('expo-apple-authentication');
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      const appleUserId = credential.user;
      const nameKey = `apple_name_${appleUserId}`;

      // Apple only sends name on first sign-in — cache it
      let displayName = '';
      if (credential.fullName?.givenName) {
        displayName = [credential.fullName.givenName, credential.fullName.familyName]
          .filter(Boolean)
          .join(' ');
        await storage.set(nameKey, displayName);
      } else {
        displayName = (await storage.get(nameKey)) ?? 'Apple User';
      }

      const email = credential.email ?? `${appleUserId}@privaterelay.appleid.com`;
      const ok = await socialLogin('apple', appleUserId, email, displayName);
      if (ok) onSuccess();
    } catch (e: any) {
      if (e?.code !== 'ERR_REQUEST_CANCELED') {
        useAuthStore.setState({ error: 'Apple sign-in failed. Please try again.' });
      }
    }
  }, [clearError, onSuccess, socialLogin]);

  return (
    <View style={styles.container}>
      {/* Divider */}
      <View style={styles.divider}>
        <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
        <Text style={[styles.dividerText, { color: colors.textMuted }]}>or</Text>
        <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
      </View>

      {/* Apple Sign In — iOS only */}
      {Platform.OS === 'ios' && (
        <Pressable
          style={({ pressed }) => [
            styles.socialBtn,
            styles.appleBtn,
            { opacity: pressed || isLoading ? 0.7 : 1 },
          ]}
          onPress={handleAppleSignIn}
          disabled={isLoading}
          accessibilityLabel="Continue with Apple"
        >
          <Text style={styles.appleBtnText}>  Continue with Apple</Text>
        </Pressable>
      )}

      {/* Google Sign In */}
      <Pressable
        style={({ pressed }) => [
          styles.socialBtn,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            opacity: pressed || isLoading || !request ? 0.7 : 1,
          },
        ]}
        onPress={handleGoogleSignIn}
        disabled={isLoading || !request}
        accessibilityLabel="Continue with Google"
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={colors.textSecondary} />
        ) : (
          <Text style={[styles.googleBtnText, { color: colors.text }]}>
            <Text style={styles.googleG}>G</Text>  Continue with Google
          </Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm, marginTop: spacing.lg },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginVertical: spacing.xs,
  },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: fontSize.caption },
  socialBtn: {
    height: 48,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  appleBtn: { backgroundColor: '#000000', borderColor: '#000000' },
  appleBtnText: { color: '#FFFFFF', fontSize: fontSize.body, fontWeight: fontWeight.semibold },
  googleBtnText: { fontSize: fontSize.body, fontWeight: fontWeight.semibold },
  googleG: { fontWeight: fontWeight.black },
});

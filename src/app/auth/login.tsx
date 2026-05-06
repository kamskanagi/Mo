import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  StyleSheet,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../theme';
import { useAuthStore } from '../../stores/useAuthStore';
import { Button } from '../../components/ui/Button';
import { SocialSignInButtons } from '../../components/auth/SocialSignInButtons';
import { spacing, radius } from '../../theme/spacing';
import { fontSize, fontWeight } from '../../theme/typography';

export default function LoginScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLocalError(null);
    clearError();

    if (!email.includes('@') || !email.includes('.')) {
      setLocalError('Please enter a valid email address.');
      return;
    }
    if (password.length === 0) {
      setLocalError('Please enter your password.');
      return;
    }

    const ok = await login(email, password);
    if (ok) router.replace('/(tabs)/learn');
  };

  const displayError = localError || error;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={[styles.logo, { color: colors.text }]}>墨</Text>
            <Text style={[styles.appName, { color: colors.textSecondary }]}>Mò</Text>
            <Text style={[styles.tagline, { color: colors.textMuted }]}>
              Learn Chinese Characters
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={[styles.formTitle, { color: colors.text }]}>Sign in</Text>

            {displayError && (
              <View
                style={[
                  styles.errorBanner,
                  { backgroundColor: colors.redSoft, borderRadius: radius.md },
                ]}
              >
                <Text style={[styles.errorText, { color: colors.error }]}>
                  {displayError}
                </Text>
              </View>
            )}

            <Text style={[styles.label, { color: colors.textSecondary }]}>Email</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />

            <Text style={[styles.label, { color: colors.textSecondary }]}>Password</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              value={password}
              onChangeText={setPassword}
              placeholder="Your password"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="password"
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />

            <Button
              label="Sign In"
              onPress={handleLogin}
              variant="primary"
              fullWidth
              loading={isLoading}
              style={styles.button}
            />

            <SocialSignInButtons onSuccess={() => router.replace('/(tabs)/learn')} />
          </View>

          <Pressable onPress={() => router.push('/auth/signup')} style={styles.switchLink}>
            <Text style={[styles.switchText, { color: colors.textSecondary }]}>
              Don&apos;t have an account?{' '}
              <Text style={{ color: colors.teal, fontWeight: fontWeight.semibold }}>
                Sign Up
              </Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.mega,
    paddingBottom: spacing.xxxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.huge,
  },
  logo: {
    fontSize: 72,
    fontWeight: fontWeight.black,
    lineHeight: 80,
  },
  appName: {
    fontSize: fontSize.heading,
    fontWeight: fontWeight.semibold,
    letterSpacing: 3,
    marginTop: spacing.xs,
  },
  tagline: {
    fontSize: fontSize.caption,
    letterSpacing: 1,
    marginTop: spacing.xs,
  },
  form: {
    gap: spacing.sm,
  },
  formTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.md,
  },
  errorBanner: {
    padding: spacing.base,
    marginBottom: spacing.sm,
  },
  errorText: {
    fontSize: fontSize.body,
  },
  label: {
    fontSize: fontSize.caption,
    fontWeight: fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.base,
    fontSize: fontSize.body,
  },
  button: {
    marginTop: spacing.lg,
  },
  switchLink: {
    alignItems: 'center',
    marginTop: spacing.xxxl,
  },
  switchText: {
    fontSize: fontSize.body,
  },
});

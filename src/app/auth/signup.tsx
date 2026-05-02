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
import { spacing, radius } from '../../theme/spacing';
import { fontSize, fontWeight } from '../../theme/typography';

export default function SignupScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { signup, isLoading, error, clearError } = useAuthStore();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSignup = async () => {
    setLocalError(null);
    clearError();

    if (displayName.trim().length === 0) {
      setLocalError('Please enter your name.');
      return;
    }
    if (!email.includes('@') || !email.includes('.')) {
      setLocalError('Please enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }

    const ok = await signup(displayName, email, password);
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
          <View style={styles.form}>
            <Text style={[styles.formTitle, { color: colors.text }]}>Create account</Text>
            <Text style={[styles.formSubtitle, { color: colors.textSecondary }]}>
              Start your journey with Mò
            </Text>

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

            <Text style={[styles.label, { color: colors.textSecondary }]}>Name</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Your name"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="next"
            />

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
              placeholder="At least 8 characters"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="newPassword"
              returnKeyType="next"
            />

            <Text style={[styles.label, { color: colors.textSecondary }]}>
              Confirm Password
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Repeat your password"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="newPassword"
              returnKeyType="done"
              onSubmitEditing={handleSignup}
            />

            <Button
              label="Create Account"
              onPress={handleSignup}
              variant="primary"
              fullWidth
              loading={isLoading}
              style={styles.button}
            />
          </View>

          <Pressable onPress={() => router.push('/auth/login')} style={styles.switchLink}>
            <Text style={[styles.switchText, { color: colors.textSecondary }]}>
              Already have an account?{' '}
              <Text style={{ color: colors.teal, fontWeight: fontWeight.semibold }}>
                Log In
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
    paddingTop: spacing.huge,
    paddingBottom: spacing.xxxl,
  },
  form: {
    gap: spacing.sm,
  },
  formTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xs,
  },
  formSubtitle: {
    fontSize: fontSize.body,
    marginBottom: spacing.lg,
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

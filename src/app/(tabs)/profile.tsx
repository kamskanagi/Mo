import { View, ScrollView, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../theme';
import { useAuthStore } from '../../stores/useAuthStore';
import { Button } from '../../components/ui/Button';
import { spacing, radius } from '../../theme/spacing';
import { fontSize, fontWeight } from '../../theme/typography';

export default function ProfileScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.replace('/auth/login');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Profile</Text>

        {user && (
          <View
            style={[
              styles.userCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: radius.xl,
              },
            ]}
          >
            <View
              style={[styles.avatar, { backgroundColor: colors.tealSoft, borderRadius: radius.full }]}
            >
              <Text style={[styles.avatarText, { color: colors.teal }]}>
                {user.displayName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={[styles.displayName, { color: colors.text }]}>
              {user.displayName}
            </Text>
            <Text style={[styles.email, { color: colors.textSecondary }]}>
              {user.email}
            </Text>
          </View>
        )}

        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Progress and settings coming soon
        </Text>

        <View style={styles.logoutSection}>
          <Button label="Sign Out" onPress={handleLogout} variant="secondary" fullWidth />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    gap: spacing.xl,
  },
  title: {
    fontSize: fontSize.heading,
    fontWeight: fontWeight.black,
  },
  userCard: {
    padding: spacing.xxl,
    borderWidth: 1,
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatar: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  avatarText: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
  },
  displayName: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
  },
  email: {
    fontSize: fontSize.body,
  },
  subtitle: {
    fontSize: fontSize.body,
  },
  logoutSection: {
    marginTop: spacing.xl,
  },
});

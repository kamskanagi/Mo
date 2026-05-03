import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAppStore } from '../stores/useAppStore';
import { useAuthStore } from '../stores/useAuthStore';
import { fontSize, fontWeight } from '../theme/typography';

export default function RootLayout() {
  const { initialize, isLoading, isOnboarded } = useAppStore();
  const { restoreSession, isAuthenticated, isLoading: authIsLoading } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const boot = async () => {
      await initialize();
      await restoreSession();
    };
    boot();
  }, []);

  useEffect(() => {
    if (isLoading || authIsLoading) return;

    const inAuth = segments[0] === 'auth';
    const inOnboarding = segments[0] === 'onboarding';

    if (!isAuthenticated && !inAuth) {
      router.replace('/auth/login');
      return;
    }

    if (isAuthenticated && !isOnboarded && !inOnboarding) {
      router.replace('/onboarding');
      return;
    }

    if (isAuthenticated && isOnboarded && (inAuth || inOnboarding)) {
      router.replace('/(tabs)/learn');
    }
  }, [isLoading, authIsLoading, isAuthenticated, isOnboarded, segments]);

  if (isLoading || authIsLoading) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={styles.splash}>
          <Text style={styles.splashChar}>墨</Text>
          <Text style={styles.splashName}>Mò</Text>
        </View>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Slot />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: '#1C1917',
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashChar: {
    fontSize: fontSize.charHero,
    color: '#FFFFFF',
    fontWeight: fontWeight.black,
  },
  splashName: {
    fontSize: fontSize.heading,
    color: '#A8A29E',
    marginTop: 12,
    letterSpacing: 2,
  },
});

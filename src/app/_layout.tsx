import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAppStore } from '../stores/useAppStore';
import { fontSize, fontWeight } from '../theme/typography';

export default function RootLayout() {
  const { initialize, isLoading, isOnboarded } = useAppStore();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (isLoading) return;
    const inOnboarding = segments[0] === 'onboarding';
    if (!isOnboarded && !inOnboarding) {
      router.replace('/onboarding');
    } else if (isOnboarded && inOnboarding) {
      router.replace('/(tabs)/learn');
    }
  }, [isLoading, isOnboarded, segments]);

  if (isLoading) {
    return (
      <View style={styles.splash}>
        <Text style={styles.splashChar}>墨</Text>
        <Text style={styles.splashName}>Mò</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <Slot />
    </SafeAreaProvider>
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

// src/app/(tabs)/write.tsx
import { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';
import { spacing } from '../../theme/spacing';
import { fontSize, fontWeight } from '../../theme/typography';
import { useAppStore } from '../../stores/useAppStore';
import { useProgressStore } from '../../stores/useProgressStore';
import { getCharactersByWeek } from '../../db/queries';
import { HanziPracticeCard } from '../../components/write/HanziPracticeCard';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { WriteComplete } from '../../components/write/WriteComplete';
import type { Character } from '../../types/character';

export default function WriteScreen() {
  const { colors } = useTheme();
  const { currentWeek } = useAppStore();
  const { recordWritingPractice } = useProgressStore();

  const [chars, setChars] = useState<Character[]>([]);
  const [index, setIndex] = useState(0);
  const [totalMistakes, setTotalMistakes] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getCharactersByWeek(currentWeek || 1).then((result) => {
      setChars(result);
      setIsLoading(false);
    });
  }, [currentWeek]);

  const handleComplete = useCallback(
    async (mistakes: number) => {
      const char = chars[index];
      if (char) {
        await recordWritingPractice(char.id, mistakes);
      }
      setTotalMistakes((t) => t + mistakes);
      if (index + 1 >= chars.length) {
        setIsDone(true);
      } else {
        setIndex((i) => i + 1);
      }
    },
    [chars, index, recordWritingPractice],
  );

  const handleSkip = useCallback(() => {
    setTotalMistakes((t) => t + 1);
    if (index + 1 >= chars.length) {
      setIsDone(true);
    } else {
      setIndex((i) => i + 1);
    }
  }, [chars, index]);

  const handleRestart = useCallback(() => {
    setIndex(0);
    setTotalMistakes(0);
    setIsDone(false);
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loading, { color: colors.textMuted }]}>Loading…</Text>
      </SafeAreaView>
    );
  }

  if (chars.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loading, { color: colors.textMuted }]}>No characters for this week.</Text>
      </SafeAreaView>
    );
  }

  if (isDone) {
    return (
      <WriteComplete
        totalCharacters={chars.length}
        totalMistakes={totalMistakes}
        onDone={handleRestart}
      />
    );
  }

  const current = chars[index];
  const progress = index / chars.length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Write</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Week {currentWeek} · {index + 1} of {chars.length}
        </Text>
      </View>
      <View style={styles.progress}>
        <ProgressBar progress={progress} color={colors.teal} />
      </View>
      <View style={styles.body}>
        <HanziPracticeCard
          key={current.id}
          character={current}
          onComplete={handleComplete}
          onSkip={handleSkip}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, gap: spacing.xs },
  title: { fontSize: fontSize.heading, fontWeight: fontWeight.black },
  subtitle: { fontSize: fontSize.caption },
  progress: { paddingHorizontal: spacing.lg, marginTop: spacing.md },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.lg },
  loading: { flex: 1, textAlign: 'center', textAlignVertical: 'center' },
});

import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../theme';
import { spacing, radius } from '../../theme/spacing';
import { fontSize, fontWeight } from '../../theme/typography';
import { useAppStore } from '../../stores/useAppStore';
import { useProgressStore } from '../../stores/useProgressStore';
import { getCharactersByDay, getWeekProgress } from '../../db/queries';
import { useWeekChars } from '../../hooks/useWeekChars';
import { WEEKS } from '../../data/weeks';
import { CharacterGrid } from '../../components/character/CharacterGrid';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Card } from '../../components/ui/Card';
import type { Character } from '../../types/character';
import type { WeekProgress } from '../../types/progress';

export default function LearnScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { currentWeek, currentDay, setCurrentWeek } = useAppStore();
  const { loadProgress } = useProgressStore();

  const [selectedWeek, setSelectedWeek] = useState(currentWeek);
  const [todayChars, setTodayChars] = useState<Character[]>([]);
  const [weekProgress, setWeekProgress] = useState<WeekProgress | null>(null);
  const [showAllWeek, setShowAllWeek] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { characters: weekChars, loading: weekLoading } = useWeekChars(selectedWeek);

  const loadData = useCallback(async () => {
    const [today, progress] = await Promise.all([
      getCharactersByDay(currentDay),
      getWeekProgress(selectedWeek),
    ]);
    setTodayChars(today);
    setWeekProgress(progress);
  }, [currentDay, selectedWeek]);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadData(), loadProgress()]);
    setRefreshing(false);
  }, [loadData, loadProgress]);

  const handleWeekSelect = (week: number) => {
    setSelectedWeek(week);
    setCurrentWeek(week);
    setShowAllWeek(false);
  };

  const handleCharPress = (char: Character) => {
    router.push(`/character/${char.id}`);
  };

  const activeWeek = WEEKS.find((w) => w.week === selectedWeek);
  const progressRatio = weekProgress
    ? weekProgress.total > 0 ? weekProgress.studied / weekProgress.total : 0
    : 0;
  const displayedWeekChars = showAllWeek ? weekChars : weekChars.slice(0, 60);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.teal} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Learn</Text>
          {activeWeek && (
            <Text style={[styles.weekTopic, { color: colors.textSecondary }]}>
              Week {selectedWeek}: {activeWeek.topic}
            </Text>
          )}
        </View>

        {/* Week selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.weekScroll} contentContainerStyle={styles.weekScrollContent}>
          {WEEKS.map((w) => {
            const active = w.week === selectedWeek;
            return (
              <TouchableOpacity
                key={w.week}
                onPress={() => handleWeekSelect(w.week)}
                style={[
                  styles.weekPill,
                  {
                    backgroundColor: active ? colors.teal : colors.surface,
                    borderColor: active ? colors.teal : colors.border,
                    borderRadius: radius.full,
                  },
                ]}
              >
                <Text style={[styles.weekPillText, { color: active ? '#FFFFFF' : colors.textSecondary }]}>
                  W{w.week}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Progress bar */}
        {weekProgress && (
          <View style={styles.section}>
            <ProgressBar
              progress={progressRatio}
              label={`${weekProgress.studied} / ${weekProgress.total} characters studied this week`}
              color={colors.teal}
            />
          </View>
        )}

        {/* Today's characters */}
        {selectedWeek === currentWeek && todayChars.length > 0 && (
          <View style={styles.section}>
            <Card>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Today's Characters</Text>
              <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                Day {currentDay} — {todayChars.length} characters
              </Text>
              <CharacterGrid
                characters={todayChars}
                onCharacterPress={handleCharPress}
                scrollEnabled={false}
              />
            </Card>
          </View>
        )}

        {/* All week characters */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Week {selectedWeek} Characters
          </Text>
          {activeWeek && (
            <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
              {activeWeek.description}
            </Text>
          )}
          <CharacterGrid
            characters={displayedWeekChars}
            onCharacterPress={handleCharPress}
            scrollEnabled={false}
            loading={weekLoading}
          />
          {weekChars.length > 60 && (
            <TouchableOpacity
              onPress={() => setShowAllWeek((v) => !v)}
              style={[styles.showAll, { borderColor: colors.teal, borderRadius: radius.md }]}
            >
              <Text style={[styles.showAllText, { color: colors.teal }]}>
                {showAllWeek ? 'Show less' : `Show all ${weekChars.length} characters`}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.sm },
  title: { fontSize: fontSize.heading, fontWeight: fontWeight.black },
  weekTopic: { fontSize: fontSize.body, marginTop: spacing.xs },
  weekScroll: { marginTop: spacing.sm },
  weekScrollContent: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  weekPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    marginRight: spacing.xs,
  },
  weekPillText: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  section: { paddingHorizontal: spacing.lg, marginTop: spacing.xl },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, marginBottom: spacing.xs },
  sectionSubtitle: { fontSize: fontSize.caption, marginBottom: spacing.md },
  showAll: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  showAllText: { fontSize: fontSize.body, fontWeight: fontWeight.semibold },
  bottomPad: { height: spacing.xxxl },
});

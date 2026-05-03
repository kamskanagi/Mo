import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';
import { spacing, radius } from '../../theme/spacing';
import { fontSize, fontWeight } from '../../theme/typography';
import { useAppStore } from '../../stores/useAppStore';
import { useReadCompletion } from '../../hooks/useReadCompletion';
import { ConversationView } from '../../components/read/ConversationView';
import { CONVERSATIONS } from '../../data/conversations';
import type { Conversation } from '../../types/progress';

const ALL_WEEKS = CONVERSATIONS.map((c) => c.week);

export default function ReadScreen() {
  const { colors } = useTheme();
  const { currentWeek } = useAppStore();
  const { completed, loaded, load, markDone } = useReadCompletion(ALL_WEEKS);
  const [selected, setSelected] = useState<Conversation | null>(null);

  useEffect(() => { load(); }, [load]);

  const handleComplete = async () => {
    if (!selected) return;
    await markDone(selected.week);
    setSelected(null);
  };

  if (selected) {
    return (
      <ConversationView
        conversation={selected}
        onComplete={handleComplete}
        onBack={() => setSelected(null)}
      />
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Read</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {CONVERSATIONS.filter((c) => completed.has(c.week)).length} of {CONVERSATIONS.length} complete
          </Text>
        </View>

        <View style={styles.list}>
          {CONVERSATIONS.map((conv) => {
            const unlocked = conv.week <= currentWeek;
            const done = completed.has(conv.week);
            const [titleCn, titleEn] = conv.title.split(' — ');

            return (
              <TouchableOpacity
                key={conv.week}
                style={[
                  styles.item,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    opacity: unlocked ? 1 : 0.45,
                  },
                ]}
                onPress={() => unlocked && setSelected(conv)}
                activeOpacity={unlocked ? 0.7 : 1}
                disabled={!unlocked}
              >
                <View style={styles.itemInfo}>
                  <Text style={[styles.itemCn, { color: colors.text }]}>{titleCn}</Text>
                  <Text style={[styles.itemEn, { color: colors.textSecondary }]}>
                    {titleEn}  ·  Week {conv.week}
                  </Text>
                </View>
                {unlocked ? (
                  <View style={[styles.badge, { backgroundColor: done ? colors.greenSoft : colors.blueSoft }]}>
                    <Text style={[styles.badgeText, { color: done ? colors.green : colors.blue }]}>
                      {done ? 'Done' : 'New'}
                    </Text>
                  </View>
                ) : (
                  <Text style={{ color: colors.textMuted, fontSize: 18 }}>🔒</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.sm, gap: spacing.xs },
  title: { fontSize: fontSize.heading, fontWeight: fontWeight.black },
  subtitle: { fontSize: fontSize.caption },
  list: { paddingHorizontal: spacing.lg, gap: spacing.sm, marginTop: spacing.md },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.base,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  itemInfo: { flex: 1, gap: spacing.xxs },
  itemCn: { fontSize: fontSize.body, fontWeight: fontWeight.semibold },
  itemEn: { fontSize: fontSize.caption },
  badge: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  badgeText: { fontSize: fontSize.caption, fontWeight: fontWeight.semibold },
  bottomPad: { height: spacing.xxxl },
});

// src/components/write/WriteComplete.tsx
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import { spacing, radius } from '../../theme/spacing';
import { fontSize, fontWeight } from '../../theme/typography';

interface WriteCompleteProps {
  totalCharacters: number;
  totalMistakes: number;
  onDone: () => void;
}

export function WriteComplete({ totalCharacters, totalMistakes, onDone }: WriteCompleteProps) {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={styles.icon}>✍️</Text>
      <Text style={[styles.title, { color: colors.text }]}>Practice complete!</Text>
      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={[styles.value, { color: colors.teal }]}>{totalCharacters}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>characters</Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.value, { color: totalMistakes === 0 ? colors.green : colors.gold }]}>
            {totalMistakes}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>mistakes</Text>
        </View>
      </View>
      <TouchableOpacity
        style={[styles.btn, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={onDone}
        activeOpacity={0.8}
      >
        <Text style={[styles.btnText, { color: colors.textSecondary }]}>Done</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.xl },
  icon: { fontSize: 48 },
  title: { fontSize: fontSize.heading, fontWeight: fontWeight.black },
  stats: { flexDirection: 'row', gap: spacing.xxxl },
  stat: { alignItems: 'center', gap: spacing.xs },
  value: { fontSize: 32, fontWeight: fontWeight.black },
  statLabel: { fontSize: fontSize.caption },
  btn: {
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  btnText: { fontSize: fontSize.body, fontWeight: fontWeight.semibold },
});

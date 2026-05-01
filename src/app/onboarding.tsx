import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../theme';
import { useAppStore } from '../stores/useAppStore';
import { useSettingsStore } from '../stores/useSettingsStore';
import { spacing, radius } from '../theme/spacing';
import { fontSize, fontWeight } from '../theme/typography';

type Script = 'traditional' | 'simplified' | 'both';
type Goal = 20 | 38 | 50;
type Voice = 'zh-TW' | 'zh-CN';

export default function OnboardingScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { setOnboarded } = useAppStore();
  const { updateSetting } = useSettingsStore();

  const [script, setScript] = useState<Script>('traditional');
  const [goal, setGoal] = useState<Goal>(38);
  const [voice, setVoice] = useState<Voice>('zh-TW');
  const [saving, setSaving] = useState(false);

  const handleStart = async () => {
    setSaving(true);
    await Promise.all([
      updateSetting('script', script),
      updateSetting('dailyGoal', goal),
      updateSetting('voiceLocale', voice),
    ]);
    await setOnboarded(true);
    router.replace('/(tabs)/learn');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={[styles.heroChar, { color: colors.text }]}>墨</Text>
          <Text style={[styles.heroTitle, { color: colors.text }]}>Mò</Text>
          <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
            Learn Chinese Characters
          </Text>
        </View>

        {/* Script preference */}
        <Section title="Which script?" colors={colors}>
          {([
            ['traditional', 'Traditional', '繁體'],
            ['simplified', 'Simplified', '简体'],
            ['both', 'Both', '兩種'],
          ] as [Script, string, string][]).map(([val, label, sub]) => (
            <OptionCard
              key={val}
              label={label}
              sub={sub}
              selected={script === val}
              onPress={() => setScript(val)}
              colors={colors}
            />
          ))}
        </Section>

        {/* Daily goal */}
        <Section title="Daily goal?" colors={colors}>
          {([
            [20, 'Casual', '20 characters / day'],
            [38, 'Standard', '38 characters / day'],
            [50, 'Intensive', '50 characters / day'],
          ] as [Goal, string, string][]).map(([val, label, sub]) => (
            <OptionCard
              key={val}
              label={label}
              sub={sub}
              selected={goal === val}
              onPress={() => setGoal(val)}
              colors={colors}
            />
          ))}
        </Section>

        {/* Voice preference */}
        <Section title="Pronunciation accent?" colors={colors}>
          {([
            ['zh-TW', 'Taiwan', '🇹🇼 Mandarin'],
            ['zh-CN', 'Mainland', '🇨🇳 Putonghua'],
          ] as [Voice, string, string][]).map(([val, label, sub]) => (
            <OptionCard
              key={val}
              label={label}
              sub={sub}
              selected={voice === val}
              onPress={() => setVoice(val)}
              colors={colors}
            />
          ))}
        </Section>

        {/* CTA */}
        <TouchableOpacity
          onPress={handleStart}
          disabled={saving}
          style={[styles.cta, { backgroundColor: colors.teal, borderRadius: radius.md, opacity: saving ? 0.7 : 1 }]}
        >
          <Text style={styles.ctaText}>{saving ? 'Setting up…' : 'Start Learning →'}</Text>
        </TouchableOpacity>

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, colors, children }: { title: string; colors: any; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      <View style={styles.options}>{children}</View>
    </View>
  );
}

function OptionCard({
  label, sub, selected, onPress, colors,
}: {
  label: string; sub: string; selected: boolean; onPress: () => void; colors: any;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.option,
        {
          borderColor: selected ? colors.teal : colors.border,
          backgroundColor: selected ? colors.tealSoft : colors.surface,
          borderRadius: radius.lg,
        },
      ]}
    >
      <Text style={[styles.optionLabel, { color: selected ? colors.teal : colors.text }]}>{label}</Text>
      <Text style={[styles.optionSub, { color: colors.textSecondary }]}>{sub}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: spacing.lg },
  hero: { alignItems: 'center', paddingVertical: spacing.xxxl },
  heroChar: { fontSize: 72, fontWeight: fontWeight.black },
  heroTitle: { fontSize: fontSize.heading, fontWeight: fontWeight.black, marginTop: spacing.sm },
  heroSubtitle: { fontSize: fontSize.body, marginTop: spacing.xs },
  section: { marginBottom: spacing.xxl },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, marginBottom: spacing.md },
  options: { gap: spacing.sm },
  option: { padding: spacing.lg, borderWidth: 1.5 },
  optionLabel: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold },
  optionSub: { fontSize: fontSize.caption, marginTop: spacing.xs },
  cta: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  ctaText: { color: '#FFFFFF', fontSize: fontSize.lg, fontWeight: fontWeight.bold },
});

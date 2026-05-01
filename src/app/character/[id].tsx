import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { spacing, radius } from '../../theme/spacing';
import { fontSize, fontWeight, fonts } from '../../theme/typography';
import { getCharacterById } from '../../db/queries';
import { useProgressStore } from '../../stores/useProgressStore';
import { SpeakButton } from '../../components/character/SpeakButton';
import { Badge } from '../../components/ui/Badge';
import type { Character } from '../../types/character';

export default function CharacterDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const router = useRouter();
  const { markCharacterStudied } = useProgressStore();

  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [marked, setMarked] = useState(false);

  useEffect(() => {
    if (!id) return;
    getCharacterById(Number(id)).then((char) => {
      setCharacter(char);
      setLoading(false);
    });
  }, [id]);

  const handleMarkStudied = async () => {
    if (!character) return;
    await markCharacterStudied(character.id);
    setMarked(true);
  };

  const handleNavigate = (direction: 'prev' | 'next') => {
    if (!character) return;
    const next = direction === 'next' ? character.id + 1 : character.id - 1;
    if (next >= 1 && next <= 3183) {
      router.replace(`/character/${next}`);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator style={{ flex: 1 }} color={colors.teal} />
      </SafeAreaView>
    );
  }

  if (!character) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textSecondary, margin: spacing.lg }}>Character not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Back button */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Ionicons name="chevron-back" size={24} color={colors.text} />
        <Text style={[styles.backLabel, { color: colors.text }]}>Back</Text>
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={[styles.hero, { backgroundColor: '#1C1917' }]}>
          <Text style={[styles.heroChar, { fontFamily: fonts.character }]}>{character.character}</Text>
          {character.simplified && character.simplified !== character.character && (
            <Badge label={`Simplified: ${character.simplified}`} color={colors.gold} />
          )}
          <Text style={[styles.heroPinyin, { color: colors.gold }]}>{character.pinyin}</Text>
          <SpeakButton text={character.character} size="lg" />
        </View>

        {/* Meaning */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>MEANING</Text>
          <View style={styles.keywordRow}>
            <Badge label={character.keyword} color={colors.teal} />
          </View>
          <Text style={[styles.definition, { color: colors.text }]}>{character.definition}</Text>
        </View>

        {/* Examples */}
        {character.examples.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>EXAMPLE WORDS</Text>
            {character.examples.map((ex, i) => (
              <View key={i} style={styles.exampleRow}>
                <SpeakButton text={ex} size="sm" />
                <View style={styles.exampleText}>
                  <Text style={[styles.exampleWord, { color: colors.teal, fontFamily: fonts.character }]}>{ex}</Text>
                  {character.examplePinyin[i] && (
                    <Text style={[styles.examplePinyin, { color: colors.red }]}>
                      {character.examplePinyin[i]}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Stroke order placeholder */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>STROKE ORDER</Text>
          <View style={[styles.strokePlaceholder, { borderColor: colors.border, backgroundColor: colors.surface }]}>
            <Text style={[styles.strokePlaceholderText, { color: colors.textMuted }]}>
              Stroke animation — coming soon
            </Text>
            <Badge label={`${character.strokeCount} strokes`} color={colors.surfaceAlt} textColor={colors.textSecondary} />
          </View>
        </View>

        {/* Practice button */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.practiceBtn, { backgroundColor: colors.teal, borderRadius: radius.md }]}
            onPress={() => router.push('/(tabs)/write')}
          >
            <Text style={styles.practiceBtnText}>Practice Writing</Text>
          </TouchableOpacity>
        </View>

        {/* Mark studied */}
        <View style={[styles.section, styles.markRow]}>
          <TouchableOpacity
            onPress={handleMarkStudied}
            disabled={marked}
            style={[
              styles.markBtn,
              {
                borderColor: marked ? colors.green : colors.border,
                borderRadius: radius.md,
                backgroundColor: marked ? colors.greenSoft : 'transparent',
              },
            ]}
          >
            <Ionicons name={marked ? 'checkmark-circle' : 'ellipse-outline'} size={18} color={marked ? colors.green : colors.textSecondary} />
            <Text style={[styles.markBtnText, { color: marked ? colors.green : colors.textSecondary }]}>
              {marked ? 'Marked as studied' : 'Mark as studied'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomPad} />
      </ScrollView>

      {/* Prev / Next navigation */}
      <View style={[styles.nav, { borderTopColor: colors.border, backgroundColor: colors.surface }]}>
        <TouchableOpacity onPress={() => handleNavigate('prev')} disabled={character.id <= 1} style={styles.navBtn}>
          <Ionicons name="chevron-back" size={20} color={character.id <= 1 ? colors.textMuted : colors.text} />
          <Text style={[styles.navLabel, { color: character.id <= 1 ? colors.textMuted : colors.text }]}>Prev</Text>
        </TouchableOpacity>
        <Text style={[styles.navId, { color: colors.textSecondary }]}>#{character.id}</Text>
        <TouchableOpacity onPress={() => handleNavigate('next')} disabled={character.id >= 3183} style={styles.navBtn}>
          <Text style={[styles.navLabel, { color: character.id >= 3183 ? colors.textMuted : colors.text }]}>Next</Text>
          <Ionicons name="chevron-forward" size={20} color={character.id >= 3183 ? colors.textMuted : colors.text} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg, paddingBottom: spacing.sm },
  backLabel: { fontSize: fontSize.body, marginLeft: spacing.xs },
  hero: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  heroChar: { fontSize: fontSize.charHero, color: '#FFFFFF', fontWeight: fontWeight.black },
  heroPinyin: { fontSize: fontSize.xxl, fontWeight: fontWeight.medium, letterSpacing: 1 },
  section: { paddingHorizontal: spacing.lg, paddingTop: spacing.xl },
  sectionLabel: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, letterSpacing: 1.5, marginBottom: spacing.sm },
  keywordRow: { marginBottom: spacing.sm },
  definition: { fontSize: fontSize.body, lineHeight: fontSize.body * 1.6 },
  exampleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  exampleText: { flex: 1 },
  exampleWord: { fontSize: fontSize.xl, fontWeight: fontWeight.semibold },
  examplePinyin: { fontSize: fontSize.caption, marginTop: 2 },
  strokePlaceholder: {
    height: 120,
    borderWidth: 1,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  strokePlaceholderText: { fontSize: fontSize.body },
  practiceBtn: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  practiceBtnText: { color: '#FFFFFF', fontSize: fontSize.lg, fontWeight: fontWeight.bold },
  markRow: { paddingBottom: spacing.sm },
  markBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  markBtnText: { fontSize: fontSize.body },
  bottomPad: { height: spacing.xxxl },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
  },
  navBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, padding: spacing.sm },
  navLabel: { fontSize: fontSize.body, fontWeight: fontWeight.medium },
  navId: { fontSize: fontSize.caption },
});

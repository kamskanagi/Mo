import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../../theme';
import { PinyinText } from './PinyinText';
import { SpeakButton } from './SpeakButton';
import { Badge } from '../ui/Badge';
import { spacing, radius } from '../../theme/spacing';
import { fontSize, fontWeight } from '../../theme/typography';
import type { Character } from '../../types/character';

interface Props {
  character: Character;
  onPracticeWriting?: () => void;
}

export function CharacterDetail({ character, onPracticeWriting }: Props) {
  const { colors } = useTheme();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
      <View style={[styles.hero, { backgroundColor: colors.text }]}>
        <Text style={[styles.heroChar, { color: colors.surface }]}>
          {character.character}
        </Text>
        <PinyinText pinyin={character.pinyin} size="lg" />
        <View style={styles.heroActions}>
          <SpeakButton text={character.character} size="lg" />
        </View>
        {character.simplified && character.simplified !== character.character ? (
          <Badge label={`简 ${character.simplified}`} color={colors.gold} textColor={colors.text} />
        ) : null}
      </View>

      {/* Meaning */}
      <View style={[styles.section, { borderBottomColor: colors.border }]}>
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Meaning</Text>
        <View style={styles.row}>
          <Badge label={character.keyword} color={colors.tealSoft} textColor={colors.teal} />
        </View>
        <Text style={[styles.definition, { color: colors.text }]}>{character.definition}</Text>
      </View>

      {/* Examples */}
      {character.examples.length > 0 ? (
        <View style={[styles.section, { borderBottomColor: colors.border }]}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Example Words</Text>
          {character.examples.map((example, i) => (
            <View key={i} style={styles.exampleRow}>
              <SpeakButton text={example} size="sm" />
              <View style={styles.exampleText}>
                <Text style={[styles.exampleChinese, { color: colors.teal }]}>{example}</Text>
                {character.examplePinyin[i] ? (
                  <PinyinText pinyin={character.examplePinyin[i]} size="sm" />
                ) : null}
              </View>
            </View>
          ))}
        </View>
      ) : null}

      {/* Stroke Order (placeholder) */}
      <View style={[styles.section, { borderBottomColor: colors.border }]}>
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Stroke Order</Text>
        <View style={[styles.strokePlaceholder, { backgroundColor: colors.surfaceAlt, borderRadius: radius.md }]}>
          <Text style={[styles.strokePlaceholderText, { color: colors.textMuted }]}>
            Coming soon — stroke animation
          </Text>
          <Badge label={`${character.strokeCount} strokes`} color={colors.border} textColor={colors.textSecondary} />
        </View>
      </View>

      {/* Practice Button */}
      {onPracticeWriting ? (
        <Pressable
          onPress={onPracticeWriting}
          style={({ pressed }) => [
            styles.practiceBtn,
            { backgroundColor: colors.teal, borderRadius: radius.md, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Text style={styles.practiceBtnText}>✍️  Practice Writing</Text>
        </Pressable>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing.huge,
  },
  hero: {
    alignItems: 'center',
    paddingTop: spacing.huge,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  heroChar: {
    fontSize: 88,
    lineHeight: 96,
    fontWeight: '900',
  },
  heroActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  section: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    gap: spacing.sm,
  },
  sectionLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  definition: {
    fontSize: fontSize.body,
    lineHeight: 22,
  },
  exampleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  exampleText: {
    flex: 1,
    gap: 2,
  },
  exampleChinese: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.medium,
  },
  strokePlaceholder: {
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 120,
    justifyContent: 'center',
  },
  strokePlaceholderText: {
    fontSize: fontSize.sm,
  },
  practiceBtn: {
    margin: spacing.lg,
    padding: spacing.lg,
    alignItems: 'center',
  },
  practiceBtnText: {
    color: '#FFFFFF',
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
});

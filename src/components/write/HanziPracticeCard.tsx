// src/components/write/HanziPracticeCard.tsx
import { useEffect, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useHanziWriter, HanziWriter } from '@jamsch/react-native-hanzi-writer';
import { useTheme } from '../../theme';
import { spacing, radius } from '../../theme/spacing';
import { fontSize, fontWeight } from '../../theme/typography';
import type { Character } from '../../types/character';

interface HanziPracticeCardProps {
  character: Character;
  onComplete: (mistakes: number) => void;
  onSkip: () => void;
}

export function HanziPracticeCard({ character, onComplete, onSkip }: HanziPracticeCardProps) {
  const { colors } = useTheme();

  const writer = useHanziWriter({ character: character.character });

  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; });

  useEffect(() => {
    writer.quiz.start({
      showHintAfterMisses: 3,
      onComplete: ({ totalMistakes }) => {
        onCompleteRef.current(totalMistakes);
      },
    });
  }, []);

  const handleShowMe = useCallback(() => {
    writer.animator.animateCharacter({ strokeDuration: 500 });
  }, [writer]);

  return (
    <View style={styles.container}>
      <Text style={[styles.keyword, { color: colors.text }]}>
        {character.keyword}
        <Text style={[styles.pinyin, { color: colors.textSecondary }]}>
          {'  '}{character.pinyin}
        </Text>
      </Text>

      <View style={[styles.canvas, { borderColor: colors.border, backgroundColor: colors.surface }]}>
        <HanziWriter writer={writer} style={styles.writer}>
          <HanziWriter.Svg>
            <HanziWriter.Outline color={colors.characterOutline} />
            <HanziWriter.Character color={colors.characterStroke} />
            <HanziWriter.QuizStrokes color={colors.characterStroke} />
            <HanziWriter.QuizMistakeHighlighter color={colors.red} strokeDuration={400} />
          </HanziWriter.Svg>
        </HanziWriter>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.ctrlBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={handleShowMe}
          activeOpacity={0.8}
        >
          <Text style={[styles.ctrlText, { color: colors.textSecondary }]}>▶ Show me</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.ctrlBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={onSkip}
          activeOpacity={0.8}
        >
          <Text style={[styles.ctrlText, { color: colors.textMuted }]}>Skip</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: spacing.lg },
  keyword: { fontSize: fontSize.lg, fontWeight: fontWeight.bold },
  pinyin: { fontSize: fontSize.body, fontWeight: fontWeight.normal },
  canvas: { borderRadius: radius.xl, borderWidth: 1, overflow: 'hidden' },
  writer: { width: 220, height: 220 },
  controls: { flexDirection: 'row', gap: spacing.md },
  ctrlBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  ctrlText: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
});

import React from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import { PinyinText } from './PinyinText';
import { spacing, radius } from '../../theme/spacing';
import { fontSize, fontWeight } from '../../theme/typography';
import type { Character } from '../../types/character';
import type { CharacterStatus } from '../../types/progress';

const STATUS_COLOR: Record<CharacterStatus, string | null> = {
  new: null,
  seen: '#78716C',
  learning: '#F59E0B',
  reviewing: '#3B82F6',
  mastered: '#22C55E',
};

interface Props {
  character: Character;
  onPress: (character: Character) => void;
  showPinyin?: boolean;
  status?: CharacterStatus;
}

export function CharacterCard({ character, onPress, showPinyin = true, status }: Props) {
  const { colors } = useTheme();
  const dotColor = status ? STATUS_COLOR[status] : null;

  return (
    <Pressable
      onPress={() => onPress(character)}
      accessibilityLabel={`${character.character}, ${character.pinyin}, ${character.keyword}`}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: radius.md,
          opacity: pressed ? 0.75 : 1,
        },
      ]}
    >
      {dotColor ? (
        <View style={[styles.dot, { backgroundColor: dotColor }]} />
      ) : null}
      <Text style={[styles.character, { color: colors.text }]}>
        {character.character}
      </Text>
      {showPinyin ? (
        <PinyinText pinyin={character.pinyin} size="sm" />
      ) : null}
      <Text style={[styles.keyword, { color: colors.textSecondary }]} numberOfLines={1}>
        {character.keyword}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: spacing.xs,
    padding: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    minHeight: 84,
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  character: {
    fontSize: fontSize.heading,
    fontWeight: fontWeight.bold,
    lineHeight: 36,
  },
  keyword: {
    fontSize: fontSize.xs,
    textAlign: 'center',
    marginTop: 1,
  },
});

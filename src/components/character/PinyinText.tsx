import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import { fontSize } from '../../theme/typography';

interface Props {
  pinyin: string;
  size?: 'sm' | 'base' | 'lg';
}

const sizeMap = {
  sm: fontSize.sm,
  base: fontSize.body,
  lg: fontSize.lg,
};

export function PinyinText({ pinyin, size = 'base' }: Props) {
  const { colors } = useTheme();

  return (
    <Text style={[styles.pinyin, { color: colors.red, fontSize: sizeMap[size] }]}>
      {pinyin}
    </Text>
  );
}

const styles = StyleSheet.create({
  pinyin: {
    letterSpacing: 0.5,
  },
});

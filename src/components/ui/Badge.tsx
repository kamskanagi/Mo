import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import { spacing, radius } from '../../theme/spacing';
import { fontSize, fontWeight } from '../../theme/typography';

interface Props {
  label: string;
  color?: string;
  textColor?: string;
}

export function Badge({ label, color, textColor }: Props) {
  const { colors } = useTheme();
  const bg = color ?? colors.teal;
  const fg = textColor ?? '#FFFFFF';

  return (
    <View style={[styles.badge, { backgroundColor: bg, borderRadius: radius.full }]}>
      <Text style={[styles.text, { color: fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.3,
  },
});

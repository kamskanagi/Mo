import React from 'react';
import { Pressable, View, StyleSheet, type ViewStyle } from 'react-native';
import { useTheme } from '../../theme';
import { spacing, radius, shadows } from '../../theme/spacing';

interface Props {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
}

export function Card({ children, onPress, style }: Props) {
  const { colors } = useTheme();

  const cardStyle = [
    styles.card,
    {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: radius.lg,
      ...shadows.sm,
    },
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [cardStyle, pressed && styles.pressed]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    borderWidth: 1,
  },
  pressed: {
    opacity: 0.85,
  },
});

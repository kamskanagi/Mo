import React from 'react';
import { Pressable, Text, ActivityIndicator, StyleSheet, type ViewStyle } from 'react-native';
import { useTheme } from '../../theme';
import { spacing, radius } from '../../theme/spacing';
import { fontSize, fontWeight } from '../../theme/typography';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  fullWidth = false,
  loading = false,
  disabled = false,
  style,
}: Props) {
  const { colors } = useTheme();

  const isPrimary = variant === 'primary';
  const bgColor = isPrimary ? colors.teal : 'transparent';
  const fgColor = isPrimary ? '#FFFFFF' : colors.teal;
  const borderColor = isPrimary ? 'transparent' : colors.teal;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: bgColor,
          borderColor,
          borderRadius: radius.md,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
          opacity: pressed || disabled ? 0.7 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fgColor} size="small" />
      ) : (
        <Text style={[styles.label, { color: fgColor }]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.semibold,
  },
});

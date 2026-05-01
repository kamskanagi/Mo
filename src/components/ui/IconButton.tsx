import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { radius } from '../../theme/spacing';

interface Props {
  name: React.ComponentProps<typeof Ionicons>['name'];
  size?: number;
  color?: string;
  onPress: () => void;
  accessibilityLabel: string;
}

export function IconButton({ name, size = 24, color, onPress, accessibilityLabel }: Props) {
  const { colors } = useTheme();
  const iconColor = color ?? colors.text;

  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.button,
        {
          width: size + 16,
          height: size + 16,
          borderRadius: radius.full,
          opacity: pressed ? 0.6 : 1,
        },
      ]}
    >
      <Ionicons name={name} size={size} color={iconColor} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

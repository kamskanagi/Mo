import { Pressable, Text, ActivityIndicator, StyleSheet, type ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../theme';
import { spacing, radius } from '../../theme/spacing';
import { fontSize, fontWeight } from '../../theme/typography';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

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
  const { colors, isDark } = useTheme();
  const scale = useSharedValue(1);

  const isPrimary = variant === 'primary';

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 20, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1.0, { damping: 15, stiffness: 250 });
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const primaryShadow = isPrimary && !disabled ? {
    shadowColor: colors.teal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0.35 : 0.18,
    shadowRadius: 14,
    elevation: 4,
  } : {};

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[
        animatedStyle,
        styles.button,
        {
          backgroundColor: isPrimary ? colors.teal : 'transparent',
          borderColor: isPrimary ? 'transparent' : colors.teal,
          borderRadius: radius.lg,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
          opacity: disabled ? 0.4 : 1,
          ...primaryShadow,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? '#FFFFFF' : colors.teal} size="small" />
      ) : (
        <Text style={[styles.label, { color: isPrimary ? '#FFFFFF' : colors.teal }]}>
          {label}
        </Text>
      )}
    </AnimatedPressable>
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
    letterSpacing: 0.2,
  },
});

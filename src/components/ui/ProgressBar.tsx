import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useTheme } from '../../theme';
import { spacing, radius } from '../../theme/spacing';
import { fontSize } from '../../theme/typography';

interface Props {
  progress: number;
  color?: string;
  height?: number;
  label?: string;
}

export function ProgressBar({ progress, color, height = 8, label }: Props) {
  const { colors } = useTheme();
  const clampedProgress = Math.max(0, Math.min(1, progress));
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withTiming(clampedProgress, { duration: 500 });
  }, [clampedProgress]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${width.value * 100}%`,
  }));

  const barColor = color ?? colors.teal;

  return (
    <View>
      {label ? (
        <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      ) : null}
      <View style={[styles.track, { height, backgroundColor: colors.border, borderRadius: radius.sm }]}>
        <Animated.View
          style={[
            styles.fill,
            animatedStyle,
            { height, backgroundColor: barColor, borderRadius: radius.sm },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: fontSize.sm,
    marginBottom: spacing.xs,
  },
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
});

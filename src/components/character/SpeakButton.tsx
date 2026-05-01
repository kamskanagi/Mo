import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { useSpeech } from '../../hooks/useSpeech';
import { useTheme } from '../../theme';
import { radius } from '../../theme/spacing';
import type { TtsLocale } from '../../services/tts';

const SIZE_MAP = { sm: 28, md: 36, lg: 48 } as const;
const ICON_MAP = { sm: 14, md: 18, lg: 24 } as const;

interface Props {
  text: string;
  locale?: TtsLocale;
  size?: keyof typeof SIZE_MAP;
}

export function SpeakButton({ text, locale, size = 'md' }: Props) {
  const { colors } = useTheme();
  const { speakText, speaking } = useSpeech(locale);
  const pulse = useSharedValue(1);

  const diameter = SIZE_MAP[size];
  const iconSize = ICON_MAP[size];

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    pulse.value = withRepeat(
      withSequence(withTiming(1.15, { duration: 300 }), withTiming(1, { duration: 300 })),
      -1,
      false
    );
    await speakText(text);
    pulse.value = withTiming(1, { duration: 150 });
  };

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  return (
    <Pressable
      onPress={handlePress}
      accessibilityLabel={`Speak: ${text}`}
      accessibilityRole="button"
    >
      <Animated.View
        style={[
          styles.circle,
          animStyle,
          {
            width: diameter,
            height: diameter,
            borderRadius: radius.full,
            backgroundColor: speaking ? colors.tealSoft : colors.teal,
          },
        ]}
      >
        <Ionicons
          name={speaking ? 'volume-high' : 'volume-medium'}
          size={iconSize}
          color={speaking ? colors.teal : '#FFFFFF'}
        />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// src/components/review/FlipCard.tsx
import { useState, useCallback } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

interface FlipCardProps {
  front: React.ReactNode;
  back: React.ReactNode;
  onFlip?: () => void;
}

export function FlipCard({ front, back, onFlip }: FlipCardProps) {
  const [flipped, setFlipped] = useState(false);
  const rotation = useSharedValue(0);

  const frontStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1200 },
      { rotateY: `${interpolate(rotation.value, [0, 1], [0, 180])}deg` },
    ],
    backfaceVisibility: 'hidden',
  }));

  const backStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1200 },
      { rotateY: `${interpolate(rotation.value, [0, 1], [180, 360])}deg` },
    ],
    backfaceVisibility: 'hidden',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  }));

  const handleFlip = useCallback(() => {
    if (flipped) return;
    rotation.value = withTiming(1, { duration: 350 });
    setFlipped(true);
    onFlip?.();
  }, [flipped, onFlip, rotation]);

  return (
    <TouchableOpacity onPress={handleFlip} activeOpacity={1} style={styles.container}>
      <View style={styles.inner}>
        <Animated.View style={[styles.face, frontStyle]}>{front}</Animated.View>
        <Animated.View style={[styles.face, backStyle]}>{back}</Animated.View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  inner: { position: 'relative', width: '100%' },
  face: { width: '100%' },
});

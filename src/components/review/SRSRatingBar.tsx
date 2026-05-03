// src/components/review/SRSRatingBar.tsx
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { spacing, radius } from '../../theme/spacing';
import { fontSize, fontWeight } from '../../theme/typography';
import type { SrsRating } from '../../services/srs';

interface SRSRatingBarProps {
  onRate: (rating: SrsRating) => void;
}

const RATINGS: Array<{ label: string; rating: SrsRating; bg: string; fg: string }> = [
  { label: 'Again', rating: 'again', bg: '#7f1d1d', fg: '#fca5a5' },
  { label: 'Hard',  rating: 'hard',  bg: '#78350f', fg: '#fcd34d' },
  { label: 'Good',  rating: 'good',  bg: '#14532d', fg: '#86efac' },
  { label: 'Easy',  rating: 'easy',  bg: '#1e3a5f', fg: '#93c5fd' },
];

export function SRSRatingBar({ onRate }: SRSRatingBarProps) {
  return (
    <View style={styles.row}>
      {RATINGS.map(({ label, rating, bg, fg }) => (
        <TouchableOpacity
          key={rating}
          style={[styles.btn, { backgroundColor: bg }]}
          onPress={() => onRate(rating)}
          activeOpacity={0.8}
        >
          <Text style={[styles.label, { color: fg }]}>{label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm },
  btn: {
    flex: 1,
    paddingVertical: spacing.base,
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  label: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, letterSpacing: 0.3 },
});

// src/components/read/ReadingControls.tsx
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import { spacing, radius } from '../../theme/spacing';
import { fontSize, fontWeight } from '../../theme/typography';

interface ReadingControlsProps {
  showPinyin: boolean;
  showEnglish: boolean;
  onTogglePinyin: () => void;
  onToggleEnglish: () => void;
}

export function ReadingControls({
  showPinyin,
  showEnglish,
  onTogglePinyin,
  onToggleEnglish,
}: ReadingControlsProps) {
  const { colors } = useTheme();

  const Toggle = ({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) => (
    <TouchableOpacity
      style={[
        styles.toggle,
        {
          backgroundColor: active ? colors.tealSoft : colors.surface,
          borderColor: active ? colors.teal : colors.border,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.toggleText, { color: active ? colors.teal : colors.textSecondary }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.row}>
      <Toggle label="拼音" active={showPinyin} onPress={onTogglePinyin} />
      <Toggle label="EN" active={showEnglish} onPress={onToggleEnglish} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm },
  toggle: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  toggleText: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
});

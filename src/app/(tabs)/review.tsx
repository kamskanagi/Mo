import { ScrollView, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';
import { spacing } from '../../theme/spacing';
import { fontSize, fontWeight } from '../../theme/typography';

export default function ReviewScreen() {
  const { colors } = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Review</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          SRS flashcard review coming soon
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg },
  title: { fontSize: fontSize.heading, fontWeight: fontWeight.black, marginBottom: spacing.sm },
  subtitle: { fontSize: fontSize.body },
});

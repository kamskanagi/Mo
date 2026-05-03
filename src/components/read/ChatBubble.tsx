// src/components/read/ChatBubble.tsx
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../../theme';
import { spacing, radius } from '../../theme/spacing';
import { fontSize } from '../../theme/typography';
import { useSpeech } from '../../hooks/useSpeech';
import type { ConversationLine } from '../../types/progress';

interface ChatBubbleProps {
  line: ConversationLine;
  showPinyin: boolean;
  showEnglish: boolean;
  index: number;
}

export function ChatBubble({ line, showPinyin, showEnglish, index }: ChatBubbleProps) {
  const { colors } = useTheme();
  const { speakText, speaking } = useSpeech('zh-TW');
  const isA = line.speaker === 'A';

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 80).duration(300)}
      style={[styles.row, isA ? styles.rowLeft : styles.rowRight]}
    >
      <View
        style={[
          styles.bubble,
          { backgroundColor: isA ? colors.surface : colors.blueSoft },
          isA ? styles.bubbleLeft : styles.bubbleRight,
        ]}
      >
        <Text style={[styles.chinese, { color: colors.text }]}>{line.chinese}</Text>
        {showPinyin && (
          <Text style={[styles.pinyin, { color: colors.textMuted }]}>{line.pinyin}</Text>
        )}
        {showEnglish && (
          <Text style={[styles.english, { color: colors.textSecondary }]}>{line.english}</Text>
        )}
        <TouchableOpacity onPress={() => speakText(line.chinese)} style={styles.ttsBtn}>
          <Text style={{ color: speaking ? colors.teal : colors.textMuted, fontSize: 14 }}>
            {speaking ? '🔊' : '🔈'}
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: { width: '100%', marginBottom: spacing.md },
  rowLeft: { alignItems: 'flex-start' },
  rowRight: { alignItems: 'flex-end' },
  bubble: {
    maxWidth: '78%',
    padding: spacing.base,
    gap: spacing.xs,
  },
  bubbleLeft: { borderRadius: radius.lg, borderTopLeftRadius: 2 },
  bubbleRight: { borderRadius: radius.lg, borderTopRightRadius: 2 },
  chinese: { fontSize: fontSize.lg },
  pinyin: { fontSize: fontSize.sm },
  english: { fontSize: fontSize.caption, fontStyle: 'italic' },
  ttsBtn: { alignSelf: 'flex-end', marginTop: spacing.xs },
});

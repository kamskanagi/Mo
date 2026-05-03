// src/components/read/ConversationView.tsx
import { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';
import { spacing } from '../../theme/spacing';
import { fontSize, fontWeight } from '../../theme/typography';
import { ChatBubble } from './ChatBubble';
import { ReadingControls } from './ReadingControls';
import type { Conversation } from '../../types/progress';

interface ConversationViewProps {
  conversation: Conversation;
  onComplete: () => void;
  onBack: () => void;
}

export function ConversationView({ conversation, onComplete, onBack }: ConversationViewProps) {
  const { colors } = useTheme();
  const [revealed, setRevealed] = useState(1);
  const [showPinyin, setShowPinyin] = useState(true);
  const [showEnglish, setShowEnglish] = useState(false);
  const [done, setDone] = useState(false);

  const handleTap = useCallback(() => {
    if (done) return;
    if (revealed >= conversation.lines.length) {
      setDone(true);
    } else {
      setRevealed((r) => r + 1);
    }
  }, [revealed, done, conversation.lines.length]);

  const [titleChinese, titleEnglish] = conversation.title.split(' — ');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={[styles.back, { color: colors.teal }]}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.titleBox}>
          <Text style={[styles.titleCn, { color: colors.text }]}>{titleChinese}</Text>
          {titleEnglish && (
            <Text style={[styles.titleEn, { color: colors.textSecondary }]}>{titleEnglish}</Text>
          )}
        </View>
        <ReadingControls
          showPinyin={showPinyin}
          showEnglish={showEnglish}
          onTogglePinyin={() => setShowPinyin((v) => !v)}
          onToggleEnglish={() => setShowEnglish((v) => !v)}
        />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {conversation.lines.slice(0, revealed).map((line, i) => (
          <ChatBubble
            key={i}
            line={line}
            index={i}
            showPinyin={showPinyin}
            showEnglish={showEnglish}
          />
        ))}
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        {done ? (
          <TouchableOpacity
            style={[styles.completeBtn, { backgroundColor: colors.teal }]}
            onPress={onComplete}
            activeOpacity={0.85}
          >
            <Text style={styles.completeBtnText}>Complete ✓</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.tapBtn} onPress={handleTap} activeOpacity={0.7}>
            <Text style={[styles.tapHint, { color: colors.textMuted }]}>
              {revealed < conversation.lines.length ? 'Tap to continue →' : 'Tap to finish'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    gap: spacing.sm,
  },
  backBtn: { paddingRight: spacing.sm },
  back: { fontSize: fontSize.body },
  titleBox: { flex: 1 },
  titleCn: { fontSize: fontSize.body, fontWeight: fontWeight.bold },
  titleEn: { fontSize: fontSize.caption },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.xl },
  footer: { borderTopWidth: 1, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  tapBtn: { alignItems: 'center', paddingVertical: spacing.sm },
  tapHint: { fontSize: fontSize.body },
  completeBtn: { borderRadius: 10, paddingVertical: spacing.md, alignItems: 'center' },
  completeBtnText: { color: '#fff', fontSize: fontSize.body, fontWeight: fontWeight.bold },
});

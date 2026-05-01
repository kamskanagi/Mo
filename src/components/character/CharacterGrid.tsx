import React, { useCallback } from 'react';
import { FlatList, Text, View, StyleSheet } from 'react-native';
import { CharacterCard } from './CharacterCard';
import { useTheme } from '../../theme';
import { spacing } from '../../theme/spacing';
import { fontSize, fontWeight } from '../../theme/typography';
import type { Character } from '../../types/character';
import type { CharacterStatus } from '../../types/progress';

interface Props {
  characters: Character[];
  onCharacterPress: (character: Character) => void;
  showPinyin?: boolean;
  statusMap?: Map<number, CharacterStatus>;
  onRefresh?: () => void;
  refreshing?: boolean;
  scrollEnabled?: boolean;
  loading?: boolean;
}

export function CharacterGrid({
  characters,
  onCharacterPress,
  showPinyin = true,
  statusMap,
  onRefresh,
  refreshing = false,
  scrollEnabled = true,
  loading = false,
}: Props) {
  const { colors } = useTheme();

  const renderItem = useCallback(
    ({ item }: { item: Character }) => (
      <CharacterCard
        character={item}
        onPress={onCharacterPress}
        showPinyin={showPinyin}
        status={statusMap?.get(item.id)}
      />
    ),
    [onCharacterPress, showPinyin, statusMap]
  );

  const keyExtractor = useCallback((item: Character) => String(item.id), []);

  if (loading) {
    return (
      <View style={styles.empty}>
        <Text style={{ color: colors.textSecondary, fontSize: fontSize.body }}>Loading…</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={characters}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      numColumns={4}
      scrollEnabled={scrollEnabled}
      onRefresh={onRefresh}
      refreshing={refreshing}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={{ color: colors.textSecondary, fontSize: fontSize.body }}>
            No characters found.
          </Text>
        </View>
      }
      ListHeaderComponent={
        characters.length > 0 ? (
          <Text style={[styles.count, { color: colors.textSecondary }]}>
            {characters.length} characters
          </Text>
        ) : null
      }
      contentContainerStyle={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xs,
    paddingBottom: spacing.xl,
  },
  count: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.sm,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.huge,
  },
});

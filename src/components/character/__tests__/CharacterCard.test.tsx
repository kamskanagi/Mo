import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CharacterCard } from '../CharacterCard';
import type { Character } from '../../../types/character';

jest.mock('../../../theme', () => ({
  useTheme: () => ({
    colors: {
      surface: '#FFFFFF', border: 'rgba(0,0,0,0.07)', text: '#1C1917',
      textSecondary: '#78716C', red: '#B91C1C', teal: '#0F766E',
      green: '#15803D', gold: '#A16207', tealSoft: '#F0FDFA',
    },
    isDark: false,
  }),
}));

const mockChar: Character = {
  id: 1,
  character: '一',
  simplified: null,
  pinyin: 'yī',
  tone: 1,
  keyword: 'one',
  definition: 'one; a, an; alone',
  examples: ['一點', '一些'],
  examplePinyin: ['yīdiǎn', 'yīxiē'],
  strokeCount: 1,
  frequency: 1,
  week: 1,
  day: 1,
};

describe('CharacterCard', () => {
  it('displays the character', () => {
    const { getByText } = render(<CharacterCard character={mockChar} onPress={() => {}} />);
    expect(getByText('一')).toBeTruthy();
  });

  it('displays the keyword', () => {
    const { getByText } = render(<CharacterCard character={mockChar} onPress={() => {}} />);
    expect(getByText('one')).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByText } = render(<CharacterCard character={mockChar} onPress={onPress} />);
    fireEvent.press(getByText('一'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});

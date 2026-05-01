import React from 'react';
import { render } from '@testing-library/react-native';
import { PinyinText } from '../PinyinText';

jest.mock('../../../theme', () => ({
  useTheme: () => ({ colors: { red: '#B91C1C' }, isDark: false }),
}));

describe('PinyinText', () => {
  it('renders pinyin string', () => {
    const { getByText } = render(<PinyinText pinyin="nǐ hǎo" />);
    expect(getByText('nǐ hǎo')).toBeTruthy();
  });
});

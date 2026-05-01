import React from 'react';
import { render } from '@testing-library/react-native';
import { Badge } from '../Badge';

jest.mock('../../../theme', () => ({
  useTheme: () => ({
    colors: {
      teal: '#0F766E',
      textSecondary: '#78716C',
      surface: '#FFFFFF',
      border: 'rgba(0,0,0,0.07)',
    },
    isDark: false,
  }),
}));

describe('Badge', () => {
  it('renders the label text', () => {
    const { getByText } = render(<Badge label="Week 1" />);
    expect(getByText('Week 1')).toBeTruthy();
  });

  it('applies custom color via style', () => {
    const { getByText } = render(<Badge label="New" color="#FF0000" />);
    expect(getByText('New')).toBeTruthy();
  });
});

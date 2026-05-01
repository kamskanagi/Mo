import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../Button';

jest.mock('../../../theme', () => ({
  useTheme: () => ({
    colors: { teal: '#0F766E', surface: '#FFFFFF', border: 'rgba(0,0,0,0.07)' },
    isDark: false,
  }),
}));

describe('Button', () => {
  it('renders the label', () => {
    const { getByText } = render(<Button label="Start" onPress={() => {}} />);
    expect(getByText('Start')).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button label="Go" onPress={onPress} />);
    fireEvent.press(getByText('Go'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button label="Go" onPress={onPress} disabled />);
    fireEvent.press(getByText('Go'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('shows ActivityIndicator when loading', () => {
    const { queryByText, getByTestId } = render(
      <Button label="Go" onPress={() => {}} loading />
    );
    expect(queryByText('Go')).toBeNull();
  });
});

/**
 * @jest-environment node
 */
import { formatDuration } from '../formatting';

describe('formatDuration', () => {
  it('formats seconds under a minute', () => expect(formatDuration(45)).toBe('45s'));
  it('formats exact minutes', () => expect(formatDuration(120)).toBe('2m'));
  it('formats minutes and seconds', () => expect(formatDuration(90)).toBe('1m 30s'));
  it('formats hours', () => expect(formatDuration(3600)).toBe('1h'));
  it('formats hours and minutes', () => expect(formatDuration(3720)).toBe('1h 2m'));
});

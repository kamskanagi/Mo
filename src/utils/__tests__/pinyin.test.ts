/**
 * @jest-environment node
 */
import { stripToneMarks, getToneNumber } from '../pinyin';

describe('stripToneMarks', () => {
  it('strips tone 1 marks', () => expect(stripToneMarks('māo')).toBe('mao'));
  it('strips tone 2 marks', () => expect(stripToneMarks('máo')).toBe('mao'));
  it('strips tone 3 marks', () => expect(stripToneMarks('mǎo')).toBe('mao'));
  it('strips tone 4 marks', () => expect(stripToneMarks('mào')).toBe('mao'));
  it('leaves neutral tone unchanged', () => expect(stripToneMarks('ma')).toBe('ma'));
  it('strips multi-syllable pinyin', () => expect(stripToneMarks('nǐ hǎo')).toBe('ni hao'));
  it('handles ü vowels', () => expect(stripToneMarks('lǖ')).toBe('lu'));
});

describe('getToneNumber', () => {
  it('returns 1 for tone 1 vowels', () => expect(getToneNumber('māo')).toBe(1));
  it('returns 2 for tone 2 vowels', () => expect(getToneNumber('máo')).toBe(2));
  it('returns 3 for tone 3 vowels', () => expect(getToneNumber('mǎo')).toBe(3));
  it('returns 4 for tone 4 vowels', () => expect(getToneNumber('mào')).toBe(4));
  it('returns 5 for neutral tone', () => expect(getToneNumber('ma')).toBe(5));
});

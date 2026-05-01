const TONE_MAP: Record<string, number> = {
  āáǎà: 1, // placeholder — handled per-char below
};

const TONE1 = /[āēīōūǖ]/;
const TONE2 = /[áéíóúǘ]/;
const TONE3 = /[ǎěǐǒǔǚ]/;
const TONE4 = /[àèìòùǜ]/;

const STRIP_MAP: Record<string, string> = {
  ā: 'a', á: 'a', ǎ: 'a', à: 'a',
  ē: 'e', é: 'e', ě: 'e', è: 'e',
  ī: 'i', í: 'i', ǐ: 'i', ì: 'i',
  ō: 'o', ó: 'o', ǒ: 'o', ò: 'o',
  ū: 'u', ú: 'u', ǔ: 'u', ù: 'u',
  ǖ: 'u', ǘ: 'u', ǚ: 'u', ǜ: 'u',
};

export function stripToneMarks(pinyin: string): string {
  return pinyin.replace(/[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/g, (c) => STRIP_MAP[c] ?? c);
}

export function getToneNumber(pinyin: string): 1 | 2 | 3 | 4 | 5 {
  if (TONE1.test(pinyin)) return 1;
  if (TONE2.test(pinyin)) return 2;
  if (TONE3.test(pinyin)) return 3;
  if (TONE4.test(pinyin)) return 4;
  return 5;
}

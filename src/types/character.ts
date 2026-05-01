// src/types/character.ts

export interface Character {
  id: number;
  character: string;
  simplified: string | null;
  pinyin: string;
  tone: 1 | 2 | 3 | 4 | 5;
  keyword: string;
  definition: string;
  examples: string[];
  examplePinyin: string[];
  strokeCount: number;
  frequency: number;
  week: number;
  day: number;
}

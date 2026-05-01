// src/types/progress.ts

export type CharacterStatus = 'new' | 'seen' | 'learning' | 'reviewing' | 'mastered';

export interface CharacterProgress {
  characterId: number;
  status: CharacterStatus;
  correctCount: number;
  mistakeCount: number;
  writingMistakes: number;
  lastStudied: string | null;
  lastReviewed: string | null;
  nextReview: string | null;
  srsInterval: number;     // days until next review
  srsFactor: number;       // ease factor, default 2.5
}

export interface DailyStats {
  date: string;            // YYYY-MM-DD
  newCharactersStudied: number;
  reviewsCompleted: number;
  writingPracticed: number;
  timeSpentSeconds: number;
  streak: number;
}

export interface OverallProgress {
  total: number;
  new: number;
  seen: number;
  learning: number;
  reviewing: number;
  mastered: number;
}

export interface WeekProgress {
  week: number;
  total: number;
  studied: number;
  mastered: number;
}

export interface WeekDefinition {
  week: number;
  month: 1 | 2 | 3;
  topic: string;
  description: string;
  characterRange: [number, number];
}

export interface ConversationLine {
  speaker: 'A' | 'B';
  chinese: string;
  pinyin: string;
  english: string;
}

export interface Conversation {
  week: number;
  title: string;
  lines: ConversationLine[];
}

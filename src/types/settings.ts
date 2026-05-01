// src/types/settings.ts

export type ScriptPreference = 'traditional' | 'simplified' | 'both';
export type VoiceLocale = 'zh-TW' | 'zh-CN';
export type DarkMode = 'system' | 'light' | 'dark';
export type GridStyle = 'tian' | 'mi' | 'none'; // 田字格 / 米字格 / none

export interface AppSettings {
  script: ScriptPreference;
  voiceLocale: VoiceLocale;
  dailyGoal: 20 | 38 | 50;
  reviewLimit: number;
  darkMode: DarkMode;
  showPinyinByDefault: boolean;
  hapticFeedback: boolean;
  gridStyle: GridStyle;
}

export const DEFAULT_SETTINGS: AppSettings = {
  script: 'traditional',
  voiceLocale: 'zh-TW',
  dailyGoal: 38,
  reviewLimit: 50,
  darkMode: 'system',
  showPinyinByDefault: true,
  hapticFeedback: true,
  gridStyle: 'mi',
};

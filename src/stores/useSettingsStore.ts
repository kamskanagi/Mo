import { create } from 'zustand';
import { getAllSettings, setSetting } from '../db/queries';
import { DEFAULT_SETTINGS, type AppSettings } from '../types/settings';

interface SettingsState {
  settings: AppSettings;
}

interface SettingsActions {
  loadSettings: () => Promise<void>;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => Promise<void>;
  resetSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState & SettingsActions>((set) => ({
  settings: { ...DEFAULT_SETTINGS },

  loadSettings: async () => {
    const raw = await getAllSettings();
    const merged: AppSettings = { ...DEFAULT_SETTINGS };

    if (raw.script) merged.script = raw.script as AppSettings['script'];
    if (raw.voiceLocale) merged.voiceLocale = raw.voiceLocale as AppSettings['voiceLocale'];
    if (raw.dailyGoal) merged.dailyGoal = parseInt(raw.dailyGoal, 10) as AppSettings['dailyGoal'];
    if (raw.reviewLimit) merged.reviewLimit = parseInt(raw.reviewLimit, 10);
    if (raw.darkMode) merged.darkMode = raw.darkMode as AppSettings['darkMode'];
    if (raw.showPinyinByDefault) merged.showPinyinByDefault = raw.showPinyinByDefault === 'true';
    if (raw.hapticFeedback) merged.hapticFeedback = raw.hapticFeedback === 'true';
    if (raw.gridStyle) merged.gridStyle = raw.gridStyle as AppSettings['gridStyle'];

    set({ settings: merged });
  },

  updateSetting: async <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    set((state) => ({ settings: { ...state.settings, [key]: value } }));
    await setSetting(key, String(value));
  },

  resetSettings: async () => {
    set({ settings: { ...DEFAULT_SETTINGS } });
    const keys = Object.keys(DEFAULT_SETTINGS) as (keyof AppSettings)[];
    await Promise.all(keys.map((k) => setSetting(k, String(DEFAULT_SETTINGS[k]))));
  },
}));

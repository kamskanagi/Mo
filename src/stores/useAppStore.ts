import { create } from 'zustand';
import { initDatabase, isSeeded } from '../db/schema';
import { seedCharacters } from '../db/seed';
import { getSetting, setSetting } from '../db/queries';

interface AppState {
  isLoading: boolean;
  isOnboarded: boolean;
  currentWeek: number;
  currentDay: number;
  error: string | null;
}

interface AppActions {
  initialize: () => Promise<void>;
  setCurrentWeek: (week: number) => Promise<void>;
  advanceDay: () => Promise<void>;
  setError: (msg: string | null) => void;
  setOnboarded: (value: boolean) => Promise<void>;
}

export const useAppStore = create<AppState & AppActions>((set, get) => ({
  isLoading: true,
  isOnboarded: false,
  currentWeek: 1,
  currentDay: 1,
  error: null,

  initialize: async () => {
    try {
      const db = await initDatabase();

      const seeded = await isSeeded(db);
      if (!seeded) {
        await seedCharacters(db);
      }

      const [onboardedVal, weekVal, dayVal] = await Promise.all([
        getSetting('isOnboarded'),
        getSetting('currentWeek'),
        getSetting('currentDay'),
      ]);

      set({
        isOnboarded: onboardedVal === 'true',
        currentWeek: weekVal ? parseInt(weekVal, 10) : 1,
        currentDay: dayVal ? parseInt(dayVal, 10) : 1,
        isLoading: false,
        error: null,
      });
    } catch (e: any) {
      set({ isLoading: false, error: e?.message ?? 'Initialization failed' });
    }
  },

  setCurrentWeek: async (week: number) => {
    set({ currentWeek: week });
    await setSetting('currentWeek', String(week));
  },

  advanceDay: async () => {
    const next = Math.min(get().currentDay + 1, 84);
    const nextWeek = Math.ceil(next / 7);
    set({ currentDay: next, currentWeek: nextWeek });
    await Promise.all([
      setSetting('currentDay', String(next)),
      setSetting('currentWeek', String(nextWeek)),
    ]);
  },

  setError: (msg: string | null) => set({ error: msg }),

  setOnboarded: async (value: boolean) => {
    set({ isOnboarded: value });
    await setSetting('isOnboarded', String(value));
  },
}));

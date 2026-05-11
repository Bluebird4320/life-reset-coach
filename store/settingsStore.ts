import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

type Settings = {
  onboardingDone: boolean;
  notificationsEnabled: boolean;
  weeklyReviewEnabled: boolean;
  aiCoachEnabled: boolean;
  coachTone: 'gentle' | 'strict' | 'cheerful';
  reminderHour: number;
  reminderMinute: number;
};

type SettingsState = Settings & {
  loaded: boolean;
  load: () => Promise<void>;
  update: (patch: Partial<Settings>) => Promise<void>;
};

const DEFAULTS: Settings = {
  onboardingDone: false,
  notificationsEnabled: false,
  weeklyReviewEnabled: false,
  aiCoachEnabled: true,
  coachTone: 'gentle',
  reminderHour: 7,
  reminderMinute: 0,
};

const STORAGE_KEY = 'onestep_settings_v1';

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...DEFAULTS,
  loaded: false,

  load: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const saved: Partial<Settings> = raw ? JSON.parse(raw) : {};
      set({ ...DEFAULTS, ...saved, loaded: true });
    } catch {
      set({ loaded: true });
    }
  },

  update: async (patch) => {
    set(patch);
    try {
      const next = { ...get(), ...patch };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // 保存失敗しても state は更新済みなのでクラッシュさせない
    }
  },
}));

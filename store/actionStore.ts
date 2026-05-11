import { create } from 'zustand';
import { createTodayAction, getTodayAction, updateActionTitle } from '../db/queries';
import type { Action, ActionInsert } from '../db/schema';

type ActionState = {
  todayAction: Action | null;
  fetchTodayAction: (date: string) => Promise<void>;
  createAction: (data: ActionInsert) => Promise<void>;
  updateTitle: (id: string, title: string, targetMinutes: number) => Promise<void>;
};

export const useActionStore = create<ActionState>((set) => ({
  todayAction: null,

  fetchTodayAction: async (date) => {
    const action = await getTodayAction(date);
    set({ todayAction: action });
  },

  createAction: async (data) => {
    const action = await createTodayAction(data);
    set({ todayAction: action as Action });
  },

  updateTitle: async (id, title, targetMinutes) => {
    await updateActionTitle(id, title, targetMinutes);
    const action = await getTodayAction(new Date().toISOString().split('T')[0]);
    set({ todayAction: action });
  },
}));

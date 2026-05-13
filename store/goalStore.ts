import { create } from 'zustand';
import { getLatestGoal, saveGoal } from '../db/queries';
import type { Goal, GoalInsert } from '../db/schema';

type GoalState = {
  goal: Goal | null;
  loading: boolean;
  fetchGoal: () => Promise<void>;
  upsertGoal: (data: GoalInsert) => Promise<void>;
  reset: () => void;
};

export const useGoalStore = create<GoalState>((set) => ({
  goal: null,
  loading: false,

  fetchGoal: async () => {
    set({ loading: true });
    try {
      const goal = await getLatestGoal();
      set({ goal });
    } finally {
      set({ loading: false });
    }
  },

  upsertGoal: async (data) => {
    await saveGoal(data);
    const goal = await getLatestGoal();
    set({ goal });
  },

  reset: () => set({ goal: null }),
}));

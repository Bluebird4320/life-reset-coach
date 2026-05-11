import { create } from 'zustand';
import { getAllRecords, getTodayRecord, saveRecord, updateAiCoachMsg } from '../db/queries';
import type { Record, RecordInsert } from '../db/schema';

type RecordState = {
  todayRecord: Record | null;
  allRecords: Record[];
  fetchTodayRecord: (date: string) => Promise<void>;
  fetchAllRecords: () => Promise<void>;
  saveRecord: (data: RecordInsert) => Promise<void>;
  setAiCoachMsg: (recordId: string, msg: string) => Promise<void>;
};

export const useRecordStore = create<RecordState>((set, get) => ({
  todayRecord: null,
  allRecords: [],

  fetchTodayRecord: async (date) => {
    const rec = await getTodayRecord(date);
    set({ todayRecord: rec ?? null });
  },

  fetchAllRecords: async () => {
    const recs = await getAllRecords();
    set({ allRecords: recs });
  },

  saveRecord: async (data) => {
    await saveRecord(data);
    const rec = await getTodayRecord(data.date);
    set({ todayRecord: rec ?? null });
  },

  setAiCoachMsg: async (recordId, msg) => {
    await updateAiCoachMsg(recordId, msg);
    const { todayRecord } = get();
    if (todayRecord && todayRecord.id === recordId) {
      set({ todayRecord: { ...todayRecord, aiCoachMsg: msg } });
    }
  },
}));

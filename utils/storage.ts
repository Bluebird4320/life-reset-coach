import AsyncStorage from '@react-native-async-storage/async-storage';
import type { DailyLog, FutureVision } from '../types';

const FUTURE_VISION_KEY = 'future_vision';
const DAILY_LOGS_KEY = 'daily_logs';

// ── FutureVision ───────────────────────────────────────────────

export async function saveFutureVision(data: FutureVision): Promise<void> {
  await AsyncStorage.setItem(FUTURE_VISION_KEY, JSON.stringify(data));
}

export async function loadFutureVision(): Promise<FutureVision | null> {
  const raw = await AsyncStorage.getItem(FUTURE_VISION_KEY);
  if (!raw) return null;
  return JSON.parse(raw) as FutureVision;
}

// ── DailyLog ───────────────────────────────────────────────────

export async function loadAllLogs(): Promise<DailyLog[]> {
  const raw = await AsyncStorage.getItem(DAILY_LOGS_KEY);
  if (!raw) return [];
  return JSON.parse(raw) as DailyLog[];
}

export async function saveDailyLog(log: DailyLog): Promise<void> {
  const logs = await loadAllLogs();
  const idx = logs.findIndex((l) => l.date === log.date);
  if (idx >= 0) {
    logs[idx] = log;
  } else {
    logs.unshift(log); // 新しい順
  }
  await AsyncStorage.setItem(DAILY_LOGS_KEY, JSON.stringify(logs));
}

export async function loadTodayLog(): Promise<DailyLog | null> {
  const today = getTodayDateString();
  const logs = await loadAllLogs();
  return logs.find((l) => l.date === today) ?? null;
}

// ── Helpers ────────────────────────────────────────────────────

export function getTodayDateString(): string {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-');
}

export function makeFreshLog(date: string): DailyLog {
  return {
    date,
    focusArea: '',
    avoidToday: [],
    idealActionText: '',
    todayAction: '',
    actionCompleted: 'not_done',
    desiredActionsDone: [],
    avoidActionsDone: [],
    tomorrowFix: '',
    score: 50,
    status: 'neutral',
  };
}

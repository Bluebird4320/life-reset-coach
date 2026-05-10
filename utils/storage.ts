import AsyncStorage from '@react-native-async-storage/async-storage';
import type { DailyActionLog, DailyLog, FutureVision } from '../types';
import { getTodayKey } from './date';

const FUTURE_VISION_KEY = 'future_vision';
const DAILY_LOGS_KEY = 'daily_logs';
const ACTION_LOGS_KEY = 'LIFE_RESET_ACTION_LOGS';

// ── FutureVision ───────────────────────────────────────────────

export async function saveFutureVision(data: FutureVision): Promise<void> {
  await AsyncStorage.setItem(FUTURE_VISION_KEY, JSON.stringify(data));
}

export async function loadFutureVision(): Promise<FutureVision | null> {
  const raw = await AsyncStorage.getItem(FUTURE_VISION_KEY);
  if (!raw) return null;
  return JSON.parse(raw) as FutureVision;
}

// ── DailyLog (既存の朝/夜フロー) ──────────────────────────────

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
    logs.unshift(log);
  }
  await AsyncStorage.setItem(DAILY_LOGS_KEY, JSON.stringify(logs));
}

export async function loadTodayLog(): Promise<DailyLog | null> {
  const today = getTodayDateString();
  const logs = await loadAllLogs();
  return logs.find((l) => l.date === today) ?? null;
}

// ── DailyActionLog (最低限アクション) ─────────────────────────

export async function getActionLogs(): Promise<DailyActionLog[]> {
  const raw = await AsyncStorage.getItem(ACTION_LOGS_KEY);
  if (!raw) return [];
  return JSON.parse(raw) as DailyActionLog[];
}

export async function saveActionLogs(logs: DailyActionLog[]): Promise<void> {
  await AsyncStorage.setItem(ACTION_LOGS_KEY, JSON.stringify(logs));
}

export async function upsertActionLog(log: DailyActionLog): Promise<void> {
  const logs = await getActionLogs();
  const idx = logs.findIndex((l) => l.date === log.date);
  if (idx >= 0) {
    logs[idx] = { ...log, updatedAt: new Date().toISOString() };
  } else {
    logs.unshift(log);
  }
  await saveActionLogs(logs);
}

export async function saveTodayActionLog(log: DailyActionLog): Promise<void> {
  await upsertActionLog(log);
}

export async function getTodayActionLog(): Promise<DailyActionLog | null> {
  const today = getTodayKey();
  const logs = await getActionLogs();
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

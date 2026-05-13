import { desc, eq } from 'drizzle-orm';
import { db } from './client';
import { actions, goals, records, streaks } from './schema';
import type { ActionInsert, GoalInsert, RecordInsert } from './schema';

// ── ユーティリティ ─────────────────────────────────────────
function nowISO(): string {
  return new Date().toISOString();
}

// ── Goals ──────────────────────────────────────────────────

/** 最新の目標を1件取得 */
export async function getLatestGoal() {
  const rows = await db.select().from(goals).orderBy(desc(goals.createdAt)).limit(1);
  return rows[0] ?? null;
}

/** 目標を作成（既存があれば上書き） */
export async function saveGoal(data: GoalInsert): Promise<void> {
  const existing = await getLatestGoal();
  if (existing) {
    await db.update(goals).set({ ...data, updatedAt: nowISO() }).where(eq(goals.id, existing.id));
  } else {
    await db.insert(goals).values(data);
  }
}

// ── Actions ────────────────────────────────────────────────

/** 今日のアクションを取得 */
export async function getTodayAction(date: string) {
  const rows = await db.select().from(actions).where(eq(actions.date, date)).limit(1);
  return rows[0] ?? null;
}

/** 今日のアクションを作成（既存があればスキップ） */
export async function createTodayAction(data: ActionInsert) {
  const existing = await getTodayAction(data.date);
  if (existing) return existing;
  await db.insert(actions).values(data);
  return data;
}

/** アクションタイトルを更新 */
export async function updateActionTitle(id: string, title: string, targetMinutes: number): Promise<void> {
  await db.update(actions).set({ title, targetMinutes }).where(eq(actions.id, id));
}

// ── Records ────────────────────────────────────────────────

/** 今日の記録を取得 */
export async function getTodayRecord(date: string) {
  const rows = await db.select().from(records).where(eq(records.date, date)).limit(1);
  return rows[0] ?? null;
}

/** 記録を保存（既存があれば上書き）。実際に使われた record ID を返す */
export async function saveRecord(data: RecordInsert): Promise<string> {
  const existing = await getTodayRecord(data.date);
  if (existing) {
    // ID と createdAt はそのまま維持し、他フィールドだけ更新
    const { id: _id, createdAt: _createdAt, ...updateFields } = data;
    await db.update(records).set(updateFields).where(eq(records.id, existing.id));
    return existing.id;
  }
  await db.insert(records).values(data);
  return data.id;
}

/** AIコーチメッセージを更新 */
export async function updateAiCoachMsg(recordId: string, msg: string): Promise<void> {
  await db.update(records).set({ aiCoachMsg: msg }).where(eq(records.id, recordId));
}

/** 全記録を新しい順で取得 */
export async function getAllRecords() {
  return db.select().from(records).orderBy(desc(records.date));
}

/** 期間内の記録を取得 */
export async function getRecordsBetween(from: string, to: string) {
  const all = await getAllRecords();
  return all.filter((r) => r.date >= from && r.date <= to);
}

// ── 全データ削除 ────────────────────────────────────────────

/** 全テーブルのデータを削除する */
export async function deleteAllData(): Promise<void> {
  await db.delete(records);
  await db.delete(actions);
  await db.delete(goals);
  await db.delete(streaks);
}

// ── Streaks ─────────────────────────────────────────────────

const STREAK_ID = 'singleton';

/** ストリークを取得 */
export async function getStreak() {
  const rows = await db.select().from(streaks).where(eq(streaks.id, STREAK_ID)).limit(1);
  return rows[0] ?? null;
}

/** ストリークを更新（記録保存後に呼ぶ） */
export async function updateStreak(date: string, isSuccess: boolean): Promise<void> {
  const now = nowISO();
  const current = await getStreak();

  if (!current) {
    // 初回作成
    await db.insert(streaks).values({
      id: STREAK_ID,
      currentStreak: isSuccess ? 1 : 0,
      longestStreak: isSuccess ? 1 : 0,
      lastRecordDate: date,
      updatedAt: now,
    });
    return;
  }

  // 同じ日に再保存した場合はスキップ
  if (current.lastRecordDate === date) return;

  const yesterday = (() => {
    const d = new Date(date);
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  })();

  const isConsecutive = current.lastRecordDate === yesterday;
  const newCurrent = isSuccess
    ? (isConsecutive ? (current.currentStreak ?? 0) + 1 : 1)
    : 0;
  const newLongest = Math.max(current.longestStreak ?? 0, newCurrent);

  await db.update(streaks).set({
    currentStreak: newCurrent,
    longestStreak: newLongest,
    lastRecordDate: date,
    updatedAt: now,
  }).where(eq(streaks.id, STREAK_ID));
}

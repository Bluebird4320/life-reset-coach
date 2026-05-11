import type { Record } from '../db/schema';

export interface StreakResult {
  current: number;
  longest: number;
  lastDate: string;
}

/**
 * 記録配列からストリーク情報を計算する
 * - done / partial は達成としてカウント
 * - failed または記録なしでリセット
 * - 当日まだ記録なしの場合は前日までのカウントを返す
 */
export function calcStreak(records: Record[]): StreakResult {
  if (records.length === 0) {
    return { current: 0, longest: 0, lastDate: '' };
  }

  // 日付でソート（古い順）
  const sorted = [...records].sort((a, b) => a.date.localeCompare(b.date));

  let current = 0;
  let longest = 0;
  let streak = 0;
  let lastDate = '';

  for (let i = 0; i < sorted.length; i++) {
    const rec = sorted[i];
    const isSuccess = rec.status === 'done' || rec.status === 'partial';

    if (!isSuccess) {
      // 失敗でリセット
      streak = 0;
      continue;
    }

    if (i === 0) {
      streak = 1;
    } else {
      // 前日かどうかを確認
      const prev = new Date(sorted[i - 1].date);
      const curr = new Date(rec.date);
      prev.setDate(prev.getDate() + 1);
      const isConsecutive =
        prev.toISOString().split('T')[0] === rec.date ||
        sorted[i - 1].date === rec.date; // 同日は無視

      if (sorted[i - 1].date === rec.date) {
        // 同日の記録は無視
        continue;
      }
      streak = isConsecutive ? streak + 1 : 1;
    }

    longest = Math.max(longest, streak);
    lastDate = rec.date;
  }

  current = streak;
  return { current, longest, lastDate };
}

import { format, subDays } from 'date-fns';
import { ja } from 'date-fns/locale';

/** YYYY-MM-DD 形式で今日の日付を返す */
export function getTodayKey(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

/** 日本語日付表示 例: 5月11日(日) */
export function formatDateJa(dateStr: string): string {
  return format(new Date(dateStr), 'M月d日(E)', { locale: ja });
}

/** 秒を HH:MM:SS 形式にフォーマット */
export function formatSeconds(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/** 秒を「x分」「x時間y分」形式に変換 */
export function formatMinutes(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  if (minutes < 60) return `${minutes}分`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}時間${m}分` : `${h}時間`;
}

/** 直近n日の日付文字列配列を返す（古い順） */
export function getLastNDays(n: number): string[] {
  return Array.from({ length: n }, (_, i) =>
    format(subDays(new Date(), n - 1 - i), 'yyyy-MM-dd')
  );
}

/** 曜日ラベルを返す 例: 月 */
export function getDayLabel(dateStr: string): string {
  return format(new Date(dateStr), 'E', { locale: ja });
}

/** 当月の全日付（YYYY-MM-DD）を古い順で返す */
export function getCurrentMonthDays(): string[] {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: daysInMonth }, (_, i) =>
    format(new Date(year, month, i + 1), 'yyyy-MM-dd')
  );
}

/** 日付配列を7日ごとの週グループに分割する */
export function groupDaysByWeek(
  days: string[]
): { label: string; dates: string[] }[] {
  const groups: { label: string; dates: string[] }[] = [];
  for (let i = 0; i < days.length; i += 7) {
    groups.push({ label: `W${Math.floor(i / 7) + 1}`, dates: days.slice(i, i + 7) });
  }
  return groups;
}

/** 当年の各月（YYYY-MM）を1月〜当月分だけ返す */
export function getCurrentYearMonths(): string[] {
  const now = new Date();
  const year = now.getFullYear();
  const currentMonth = now.getMonth();
  return Array.from({ length: currentMonth + 1 }, (_, i) =>
    format(new Date(year, i, 1), 'yyyy-MM')
  );
}

/** 月ラベル 例: "2026-05" → "5月" */
export function getMonthLabel(yearMonth: string): string {
  const [, m] = yearMonth.split('-');
  return `${parseInt(m, 10)}月`;
}

/** "2026年5月" 形式の当月タイトル */
export function getCurrentMonthTitle(): string {
  return format(new Date(), 'yyyy年M月', { locale: ja });
}

/** "2026年" 形式の当年タイトル */
export function getCurrentYearTitle(): string {
  return format(new Date(), 'yyyy年');
}

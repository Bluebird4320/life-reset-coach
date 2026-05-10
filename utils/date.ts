export function getTodayKey(): string {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-');
}

export function getLastNDays(n: number): string[] {
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push([
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, '0'),
      String(d.getDate()).padStart(2, '0'),
    ].join('-'));
  }
  return days;
}

export function getLast12Months(): string[] {
  const months: string[] = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push([
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, '0'),
    ].join('-'));
  }
  return months;
}

export function formatMinutes(minutes: number): string {
  if (minutes <= 0) return '0分';
  if (minutes < 60) return `${minutes}分`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}時間${m}分` : `${h}時間`;
}

export function getDayLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
  const day = parseInt(dateStr.split('-')[2], 10);
  return `${day}(${dayNames[d.getDay()]})`;
}

export function getMonthLabel(yearMonth: string): string {
  return parseInt(yearMonth.split('-')[1], 10) + '月';
}

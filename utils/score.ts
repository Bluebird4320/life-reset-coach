import type { CharacterStatus, DailyActionLog, DailyLog } from '../types';

// ── 既存スコア (DailyLog / 朝夜フロー) ───────────────────────

export function getCharacterStatus(score: number): CharacterStatus {
  if (score >= 70) return 'angel';
  if (score >= 40) return 'neutral';
  return 'devil';
}

type ScoreInput = Pick<
  DailyLog,
  'actionCompleted' | 'desiredActionsDone' | 'avoidActionsDone' | 'tomorrowFix'
>;

export type ScoreBreakdown = {
  base: number;
  actionBonus: number;
  desiredBonus: number;
  avoidPenalty: number;
  tomorrowBonus: number;
  total: number;
};

export function calculateScore(input: ScoreInput): ScoreBreakdown {
  const base = 50;

  let actionBonus = 0;
  if (input.actionCompleted === 'done') actionBonus = 25;
  else if (input.actionCompleted === 'partial') actionBonus = 10;
  else actionBonus = -20;

  const desiredBonus = input.desiredActionsDone.length * 10;
  const avoidPenalty = input.avoidActionsDone.length * 15;
  const tomorrowBonus = input.tomorrowFix.trim() ? 10 : 0;

  const raw = base + actionBonus + desiredBonus - avoidPenalty + tomorrowBonus;
  const total = Math.max(0, Math.min(100, raw));

  return { base, actionBonus, desiredBonus, avoidPenalty, tomorrowBonus, total };
}

// ── 最低限アクションスコア (DailyActionLog) ───────────────────

export function getStatusTypeFromScore(score: number): CharacterStatus {
  if (score >= 70) return 'angel';
  if (score >= 40) return 'neutral';
  return 'devil';
}

export function calculateActionScore(log: DailyActionLog): number {
  let score = 50;

  // 加点
  if (log.actionTitle.trim()) score += 10;        // アクション設定済み
  if (log.status === 'done') score += 25;
  else if (log.status === 'partial') score += 10;
  if (log.actualMinutes >= 5) score += 10;
  if (log.actualMinutes >= log.plannedMinutes && log.plannedMinutes > 0) score += 10;
  if (log.reflectionText.trim()) score += 10;
  if (log.nextFixText.trim()) score += 10;

  // 減点
  if (log.status === 'not_done') score -= 20;
  if (log.actualMinutes === 0) score -= 10;

  return Math.max(0, Math.min(100, score));
}

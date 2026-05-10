import type { CharacterStatus, DailyLog } from '../types';

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

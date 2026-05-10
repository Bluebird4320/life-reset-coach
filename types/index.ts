export type FutureVision = {
  idealFuture: string;
  idealSelf: string;
  desiredActions: string[];
  avoidActions: string[];
};

export type CharacterStatus = 'angel' | 'neutral' | 'devil';

export type ActionCompleted = 'done' | 'partial' | 'not_done';

export type DailyLog = {
  date: string; // YYYY-MM-DD
  focusArea: string;
  avoidToday: string[];
  idealActionText: string;
  todayAction: string;
  actionCompleted: ActionCompleted;
  desiredActionsDone: string[];
  avoidActionsDone: string[];
  tomorrowFix: string;
  score: number;
  status: CharacterStatus;
};

// ── 最低限アクション ────────────────────────────────────────────

export type ActionStatus = 'done' | 'partial' | 'not_done';

export type DailyActionLog = {
  id: string;
  date: string; // YYYY-MM-DD

  actionTitle: string;
  actionReason: string;

  plannedMinutes: number;
  actualMinutes: number;

  status: ActionStatus;

  reflectionText: string;
  blockerText: string;
  nextFixText: string;

  score: number;
  statusType: CharacterStatus;

  createdAt: string;
  updatedAt: string;
};

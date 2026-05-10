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

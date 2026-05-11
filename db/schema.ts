import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const goals = sqliteTable('goals', {
  id: text('id').primaryKey(),
  vision: text('vision').notNull(),
  category: text('category').notNull(),
  increaseActions: text('increase_actions'),
  decreaseActions: text('decrease_actions'),
  deadline: text('deadline'),
  dailyMinutes: integer('daily_minutes').default(15),
  progressPct: real('progress_pct').default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const actions = sqliteTable('actions', {
  id: text('id').primaryKey(),
  goalId: text('goal_id').notNull(),
  date: text('date').notNull(),
  title: text('title').notNull(),
  targetMinutes: integer('target_minutes').default(15),
  createdAt: text('created_at').notNull(),
});

export const records = sqliteTable('records', {
  id: text('id').primaryKey(),
  actionId: text('action_id').notNull(),
  date: text('date').notNull(),
  elapsedSeconds: integer('elapsed_seconds').default(0),
  status: text('status').notNull(),
  mood: text('mood'),
  memo: text('memo'),
  nextAction: text('next_action'),
  aiCoachMsg: text('ai_coach_msg'),
  createdAt: text('created_at').notNull(),
});

export const streaks = sqliteTable('streaks', {
  id: text('id').primaryKey(),
  currentStreak: integer('current_streak').default(0),
  longestStreak: integer('longest_streak').default(0),
  lastRecordDate: text('last_record_date'),
  updatedAt: text('updated_at').notNull(),
});

// 型エクスポート
export type Goal = typeof goals.$inferSelect;
export type GoalInsert = typeof goals.$inferInsert;
export type Action = typeof actions.$inferSelect;
export type ActionInsert = typeof actions.$inferInsert;
export type Record = typeof records.$inferSelect;
export type RecordInsert = typeof records.$inferInsert;
export type Streak = typeof streaks.$inferSelect;

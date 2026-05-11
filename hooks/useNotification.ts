import { useEffect } from 'react';
import {
  scheduleReminder,
  scheduleStreakWarning,
  scheduleWeeklyReview,
} from '../lib/notifications';
import { useSettingsStore } from '../store/settingsStore';

export function useNotification() {
  const { notificationsEnabled, weeklyReviewEnabled, reminderHour, reminderMinute } =
    useSettingsStore();

  // 設定変更時に通知を再スケジュール
  useEffect(() => {
    if (!notificationsEnabled) return;
    scheduleReminder(reminderHour, reminderMinute).catch(() => {});
    scheduleStreakWarning().catch(() => {});
  }, [notificationsEnabled, reminderHour, reminderMinute]);

  useEffect(() => {
    if (!weeklyReviewEnabled) return;
    scheduleWeeklyReview(20, 0).catch(() => {});
  }, [weeklyReviewEnabled]);
}

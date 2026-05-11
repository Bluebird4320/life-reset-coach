import * as Notifications from 'expo-notifications';

// 通知ハンドラ設定
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/** 通知許可を確認し、未許可なら申請する */
export async function requestPermission(): Promise<boolean> {
  const { status } = await Notifications.getPermissionsAsync();
  if (status === 'granted') return true;
  const { status: newStatus } = await Notifications.requestPermissionsAsync();
  return newStatus === 'granted';
}

/** 毎日リマインダー通知をスケジュール */
export async function scheduleReminder(hour: number, minute: number): Promise<void> {
  const allowed = await requestPermission();
  if (!allowed) return;

  // 既存の daily-reminder をキャンセルして再設定
  await cancelByIdentifier('daily-reminder');

  await Notifications.scheduleNotificationAsync({
    identifier: 'daily-reminder',
    content: {
      title: '今日の一歩を踏み出そう！',
      body: '今日の最低限アクションを記録しましょう 🎯',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

/** 毎週日曜日のレビュー通知をスケジュール */
export async function scheduleWeeklyReview(hour: number, minute: number): Promise<void> {
  const allowed = await requestPermission();
  if (!allowed) return;

  await cancelByIdentifier('weekly-review');

  await Notifications.scheduleNotificationAsync({
    identifier: 'weekly-review',
    content: {
      title: '今週の振り返りをしよう',
      body: '1週間の積み上げを確認しましょう 📊',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday: 1, // 日曜日
      hour,
      minute,
    },
  });
}

/** 当日未記録の場合のストリーク警告通知（当日22時） */
export async function scheduleStreakWarning(): Promise<void> {
  const allowed = await requestPermission();
  if (!allowed) return;

  await cancelByIdentifier('streak-warning');

  const now = new Date();
  const target = new Date(now);
  target.setHours(22, 0, 0, 0);

  // 既に22時を過ぎている場合はスキップ
  if (target <= now) return;

  await Notifications.scheduleNotificationAsync({
    identifier: 'streak-warning',
    content: {
      title: 'ストリークが途切れそうです！',
      body: '今日の記録がまだです。少しだけ行動してみましょう 🔥',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: target,
    },
  });
}

/** 特定 identifier の通知をキャンセル */
async function cancelByIdentifier(id: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch {
    // 存在しない場合もエラーにしない
  }
}

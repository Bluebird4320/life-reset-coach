import { router } from 'expo-router';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Card } from '../../components/ui/Card';
import { Toggle } from '../../components/ui/Toggle';
import { Colors, Radius, Spacing } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { deleteAllData } from '../../db/queries';
import { useActionStore } from '../../store/actionStore';
import { useGoalStore } from '../../store/goalStore';
import { useRecordStore } from '../../store/recordStore';
import { useSettingsStore } from '../../store/settingsStore';

export default function SettingsScreen() {
  const { goal, reset: resetGoal } = useGoalStore();
  const { reset: resetAction } = useActionStore();
  const { reset: resetRecord } = useRecordStore();
  const {
    notificationsEnabled,
    weeklyReviewEnabled,
    aiCoachEnabled,
    update,
  } = useSettingsStore();

  const handleDeleteData = () => {
    Alert.alert(
      'データを削除しますか？',
      'すべての記録・目標・設定が削除されます。この操作は元に戻せません。',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除する',
          style: 'destructive',
          onPress: async () => {
            try {
              // DB の全テーブルを削除
              await deleteAllData();
              // メモリ上の store もリセット
              resetGoal();
              resetAction();
              resetRecord();
              // onboarding フラグをリセット
              await update({ onboardingDone: false });
              router.replace('/(auth)/onboarding');
            } catch (e) {
              console.error('Delete all data error:', e);
              Alert.alert('エラー', 'データの削除に失敗しました。もう一度お試しください。');
            }
          },
        },
      ]
    );
  };

  const renderRow = (label: string, onPress: () => void) => (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>設定</Text>

        {/* 通知 */}
        <SectionCard title="通知">
          <Toggle
            label="リマインダー通知"
            description="毎日のアクションリマインダー"
            value={notificationsEnabled}
            onValueChange={(v) => update({ notificationsEnabled: v })}
          />
          <View style={styles.divider} />
          <Toggle
            label="週次レビュー通知"
            description="毎週日曜に振り返りを促す"
            value={weeklyReviewEnabled}
            onValueChange={(v) => update({ weeklyReviewEnabled: v })}
          />
        </SectionCard>

        {/* AIコーチ */}
        <SectionCard title="AIコーチ">
          <Toggle
            label="AIコーチ表示"
            description="記録後にAIのフィードバックを表示"
            value={aiCoachEnabled}
            onValueChange={(v) => update({ aiCoachEnabled: v })}
          />
          {/* TODO: Phase 2 でコーチのトーン設定を追加 */}
          <View style={styles.divider} />
          {renderRow('コーチのトーンを変更', () => {
            Alert.alert('近日公開', 'この機能は近日追加予定です');
          })}
        </SectionCard>

        {/* 目標・習慣 */}
        <SectionCard title="目標・習慣">
          {goal ? (
            <View style={styles.goalPreview}>
              <Text style={styles.goalVision} numberOfLines={2}>{goal.vision}</Text>
              <Text style={styles.goalMeta}>毎日 {goal.dailyMinutes}分</Text>
            </View>
          ) : null}
          {renderRow('ビジョンを編集', () => router.push('/(auth)/goal-setup'))}
          <View style={styles.divider} />
          {renderRow('増やしたい行動を編集', () => router.push('/(auth)/goal-setup'))}
          <View style={styles.divider} />
          {renderRow('減らしたい行動を編集', () => router.push('/(auth)/goal-setup'))}
        </SectionCard>

        {/* アプリ */}
        <SectionCard title="アプリ">
          {renderRow('テーマ（近日公開）', () => Alert.alert('近日公開', 'ダークモードは近日追加予定です'))}
          <View style={styles.divider} />
          {renderRow('週次レビュー（近日公開）', () => Alert.alert('近日公開', 'この機能は近日追加予定です'))}
        </SectionCard>

        {/* アカウント */}
        <SectionCard title="アカウント">
          {renderRow('データをエクスポート（近日公開）', () =>
            Alert.alert('近日公開', 'CSV エクスポートは近日追加予定です')
          )}
          <View style={styles.divider} />
          <TouchableOpacity style={styles.dangerRow} onPress={handleDeleteData} activeOpacity={0.7}>
            <Text style={styles.dangerLabel}>データをすべて削除</Text>
          </TouchableOpacity>
        </SectionCard>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={sectionStyles.wrapper}>
      <Text style={sectionStyles.title}>{title}</Text>
      <Card style={sectionStyles.card}>{children}</Card>
    </View>
  );
}

const sectionStyles = StyleSheet.create({
  wrapper: { gap: Spacing.xs },
  title: {
    ...Typography.label,
    marginLeft: Spacing.xs,
  },
  card: { gap: 0 },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: 40,
    gap: Spacing.lg,
  },
  title: { ...Typography.screenTitle },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.xs,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  rowLabel: { fontSize: 14, color: Colors.primaryDark },
  chevron: { fontSize: 20, color: Colors.textMuted },
  dangerRow: { paddingVertical: Spacing.sm },
  dangerLabel: { fontSize: 14, color: Colors.danger },
  goalPreview: {
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: 4,
    marginBottom: Spacing.sm,
  },
  goalVision: { fontSize: 13, fontWeight: '600', color: Colors.primaryDark, lineHeight: 20 },
  goalMeta: { ...Typography.caption },
});

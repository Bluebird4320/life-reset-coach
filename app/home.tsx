import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Card } from '../components/Card';
import { FutureCompassCard } from '../components/FutureCompassCard';
import { PrimaryButton } from '../components/PrimaryButton';
import type { DailyActionLog, DailyLog, FutureVision } from '../types';
import { formatMinutes } from '../utils/date';
import { getTodayActionLog, loadFutureVision, loadTodayLog } from '../utils/storage';

const STATUS_LABEL: Record<string, string> = {
  done: '✅ できた',
  partial: '🌓 少しできた',
  not_done: '😔 未振り返り',
};

export default function HomeScreen() {
  const [vision, setVision] = useState<FutureVision | null>(null);
  const [todayLog, setTodayLog] = useState<DailyLog | null>(null);
  const [actionLog, setActionLog] = useState<DailyActionLog | null>(null);

  useFocusEffect(
    useCallback(() => {
      Promise.all([loadFutureVision(), loadTodayLog(), getTodayActionLog()]).then(
        ([v, log, aLog]) => {
          setVision(v);
          setTodayLog(log);
          setActionLog(aLog);
        }
      );
    }, [])
  );

  // DailyActionLog のスコアを優先、なければ DailyLog、なければ 50
  const compassScore = actionLog?.score ?? todayLog?.score ?? 50;

  const morningDone = !!todayLog?.focusArea;
  const nightDone =
    !!todayLog &&
    (todayLog.tomorrowFix !== '' ||
      todayLog.desiredActionsDone.length > 0 ||
      todayLog.avoidActionsDone.length > 0 ||
      todayLog.actionCompleted === 'done' ||
      todayLog.actionCompleted === 'partial');

  const actionReviewed = !!actionLog && actionLog.status !== 'not_done';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* ヘッダー */}
        <View style={styles.header}>
          <Text style={styles.greeting}>今日もリセット 🌅</Text>
          <Text style={styles.date}>{formatDate(new Date())}</Text>
        </View>

        {/* Future Compass Card */}
        <FutureCompassCard score={compassScore} />

        {/* 今日の最低限アクション */}
        {actionLog ? (
          <Card style={styles.actionCard}>
            <Text style={styles.sectionLabel}>⚡ 今日の最低限アクション</Text>
            <Text style={styles.actionTitle}>{actionLog.actionTitle}</Text>
            {actionLog.actionReason ? (
              <Text style={styles.actionReason}>{actionLog.actionReason}</Text>
            ) : null}
            <View style={styles.actionMeta}>
              <View style={styles.actionMetaItem}>
                <Text style={styles.actionMetaLabel}>予定</Text>
                <Text style={styles.actionMetaValue}>
                  {formatMinutes(actionLog.plannedMinutes)}
                </Text>
              </View>
              {actionLog.actualMinutes > 0 && (
                <View style={styles.actionMetaItem}>
                  <Text style={styles.actionMetaLabel}>実績</Text>
                  <Text style={[styles.actionMetaValue, { color: '#4A90E2' }]}>
                    {formatMinutes(actionLog.actualMinutes)}
                  </Text>
                </View>
              )}
              {actionReviewed && (
                <View style={styles.actionMetaItem}>
                  <Text style={styles.actionMetaLabel}>状態</Text>
                  <Text style={styles.actionMetaValue}>{STATUS_LABEL[actionLog.status]}</Text>
                </View>
              )}
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.actionSubBtn}
                onPress={() => router.push('/action-review')}
                activeOpacity={0.7}
              >
                <Text style={styles.actionSubBtnText}>
                  {actionReviewed ? '振り返りを更新' : '振り返る →'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionSubBtn, styles.actionSubBtnGhost]}
                onPress={() => router.push('/today-action')}
                activeOpacity={0.7}
              >
                <Text style={styles.actionSubBtnGhostText}>行動を変更</Text>
              </TouchableOpacity>
            </View>
          </Card>
        ) : (
          <Card style={styles.noActionCard}>
            <Text style={styles.noActionEmoji}>🎯</Text>
            <Text style={styles.noActionText}>今日の最低限アクションを決めましょう</Text>
            <Text style={styles.noActionHint}>最小の一歩が未来を変えます</Text>
            <PrimaryButton
              label="行動を決める →"
              onPress={() => router.push('/today-action')}
              style={styles.noActionBtn}
            />
          </Card>
        )}

        {/* 今日の進捗バッジ */}
        <View style={styles.progressRow}>
          <StatusBadge label="☀️ 朝リセット" done={morningDone} />
          <StatusBadge label="🌙 夜の振り返り" done={nightDone} />
        </View>

        {/* 叶えたい将来 */}
        {vision && (
          <Card style={styles.visionCard}>
            <Text style={styles.sectionLabel}>🎯 叶えたい将来</Text>
            <Text style={styles.visionText}>{vision.idealFuture}</Text>
            {vision.idealSelf ? (
              <>
                <Text style={[styles.sectionLabel, { marginTop: 10 }]}>✨ 近づきたい自分</Text>
                <Text style={styles.visionText}>{vision.idealSelf}</Text>
              </>
            ) : null}
          </Card>
        )}

        {/* ボタン群 */}
        <View style={styles.buttons}>
          <PrimaryButton
            label="⏱ 未来に使った時間を見る"
            onPress={() => router.push('/time-dashboard')}
            style={styles.primaryActionBtn}
          />
          <PrimaryButton
            label={morningDone ? '☀️ 朝リセット（再実施）' : '☀️ 朝のリセット診断'}
            onPress={() => router.push('/morning-reset')}
            variant="secondary"
            style={styles.secBtn}
          />
          <PrimaryButton
            label={nightDone ? '🌙 夜の振り返り（再実施）' : '🌙 夜の振り返り'}
            onPress={() => router.push('/night-review')}
            variant="secondary"
            style={styles.secBtn}
          />
          <View style={styles.subButtons}>
            <TouchableOpacity
              style={styles.subButton}
              onPress={() => router.push('/history')}
              activeOpacity={0.7}
            >
              <Text style={styles.subButtonText}>📅 履歴</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.subButton}
              onPress={() => router.push('/future-vision-setup')}
              activeOpacity={0.7}
            >
              <Text style={styles.subButtonText}>⚙️ 設定を編集</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatusBadge({ label, done }: { label: string; done: boolean }) {
  return (
    <View style={[badgeStyles.badge, done && badgeStyles.done]}>
      <Text style={[badgeStyles.text, done && badgeStyles.doneText]}>
        {done ? `${label} ✓` : `${label} -`}
      </Text>
    </View>
  );
}

function formatDate(date: Date): string {
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

const badgeStyles = StyleSheet.create({
  badge: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#EEEEF6',
    alignItems: 'center',
  },
  done: { backgroundColor: '#D6EEFF' },
  text: { fontSize: 12, color: '#8A8A9A', fontWeight: '600' },
  doneText: { color: '#4A90E2' },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F7FF' },
  container: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  greeting: { fontSize: 20, fontWeight: '800', color: '#1A1A2E' },
  date: { fontSize: 13, color: '#8A8A9A', fontWeight: '500' },

  // Today action card
  actionCard: { gap: 10 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8A8A9A',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  actionTitle: { fontSize: 17, fontWeight: '800', color: '#1A1A2E', lineHeight: 26 },
  actionReason: { fontSize: 13, color: '#5A5A7A', lineHeight: 20 },
  actionMeta: { flexDirection: 'row', gap: 16 },
  actionMetaItem: { gap: 2 },
  actionMetaLabel: { fontSize: 11, color: '#A0A0B8', fontWeight: '600' },
  actionMetaValue: { fontSize: 14, fontWeight: '700', color: '#2C2C3E' },
  actionButtons: { flexDirection: 'row', gap: 8, marginTop: 4 },
  actionSubBtn: {
    flex: 1,
    backgroundColor: '#4A90E2',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  actionSubBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  actionSubBtnGhost: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#D0D0E0',
  },
  actionSubBtnGhostText: { color: '#8A8A9A', fontWeight: '600', fontSize: 14 },

  // No action card
  noActionCard: { alignItems: 'center', gap: 8, paddingVertical: 24 },
  noActionEmoji: { fontSize: 40 },
  noActionText: { fontSize: 16, fontWeight: '700', color: '#1A1A2E', textAlign: 'center' },
  noActionHint: { fontSize: 13, color: '#8A8A9A', textAlign: 'center' },
  noActionBtn: { marginTop: 8, width: '100%' },

  progressRow: { flexDirection: 'row', gap: 10 },
  visionCard: { gap: 6 },
  visionText: { fontSize: 15, color: '#1A1A2E', fontWeight: '500', lineHeight: 24 },

  buttons: { gap: 10, marginTop: 4 },
  primaryActionBtn: { paddingVertical: 16 },
  secBtn: { paddingVertical: 16 },
  subButtons: { flexDirection: 'row', gap: 10 },
  subButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E0E0EE',
  },
  subButtonText: { fontSize: 14, fontWeight: '600', color: '#5A5A7A' },
});

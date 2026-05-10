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
import type { DailyLog, FutureVision } from '../types';
import { loadFutureVision, loadTodayLog } from '../utils/storage';

export default function HomeScreen() {
  const [vision, setVision] = useState<FutureVision | null>(null);
  const [todayLog, setTodayLog] = useState<DailyLog | null>(null);

  useFocusEffect(
    useCallback(() => {
      Promise.all([loadFutureVision(), loadTodayLog()]).then(([v, log]) => {
        setVision(v);
        setTodayLog(log);
      });
    }, [])
  );

  const score = todayLog?.score ?? 50;
  const morningDone = !!todayLog?.focusArea;
  const nightDone =
    !!todayLog &&
    (todayLog.tomorrowFix !== '' ||
      todayLog.desiredActionsDone.length > 0 ||
      todayLog.avoidActionsDone.length > 0 ||
      (todayLog.actionCompleted === 'done' || todayLog.actionCompleted === 'partial'));

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* ヘッダー */}
        <View style={styles.header}>
          <Text style={styles.greeting}>今日もリセット 🌅</Text>
          <Text style={styles.date}>{formatDate(new Date())}</Text>
        </View>

        {/* Future Compass Card */}
        <FutureCompassCard score={score} />

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
                <Text style={[styles.sectionLabel, { marginTop: 12 }]}>✨ 近づきたい自分</Text>
                <Text style={styles.visionText}>{vision.idealSelf}</Text>
              </>
            ) : null}
          </Card>
        )}

        {/* 今日のアクション表示 */}
        {todayLog?.todayAction ? (
          <Card style={styles.actionCard}>
            <Text style={styles.sectionLabel}>⚡ 今日のアクション</Text>
            <View style={styles.actionBadge}>
              <Text style={styles.actionText}>{todayLog.todayAction}</Text>
            </View>
          </Card>
        ) : null}

        {/* アクションボタン群 */}
        <View style={styles.buttons}>
          <PrimaryButton
            label={morningDone ? '☀️ 朝リセット（再実施）' : '☀️ 朝のリセット診断'}
            onPress={() => router.push('/morning-reset')}
            style={styles.actionButton}
          />
          <PrimaryButton
            label={nightDone ? '🌙 夜の振り返り（再実施）' : '🌙 夜の振り返り'}
            onPress={() => router.push('/night-review')}
            variant="secondary"
            style={styles.actionButton}
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
  done: {
    backgroundColor: '#D6EEFF',
  },
  text: {
    fontSize: 12,
    color: '#8A8A9A',
    fontWeight: '600',
  },
  doneText: {
    color: '#4A90E2',
  },
});

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F5F7FF',
  },
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
  greeting: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A2E',
  },
  date: {
    fontSize: 13,
    color: '#8A8A9A',
    fontWeight: '500',
  },
  progressRow: {
    flexDirection: 'row',
    gap: 10,
  },
  visionCard: {
    gap: 6,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8A8A9A',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  visionText: {
    fontSize: 16,
    color: '#1A1A2E',
    fontWeight: '500',
    lineHeight: 24,
  },
  actionCard: {
    gap: 12,
  },
  actionBadge: {
    backgroundColor: '#EBF4FF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  actionText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4A90E2',
    textAlign: 'center',
  },
  buttons: {
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    paddingVertical: 18,
  },
  subButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  subButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E0E0EE',
  },
  subButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5A5A7A',
  },
});

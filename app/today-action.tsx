import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { BackButton } from '../components/BackButton';
import { Card } from '../components/Card';
import { ChoiceChip } from '../components/ChoiceChip';
import { PrimaryButton } from '../components/PrimaryButton';
import type { DailyActionLog, FutureVision } from '../types';
import { getTodayKey } from '../utils/date';
import { calculateActionScore, getStatusTypeFromScore } from '../utils/score';
import { getTodayActionLog, loadFutureVision, upsertActionLog } from '../utils/storage';

const MINUTE_OPTIONS = [5, 15, 30, 60, 90] as const;

export default function TodayActionScreen() {
  const [vision, setVision] = useState<FutureVision | null>(null);
  const [actionTitle, setActionTitle] = useState('');
  const [actionReason, setActionReason] = useState('');
  const [selectedMinutes, setSelectedMinutes] = useState<number | null>(null);
  const [customMinutesText, setCustomMinutesText] = useState('');
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      Promise.all([loadFutureVision(), getTodayActionLog()]).then(([v, log]) => {
        setVision(v);
        if (log) {
          setActionTitle(log.actionTitle);
          setActionReason(log.actionReason);
          const isPreset = MINUTE_OPTIONS.includes(log.plannedMinutes as (typeof MINUTE_OPTIONS)[number]);
          if (isPreset) {
            setSelectedMinutes(log.plannedMinutes);
            setCustomMinutesText('');
          } else {
            setSelectedMinutes(null);
            setCustomMinutesText(log.plannedMinutes > 0 ? String(log.plannedMinutes) : '');
          }
        }
      });
    }, [])
  );

  const plannedMinutes =
    selectedMinutes !== null
      ? selectedMinutes
      : parseInt(customMinutesText, 10) || 0;

  const selectMinutes = (m: number) => {
    setSelectedMinutes((prev) => (prev === m ? null : m));
    setCustomMinutesText('');
  };

  const handleCustomMinutes = (text: string) => {
    setCustomMinutesText(text.replace(/[^0-9]/g, ''));
    setSelectedMinutes(null);
  };

  const handleSave = async () => {
    if (!actionTitle.trim()) {
      Alert.alert('入力が必要です', '今日やる行動を入力してください');
      return;
    }
    if (plannedMinutes <= 0) {
      Alert.alert('入力が必要です', '予定時間を選択または入力してください');
      return;
    }

    const now = new Date().toISOString();
    const today = getTodayKey();
    const existing = await getTodayActionLog();

    const draft: DailyActionLog = {
      id: today,
      date: today,
      actionTitle: actionTitle.trim(),
      actionReason: actionReason.trim(),
      plannedMinutes,
      actualMinutes: existing?.actualMinutes ?? 0,
      status: existing?.status ?? 'not_done',
      reflectionText: existing?.reflectionText ?? '',
      blockerText: existing?.blockerText ?? '',
      nextFixText: existing?.nextFixText ?? '',
      score: 0,
      statusType: 'neutral',
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };

    const score = calculateActionScore(draft);
    const log: DailyActionLog = {
      ...draft,
      score,
      statusType: getStatusTypeFromScore(score),
    };

    setSaving(true);
    try {
      await upsertActionLog(log);
      router.replace('/home');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <BackButton />

          <View style={styles.header}>
            <Text style={styles.emoji}>⚡</Text>
            <Text style={styles.title}>今日の最低限アクション</Text>
            <Text style={styles.subtitle}>
              最低限これだけやれば前進と言える行動を1つ決めましょう
            </Text>
          </View>

          {/* 叶えたい将来 (参考表示) */}
          {vision && (
            <Card style={styles.visionCard}>
              <Text style={styles.visionLabel}>🎯 {vision.idealFuture}</Text>
              {vision.idealSelf ? (
                <Text style={styles.visionSub}>✨ {vision.idealSelf}</Text>
              ) : null}
            </Card>
          )}

          {/* 今日やる行動 */}
          <Card style={styles.fieldCard}>
            <Text style={styles.fieldLabel}>今日やる最低限の行動</Text>
            <Text style={styles.fieldHint}>大きな目標ではなく、今日できる最小の行動にしてください</Text>
            <TextInput
              style={styles.input}
              placeholder="例：副業の企画を30分だけ書き出す"
              placeholderTextColor="#C0C0D0"
              value={actionTitle}
              onChangeText={setActionTitle}
              multiline
              textAlignVertical="top"
            />
          </Card>

          {/* なぜ未来につながるか */}
          <Card style={styles.fieldCard}>
            <Text style={styles.fieldLabel}>なぜ未来につながるか</Text>
            <Text style={styles.fieldHint}>この行動がどう将来に結びつくか書いてみましょう</Text>
            <TextInput
              style={styles.input}
              placeholder="例：副業の第一歩を踏み出すことで、独立への実績になるから"
              placeholderTextColor="#C0C0D0"
              value={actionReason}
              onChangeText={setActionReason}
              multiline
              textAlignVertical="top"
            />
          </Card>

          {/* 予定時間 */}
          <Card style={styles.fieldCard}>
            <Text style={styles.fieldLabel}>予定時間</Text>
            <View style={styles.chipWrap}>
              {MINUTE_OPTIONS.map((m) => (
                <ChoiceChip
                  key={m}
                  label={`${m}分`}
                  selected={selectedMinutes === m}
                  onPress={() => selectMinutes(m)}
                />
              ))}
            </View>
            <View style={styles.customRow}>
              <TextInput
                style={styles.customInput}
                placeholder="その他（分）"
                placeholderTextColor="#C0C0D0"
                value={customMinutesText}
                onChangeText={handleCustomMinutes}
                keyboardType="number-pad"
              />
              {plannedMinutes > 0 && (
                <View style={styles.minutePreview}>
                  <Text style={styles.minutePreviewText}>{plannedMinutes}分</Text>
                </View>
              )}
            </View>
          </Card>

          <PrimaryButton
            label={saving ? '保存中...' : '今日はこれをやる！ →'}
            onPress={handleSave}
            style={styles.button}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F7FF' },
  flex: { flex: 1 },
  container: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 48,
    gap: 16,
  },
  header: { alignItems: 'center', gap: 8, paddingVertical: 8 },
  emoji: { fontSize: 44 },
  title: { fontSize: 22, fontWeight: '800', color: '#1A1A2E' },
  subtitle: { fontSize: 13, color: '#8A8A9A', textAlign: 'center', lineHeight: 20 },
  visionCard: {
    backgroundColor: '#EBF4FF',
    gap: 4,
  },
  visionLabel: { fontSize: 14, fontWeight: '700', color: '#4A90E2', lineHeight: 22 },
  visionSub: { fontSize: 13, color: '#5A8AC0', lineHeight: 20 },
  fieldCard: { gap: 10 },
  fieldLabel: { fontSize: 15, fontWeight: '700', color: '#1A1A2E' },
  fieldHint: { fontSize: 12, color: '#A0A0B8', marginTop: -4 },
  input: {
    backgroundColor: '#F5F7FF',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: '#2C2C3E',
    borderWidth: 1.5,
    borderColor: '#E0E0EE',
    minHeight: 76,
    paddingTop: 12,
  },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  customRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  customInput: {
    flex: 1,
    backgroundColor: '#F5F7FF',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#2C2C3E',
    borderWidth: 1.5,
    borderColor: '#E0E0EE',
  },
  minutePreview: {
    backgroundColor: '#4A90E2',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  minutePreviewText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  button: { marginTop: 8 },
});

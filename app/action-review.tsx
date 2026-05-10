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
  TouchableOpacity,
  View,
} from 'react-native';
import { BackButton } from '../components/BackButton';
import { Card } from '../components/Card';
import { ChoiceChip } from '../components/ChoiceChip';
import { PrimaryButton } from '../components/PrimaryButton';
import type { ActionStatus, DailyActionLog } from '../types';
import { formatMinutes } from '../utils/date';
import { calculateActionScore, getStatusTypeFromScore } from '../utils/score';
import { getTodayActionLog, upsertActionLog } from '../utils/storage';

const ACTUAL_MINUTE_OPTIONS = [0, 5, 15, 30, 60, 90] as const;

const STATUS_OPTIONS: { value: ActionStatus; label: string; color: string }[] = [
  { value: 'done', label: '✅ できた', color: '#4A90E2' },
  { value: 'partial', label: '🌓 少しできた', color: '#F5A623' },
  { value: 'not_done', label: '😔 できなかった', color: '#E05C5C' },
];

export default function ActionReviewScreen() {
  const [actionLog, setActionLog] = useState<DailyActionLog | null>(null);
  const [actionStatus, setActionStatus] = useState<ActionStatus>('done');
  const [selectedActualMinutes, setSelectedActualMinutes] = useState<number | null>(null);
  const [customActualText, setCustomActualText] = useState('');
  const [reflectionText, setReflectionText] = useState('');
  const [blockerText, setBlockerText] = useState('');
  const [nextFixText, setNextFixText] = useState('');
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getTodayActionLog().then((log) => {
        if (!log) return;
        setActionLog(log);
        setActionStatus(log.status);
        const isPreset = ACTUAL_MINUTE_OPTIONS.includes(
          log.actualMinutes as (typeof ACTUAL_MINUTE_OPTIONS)[number]
        );
        if (isPreset) {
          setSelectedActualMinutes(log.actualMinutes);
        } else if (log.actualMinutes > 0) {
          setCustomActualText(String(log.actualMinutes));
        }
        setReflectionText(log.reflectionText);
        setBlockerText(log.blockerText);
        setNextFixText(log.nextFixText);
      });
    }, [])
  );

  const actualMinutes =
    selectedActualMinutes !== null
      ? selectedActualMinutes
      : parseInt(customActualText, 10) || 0;

  const selectActualMinutes = (m: number) => {
    setSelectedActualMinutes((prev) => (prev === m ? null : m));
    setCustomActualText('');
  };

  const handleCustomActual = (text: string) => {
    setCustomActualText(text.replace(/[^0-9]/g, ''));
    setSelectedActualMinutes(null);
  };

  const handleSave = async () => {
    if (!actionLog) {
      Alert.alert(
        'アクション未設定',
        '今日の最低限アクションが設定されていません。先に行動を決めましょう。',
        [
          { text: 'キャンセル', style: 'cancel' },
          { text: '行動を決める', onPress: () => router.replace('/today-action') },
        ]
      );
      return;
    }

    setSaving(true);
    try {
      const now = new Date().toISOString();
      const updated: DailyActionLog = {
        ...actionLog,
        status: actionStatus,
        actualMinutes,
        reflectionText: reflectionText.trim(),
        blockerText: blockerText.trim(),
        nextFixText: nextFixText.trim(),
        updatedAt: now,
        score: 0,
        statusType: 'neutral',
      };
      const score = calculateActionScore(updated);
      updated.score = score;
      updated.statusType = getStatusTypeFromScore(score);

      await upsertActionLog(updated);
      router.replace('/home');
    } finally {
      setSaving(false);
    }
  };

  if (!actionLog) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.emptyContainer}>
          <BackButton />
          <View style={styles.emptyContent}>
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={styles.emptyTitle}>今日のアクションが未設定です</Text>
            <Text style={styles.emptyHint}>先に今日の最低限アクションを決めましょう</Text>
            <PrimaryButton
              label="行動を決める →"
              onPress={() => router.replace('/today-action')}
              style={styles.emptyButton}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

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
            <Text style={styles.emoji}>🌙</Text>
            <Text style={styles.title}>今日の行動を振り返る</Text>
            <Text style={styles.subtitle}>正直に振り返ることで明日が変わります</Text>
          </View>

          {/* 今日のアクション確認 */}
          <Card style={styles.actionInfoCard}>
            <Text style={styles.infoLabel}>⚡ 今日の最低限アクション</Text>
            <Text style={styles.infoAction}>{actionLog.actionTitle}</Text>
            {actionLog.actionReason ? (
              <Text style={styles.infoReason}>{actionLog.actionReason}</Text>
            ) : null}
            <View style={styles.infoRow}>
              <Text style={styles.infoMinuteLabel}>予定時間</Text>
              <Text style={styles.infoMinute}>{formatMinutes(actionLog.plannedMinutes)}</Text>
            </View>
          </Card>

          {/* 達成状況 */}
          <Card style={styles.fieldCard}>
            <Text style={styles.fieldLabel}>達成状況</Text>
            <View style={styles.statusRow}>
              {STATUS_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.statusBtn,
                    actionStatus === opt.value && {
                      backgroundColor: opt.color,
                      borderColor: opt.color,
                    },
                  ]}
                  onPress={() => setActionStatus(opt.value)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.statusLabel,
                      actionStatus === opt.value && styles.statusLabelSelected,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          {/* 実際に使った時間 */}
          <Card style={styles.fieldCard}>
            <Text style={styles.fieldLabel}>実際に使った時間</Text>
            <View style={styles.chipWrap}>
              {ACTUAL_MINUTE_OPTIONS.map((m) => (
                <ChoiceChip
                  key={m}
                  label={m === 0 ? '0分' : `${m}分`}
                  selected={selectedActualMinutes === m}
                  onPress={() => selectActualMinutes(m)}
                />
              ))}
            </View>
            <View style={styles.customRow}>
              <TextInput
                style={styles.customInput}
                placeholder="その他（分）"
                placeholderTextColor="#C0C0D0"
                value={customActualText}
                onChangeText={handleCustomActual}
                keyboardType="number-pad"
              />
              {actualMinutes > 0 && (
                <View style={styles.minutePreview}>
                  <Text style={styles.minutePreviewText}>{formatMinutes(actualMinutes)}</Text>
                </View>
              )}
            </View>
          </Card>

          {/* 振り返り */}
          <Card style={styles.fieldCard}>
            <Text style={styles.fieldLabel}>振り返り</Text>
            <Text style={styles.fieldHint}>（記入で +10点）</Text>
            <TextInput
              style={styles.textarea}
              placeholder="例：集中できた。途中で眠くなったが最後までやり切れた"
              placeholderTextColor="#C0C0D0"
              value={reflectionText}
              onChangeText={setReflectionText}
              multiline
              textAlignVertical="top"
            />
          </Card>

          {/* できなかった理由 */}
          <Card style={styles.fieldCard}>
            <Text style={styles.fieldLabel}>できなかった理由（あれば）</Text>
            <TextInput
              style={styles.textarea}
              placeholder="例：仕事が長引いて時間が取れなかった"
              placeholderTextColor="#C0C0D0"
              value={blockerText}
              onChangeText={setBlockerText}
              multiline
              textAlignVertical="top"
            />
          </Card>

          {/* 明日の修正点 */}
          <Card style={styles.fieldCard}>
            <Text style={styles.fieldLabel}>明日の修正点</Text>
            <Text style={styles.fieldHint}>（記入で +10点）</Text>
            <TextInput
              style={styles.textarea}
              placeholder="例：朝7時に起きてすぐ30分だけやる"
              placeholderTextColor="#C0C0D0"
              value={nextFixText}
              onChangeText={setNextFixText}
              multiline
              textAlignVertical="top"
            />
          </Card>

          <PrimaryButton
            label={saving ? '保存中...' : '保存してスコア更新 →'}
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
  emptyContainer: { flex: 1, padding: 24, gap: 20 },
  emptyContent: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#1A1A2E' },
  emptyHint: { fontSize: 14, color: '#8A8A9A', textAlign: 'center' },
  emptyButton: { marginTop: 8, width: '100%' },
  container: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 48,
    gap: 16,
  },
  header: { alignItems: 'center', gap: 8, paddingVertical: 8 },
  emoji: { fontSize: 44 },
  title: { fontSize: 22, fontWeight: '800', color: '#1A1A2E' },
  subtitle: { fontSize: 13, color: '#8A8A9A' },
  actionInfoCard: { backgroundColor: '#EBF4FF', gap: 8 },
  infoLabel: { fontSize: 12, fontWeight: '700', color: '#4A90E2', letterSpacing: 0.5 },
  infoAction: { fontSize: 17, fontWeight: '800', color: '#1A1A2E', lineHeight: 26 },
  infoReason: { fontSize: 13, color: '#5A5A7A', lineHeight: 20 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoMinuteLabel: { fontSize: 12, color: '#8A8A9A' },
  infoMinute: { fontSize: 14, fontWeight: '700', color: '#4A90E2' },
  fieldCard: { gap: 10 },
  fieldLabel: { fontSize: 15, fontWeight: '700', color: '#1A1A2E' },
  fieldHint: { fontSize: 12, color: '#A0A0B8', marginTop: -6 },
  statusRow: { flexDirection: 'row', gap: 8 },
  statusBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#D0D0E0',
    backgroundColor: '#FFFFFF',
  },
  statusLabel: { fontSize: 13, fontWeight: '600', color: '#5A5A7A' },
  statusLabelSelected: { color: '#FFFFFF' },
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
  textarea: {
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
  button: { marginTop: 8 },
});

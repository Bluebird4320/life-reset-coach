import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
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
import { PrimaryButton } from '../components/PrimaryButton';
import { ToggleChip } from '../components/ToggleChip';
import type { ActionCompleted, FutureVision } from '../types';
import { calculateScore } from '../utils/score';
import {
  getTodayDateString,
  loadFutureVision,
  loadTodayLog,
  makeFreshLog,
  saveDailyLog,
} from '../utils/storage';
import { getCharacterStatus } from '../utils/score';

const COMPLETION_OPTIONS: { value: ActionCompleted; label: string; color: string }[] = [
  { value: 'done', label: '✅ 完了！', color: '#4A90E2' },
  { value: 'partial', label: '🌓 途中まで', color: '#F5A623' },
  { value: 'not_done', label: '😔 できず', color: '#E05C5C' },
];

export default function NightReviewScreen() {
  const [vision, setVision] = useState<FutureVision | null>(null);
  const [todayAction, setTodayAction] = useState('');
  const [actionCompleted, setActionCompleted] = useState<ActionCompleted>('done');
  const [desiredDone, setDesiredDone] = useState<string[]>([]);
  const [avoidDone, setAvoidDone] = useState<string[]>([]);
  const [tomorrowFix, setTomorrowFix] = useState('');
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      Promise.all([loadFutureVision(), loadTodayLog()]).then(([v, log]) => {
        setVision(v);
        if (log) {
          if (log.todayAction) setTodayAction(log.todayAction);
          setActionCompleted(log.actionCompleted);
          setDesiredDone(log.desiredActionsDone);
          setAvoidDone(log.avoidActionsDone);
          setTomorrowFix(log.tomorrowFix);
        }
      });
    }, [])
  );

  const toggleDesired = (item: string) =>
    setDesiredDone((p) => (p.includes(item) ? p.filter((x) => x !== item) : [...p, item]));

  const toggleAvoid = (item: string) =>
    setAvoidDone((p) => (p.includes(item) ? p.filter((x) => x !== item) : [...p, item]));

  const handleComplete = async () => {
    setSaving(true);
    try {
      const today = getTodayDateString();
      const existing = await loadTodayLog();
      const base = existing ?? makeFreshLog(today);

      const input = {
        actionCompleted,
        desiredActionsDone: desiredDone,
        avoidActionsDone: avoidDone,
        tomorrowFix,
      };
      const breakdown = calculateScore(input);

      await saveDailyLog({
        ...base,
        date: today,
        actionCompleted,
        desiredActionsDone: desiredDone,
        avoidActionsDone: avoidDone,
        tomorrowFix: tomorrowFix.trim(),
        score: breakdown.total,
        status: getCharacterStatus(breakdown.total),
      });

      router.replace('/result');
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
            <Text style={styles.emoji}>🌙</Text>
            <Text style={styles.title}>夜の振り返り</Text>
            <Text style={styles.subtitle}>今日の行動を正直に振り返ろう</Text>
          </View>

          {/* 今日のアクション完了度 */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>⚡ 今日のアクション完了度</Text>
            {todayAction ? (
              <Card style={styles.actionPreview}>
                <Text style={styles.actionPreviewText}>「{todayAction}」</Text>
              </Card>
            ) : (
              <Text style={styles.noActionNote}>
                朝のリセット診断が未実施ですが、振り返りは続けられます
              </Text>
            )}
            <View style={styles.completionRow}>
              {COMPLETION_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.completionBtn,
                    actionCompleted === opt.value && {
                      backgroundColor: opt.color,
                      borderColor: opt.color,
                    },
                  ]}
                  onPress={() => setActionCompleted(opt.value)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.completionLabel,
                      actionCompleted === opt.value && styles.completionLabelSelected,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 理想行動でできたもの */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>📈 今日できた「理想行動」</Text>
            <Text style={styles.hint}>（+10点 / 個）</Text>
            {vision?.desiredActions.length ? (
              <View style={styles.chipWrap}>
                {vision.desiredActions.map((a) => (
                  <ToggleChip
                    key={a}
                    label={a}
                    selected={desiredDone.includes(a)}
                    onPress={() => toggleDesired(a)}
                  />
                ))}
              </View>
            ) : (
              <Text style={styles.emptyHint}>設定で「増やしたい行動」を登録してください</Text>
            )}
          </View>

          {/* 避けるべき行動でやってしまったもの */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>📉 やってしまった「避けるべき行動」</Text>
            <Text style={styles.hint}>（-15点 / 個）</Text>
            {vision?.avoidActions.length ? (
              <View style={styles.chipWrap}>
                {vision.avoidActions.map((a) => (
                  <ToggleChip
                    key={a}
                    label={a}
                    selected={avoidDone.includes(a)}
                    onPress={() => toggleAvoid(a)}
                    selectedColor="#E05C5C"
                  />
                ))}
              </View>
            ) : (
              <Text style={styles.emptyHint}>設定で「減らしたい行動」を登録してください</Text>
            )}
          </View>

          {/* 明日の修正点 */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>🔧 明日の修正点</Text>
            <Text style={styles.hint}>（記入で +10点）</Text>
            <TextInput
              style={styles.input}
              placeholder="例：朝7時に起きてすぐ作業する"
              placeholderTextColor="#C0C0D0"
              value={tomorrowFix}
              onChangeText={setTomorrowFix}
              multiline
              textAlignVertical="top"
            />
          </View>

          <PrimaryButton
            label={saving ? '計算中...' : '振り返りを完了 →'}
            onPress={handleComplete}
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
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
    gap: 28,
  },
  header: { alignItems: 'center', gap: 8 },
  emoji: { fontSize: 48 },
  title: { fontSize: 24, fontWeight: '800', color: '#1A1A2E' },
  subtitle: { fontSize: 14, color: '#8A8A9A' },
  section: { gap: 10 },
  sectionLabel: { fontSize: 15, fontWeight: '700', color: '#1A1A2E' },
  hint: { fontSize: 12, color: '#A0A0B8', marginTop: -6 },
  actionPreview: {
    backgroundColor: '#EBF4FF',
    alignItems: 'center',
  },
  actionPreviewText: { fontSize: 16, fontWeight: '700', color: '#4A90E2' },
  noActionNote: { fontSize: 13, color: '#A0A0B8', fontStyle: 'italic' },
  completionRow: { flexDirection: 'row', gap: 8 },
  completionBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#D0D0E0',
    backgroundColor: '#FFFFFF',
  },
  completionLabel: { fontSize: 13, fontWeight: '600', color: '#5A5A7A' },
  completionLabelSelected: { color: '#FFFFFF' },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  emptyHint: { fontSize: 13, color: '#A0A0B8', fontStyle: 'italic' },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#2C2C3E',
    borderWidth: 1.5,
    borderColor: '#E8E8F0',
    minHeight: 80,
    paddingTop: 14,
  },
  button: { marginTop: 8 },
});

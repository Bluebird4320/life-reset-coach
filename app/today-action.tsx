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
  View,
} from 'react-native';
import { Card } from '../components/Card';
import { PrimaryButton } from '../components/PrimaryButton';
import { ToggleChip } from '../components/ToggleChip';
import type { FutureVision } from '../types';
import {
  getTodayDateString,
  loadFutureVision,
  loadTodayLog,
  makeFreshLog,
  saveDailyLog,
} from '../utils/storage';

export default function TodayActionScreen() {
  const [vision, setVision] = useState<FutureVision | null>(null);
  const [idealActionText, setIdealActionText] = useState('');
  const [selectedAction, setSelectedAction] = useState('');
  const [customAction, setCustomAction] = useState('');
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      Promise.all([loadFutureVision(), loadTodayLog()]).then(([v, log]) => {
        setVision(v);
        if (log?.idealActionText) setIdealActionText(log.idealActionText);
        if (log?.todayAction) {
          const isDesired = v?.desiredActions.includes(log.todayAction);
          if (isDesired) setSelectedAction(log.todayAction);
          else setCustomAction(log.todayAction);
        }
      });
    }, [])
  );

  const selectChip = (action: string) => {
    setSelectedAction((prev) => (prev === action ? '' : action));
    setCustomAction('');
  };

  const handleCustomChange = (text: string) => {
    setCustomAction(text);
    setSelectedAction('');
  };

  const finalAction = selectedAction || customAction.trim();

  const handleCommit = async () => {
    if (!finalAction) return;
    setSaving(true);
    try {
      const today = getTodayDateString();
      const existing = await loadTodayLog();
      const base = existing ?? makeFreshLog(today);
      await saveDailyLog({ ...base, todayAction: finalAction });
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
          <View style={styles.header}>
            <Text style={styles.emoji}>⚡</Text>
            <Text style={styles.title}>今日の1アクション</Text>
            <Text style={styles.subtitle}>これだけやれば今日はOKというものを決めよう</Text>
          </View>

          {/* 朝の理想メモ */}
          {idealActionText ? (
            <Card style={styles.inspirationCard}>
              <Text style={styles.inspirationLabel}>✨ 朝に考えた理想</Text>
              <Text style={styles.inspirationText}>{idealActionText}</Text>
            </Card>
          ) : null}

          {/* 増やしたい行動から選ぶ */}
          {vision?.desiredActions.length ? (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>📈 増やしたい行動から選ぶ</Text>
              <View style={styles.chipWrap}>
                {vision.desiredActions.map((a) => (
                  <ToggleChip
                    key={a}
                    label={a}
                    selected={selectedAction === a}
                    onPress={() => selectChip(a)}
                  />
                ))}
              </View>
            </View>
          ) : null}

          {/* カスタム入力 */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>✍️ または自由に入力</Text>
            <TextInput
              style={styles.input}
              placeholder="例：副業の記事を1本書く"
              placeholderTextColor="#C0C0D0"
              value={customAction}
              onChangeText={handleCustomChange}
            />
          </View>

          {/* 選択中のアクション確認 */}
          {finalAction ? (
            <View style={styles.commitPreview}>
              <Text style={styles.commitLabel}>今日のアクション</Text>
              <Text style={styles.commitAction}>「{finalAction}」</Text>
            </View>
          ) : null}

          <PrimaryButton
            label={saving ? '保存中...' : '今日はこれをやる！ →'}
            onPress={handleCommit}
            style={[styles.button, !finalAction && styles.buttonDisabled]}
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
    gap: 24,
  },
  header: { alignItems: 'center', gap: 8 },
  emoji: { fontSize: 48 },
  title: { fontSize: 24, fontWeight: '800', color: '#1A1A2E' },
  subtitle: { fontSize: 14, color: '#8A8A9A', textAlign: 'center' },
  inspirationCard: { backgroundColor: '#FFFBEB', gap: 6 },
  inspirationLabel: { fontSize: 12, fontWeight: '700', color: '#F5A623' },
  inspirationText: { fontSize: 15, color: '#2C2C3E', lineHeight: 22 },
  section: { gap: 10 },
  sectionLabel: { fontSize: 15, fontWeight: '700', color: '#1A1A2E' },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#2C2C3E',
    borderWidth: 1.5,
    borderColor: '#E8E8F0',
  },
  commitPreview: {
    backgroundColor: '#EBF4FF',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    gap: 4,
  },
  commitLabel: { fontSize: 12, color: '#8A8A9A', fontWeight: '600' },
  commitAction: { fontSize: 17, fontWeight: '800', color: '#4A90E2' },
  button: { marginTop: 8 },
  buttonDisabled: { opacity: 0.4 },
});

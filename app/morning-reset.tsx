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
import { BackButton } from '../components/BackButton';
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

export default function MorningResetScreen() {
  const [vision, setVision] = useState<FutureVision | null>(null);
  const [focusArea, setFocusArea] = useState('');
  const [avoidToday, setAvoidToday] = useState<string[]>([]);
  const [idealActionText, setIdealActionText] = useState('');
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      Promise.all([loadFutureVision(), loadTodayLog()]).then(([v, log]) => {
        setVision(v);
        if (log?.focusArea) {
          setFocusArea(log.focusArea);
          setAvoidToday(log.avoidToday);
          setIdealActionText(log.idealActionText);
        }
      });
    }, [])
  );

  const toggleAvoid = (item: string) => {
    setAvoidToday((prev) =>
      prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]
    );
  };

  const handleNext = async () => {
    setSaving(true);
    try {
      const today = getTodayDateString();
      const existing = await loadTodayLog();
      const base = existing ?? makeFreshLog(today);
      await saveDailyLog({
        ...base,
        date: today,
        focusArea: focusArea.trim(),
        avoidToday,
        idealActionText: idealActionText.trim(),
      });
      router.push('/today-action');
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
            <Text style={styles.emoji}>☀️</Text>
            <Text style={styles.title}>朝のリセット診断</Text>
            <Text style={styles.subtitle}>今日の方向性を決めましょう</Text>
          </View>

          {/* フォーカスエリア */}
          <Section label="🎯 今日フォーカスしたいことは？">
            <TextInput
              style={styles.input}
              placeholder="例：副業の作業を2時間する"
              placeholderTextColor="#C0C0D0"
              value={focusArea}
              onChangeText={setFocusArea}
              multiline
              textAlignVertical="top"
            />
          </Section>

          {/* 今日避けたいこと */}
          <Section label="🚫 今日特に避けたいことは？">
            {vision?.avoidActions.length ? (
              <View style={styles.chipWrap}>
                {vision.avoidActions.map((a) => (
                  <ToggleChip
                    key={a}
                    label={a}
                    selected={avoidToday.includes(a)}
                    onPress={() => toggleAvoid(a)}
                    selectedColor="#E05C5C"
                  />
                ))}
              </View>
            ) : (
              <Text style={styles.emptyHint}>
                「設定を編集」で「減らしたい行動」を登録すると選択できます
              </Text>
            )}
          </Section>

          {/* 理想のアクション */}
          <Section label="✨ 理想の自分なら今日何をする？">
            <TextInput
              style={styles.input}
              placeholder="例：夜9時までに副業タスクを1つ完了させる"
              placeholderTextColor="#C0C0D0"
              value={idealActionText}
              onChangeText={setIdealActionText}
              multiline
              textAlignVertical="top"
            />
          </Section>

          <PrimaryButton
            label={saving ? '保存中...' : '今日のアクションを決める →'}
            onPress={handleNext}
            style={styles.button}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={sectionStyles.container}>
      <Text style={sectionStyles.label}>{label}</Text>
      {children}
    </View>
  );
}

const sectionStyles = StyleSheet.create({
  container: { gap: 10 },
  label: { fontSize: 15, fontWeight: '700', color: '#1A1A2E' },
});

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
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emptyHint: {
    fontSize: 13,
    color: '#A0A0B8',
    fontStyle: 'italic',
  },
  button: { marginTop: 8 },
});

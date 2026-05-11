import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
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
import { z } from 'zod';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Chip } from '../../components/ui/Chip';
import { CATEGORIES, CategoryId } from '../../constants/categories';
import { Colors, Radius, Spacing } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { useGoalStore } from '../../store/goalStore';
import { getTodayKey } from '../../lib/dateUtils';

// バリデーションスキーマ
const schema = z.object({
  vision: z.string().min(1, 'ビジョンを入力してください').max(100, '100文字以内で入力してください'),
  category: z.string().min(1, 'カテゴリを選択してください'),
  dailyMinutes: z.number().min(5).max(60),
  deadline: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const MINUTE_OPTIONS = [5, 10, 15, 20, 30, 45, 60];

export default function GoalSetupScreen() {
  const { upsertGoal } = useGoalStore();
  const [increaseActions, setIncreaseActions] = useState<string[]>([]);
  const [decreaseActions, setDecreaseActions] = useState<string[]>([]);
  const [increaseInput, setIncreaseInput] = useState('');
  const [decreaseInput, setDecreaseInput] = useState('');
  const [saving, setSaving] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { vision: '', category: '', dailyMinutes: 15 },
  });

  const selectedCategory = watch('category') as CategoryId | '';
  const dailyMinutes = watch('dailyMinutes');

  const addAction = (
    list: string[],
    setList: (v: string[]) => void,
    input: string,
    setInput: (v: string) => void
  ) => {
    const trimmed = input.trim();
    if (!trimmed || list.includes(trimmed)) return;
    setList([...list, trimmed]);
    setInput('');
  };

  const removeAction = (list: string[], setList: (v: string[]) => void, item: string) => {
    setList(list.filter((a) => a !== item));
  };

  const onSubmit = async (values: FormValues) => {
    setSaving(true);
    try {
      const now = new Date().toISOString();
      await upsertGoal({
        id: getTodayKey(),
        vision: values.vision,
        category: values.category,
        increaseActions: JSON.stringify(increaseActions),
        decreaseActions: JSON.stringify(decreaseActions),
        deadline: values.deadline ?? null,
        dailyMinutes: values.dailyMinutes,
        progressPct: 0,
        createdAt: now,
        updatedAt: now,
      });
      router.replace('/(tabs)');
    } catch (e) {
      console.error('Goal save error:', e);
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
            <Text style={styles.title}>目標を設定しよう</Text>
            <Text style={styles.subtitle}>叶えたい未来を言葉にしましょう</Text>
          </View>

          {/* ビジョン */}
          <Card style={styles.fieldCard}>
            <Text style={styles.fieldLabel}>叶えたい未来のビジョン</Text>
            <Text style={styles.fieldHint}>3ヶ月〜1年後に実現したいことを具体的に（最大100文字）</Text>
            <Controller
              control={control}
              name="vision"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.input, errors.vision && styles.inputError]}
                  placeholder="例：副業で月5万円稼いで独立への一歩を踏み出す"
                  placeholderTextColor={Colors.primaryMid}
                  value={value}
                  onChangeText={onChange}
                  multiline
                  textAlignVertical="top"
                  maxLength={100}
                />
              )}
            />
            {errors.vision && <Text style={styles.errorText}>{errors.vision.message}</Text>}
          </Card>

          {/* カテゴリ */}
          <Card style={styles.fieldCard}>
            <Text style={styles.fieldLabel}>カテゴリ</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipScroll}
            >
              {CATEGORIES.map((cat) => (
                <Chip
                  key={cat.id}
                  label={`${cat.emoji} ${cat.label}`}
                  selected={selectedCategory === cat.id}
                  onPress={() => setValue('category', cat.id)}
                  selectedColor={cat.color}
                />
              ))}
            </ScrollView>
            {errors.category && <Text style={styles.errorText}>{errors.category.message}</Text>}
          </Card>

          {/* 増やしたい行動 */}
          <Card style={styles.fieldCard}>
            <Text style={styles.fieldLabel}>増やしたい習慣・行動</Text>
            <Text style={styles.fieldHint}>目標達成に向けて増やしたい行動（任意）</Text>
            <View style={styles.tagWrap}>
              {increaseActions.map((a) => (
                <Chip
                  key={a}
                  label={`${a} ✕`}
                  selected
                  selectedColor={Colors.success}
                  onPress={() => removeAction(increaseActions, setIncreaseActions, a)}
                />
              ))}
            </View>
            <View style={styles.addRow}>
              <TextInput
                style={styles.tagInput}
                placeholder="行動を入力して追加"
                placeholderTextColor={Colors.primaryMid}
                value={increaseInput}
                onChangeText={setIncreaseInput}
                onSubmitEditing={() =>
                  addAction(increaseActions, setIncreaseActions, increaseInput, setIncreaseInput)
                }
                returnKeyType="done"
              />
              <Button
                label="追加"
                onPress={() =>
                  addAction(increaseActions, setIncreaseActions, increaseInput, setIncreaseInput)
                }
                variant="secondary"
                style={styles.addBtn}
              />
            </View>
          </Card>

          {/* 減らしたい行動 */}
          <Card style={styles.fieldCard}>
            <Text style={styles.fieldLabel}>減らしたい習慣・行動</Text>
            <Text style={styles.fieldHint}>目標の妨げになっているもの（任意）</Text>
            <View style={styles.tagWrap}>
              {decreaseActions.map((a) => (
                <Chip
                  key={a}
                  label={`${a} ✕`}
                  selected
                  selectedColor={Colors.danger}
                  onPress={() => removeAction(decreaseActions, setDecreaseActions, a)}
                />
              ))}
            </View>
            <View style={styles.addRow}>
              <TextInput
                style={styles.tagInput}
                placeholder="行動を入力して追加"
                placeholderTextColor={Colors.primaryMid}
                value={decreaseInput}
                onChangeText={setDecreaseInput}
                onSubmitEditing={() =>
                  addAction(decreaseActions, setDecreaseActions, decreaseInput, setDecreaseInput)
                }
                returnKeyType="done"
              />
              <Button
                label="追加"
                onPress={() =>
                  addAction(decreaseActions, setDecreaseActions, decreaseInput, setDecreaseInput)
                }
                variant="secondary"
                style={styles.addBtn}
              />
            </View>
          </Card>

          {/* 1日の目標時間 */}
          <Card style={styles.fieldCard}>
            <Text style={styles.fieldLabel}>1日の目標時間</Text>
            <View style={styles.chipWrap}>
              {MINUTE_OPTIONS.map((m) => (
                <Chip
                  key={m}
                  label={`${m}分`}
                  selected={dailyMinutes === m}
                  onPress={() => setValue('dailyMinutes', m)}
                />
              ))}
            </View>
          </Card>

          <Button
            label={saving ? '保存中...' : 'スタート！ →'}
            onPress={handleSubmit(onSubmit)}
            disabled={saving}
            loading={saving}
            style={styles.submitBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  container: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: 48,
    gap: Spacing.lg,
  },
  header: { gap: Spacing.xs },
  title: { ...Typography.screenTitle },
  subtitle: { ...Typography.caption },
  fieldCard: { gap: Spacing.sm },
  fieldLabel: { ...Typography.cardTitle },
  fieldHint: { ...Typography.caption, marginTop: -Spacing.xs },
  input: {
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.md,
    padding: Spacing.md,
    paddingTop: Spacing.md,
    fontSize: 14,
    color: Colors.primaryDark,
    borderWidth: 1.5,
    borderColor: Colors.border,
    minHeight: 80,
  },
  inputError: { borderColor: Colors.danger },
  errorText: { ...Typography.caption, color: Colors.danger },
  chipScroll: { gap: Spacing.sm, paddingVertical: Spacing.xs },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  addRow: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' },
  tagInput: {
    flex: 1,
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 14,
    color: Colors.primaryDark,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  addBtn: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md },
  submitBtn: { marginTop: Spacing.sm },
});

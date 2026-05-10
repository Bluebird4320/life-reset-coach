import { router } from 'expo-router';
import { useEffect, useState } from 'react';
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
import type { FutureVision } from '../types';
import { loadFutureVision, saveFutureVision } from '../utils/storage';

const DEFAULT_DESIRED_ACTIONS = [
  '学習する',
  '読書する',
  '運動する',
  '早起きする',
  '早寝する',
  '副業を進める',
  'アプリ制作を進める',
  'AIを活用する',
  'SNS発信する',
  'ブログを書く',
  'ポートフォリオを作る',
  '案件を探す',
  '家計を見直す',
  '投資の勉強をする',
  '部屋を片付ける',
  '人に相談する',
  '感謝を伝える',
  '瞑想する',
  'メモを書く',
  '振り返りをする',
];

const DEFAULT_AVOID_ACTIONS = [
  '先延ばしする',
  'SNSをだらだら見る',
  'YouTubeを見続ける',
  '夜更かしする',
  '浪費する',
  '食べすぎる',
  '運動をサボる',
  '学習を後回しにする',
  '調べるだけで終わる',
  '完璧主義で止まる',
  '人と比べる',
  'ネガティブに考えすぎる',
  '部屋を散らかす',
  '無計画に過ごす',
  'スマホを触り続ける',
  'やる前から諦める',
  '寝る前にスマホを見る',
  '感情的に反応する',
  '目的なく買い物する',
  '疲れを放置する',
];

export default function FutureVisionSetupScreen() {
  const [idealFuture, setIdealFuture] = useState('');
  const [idealSelf, setIdealSelf] = useState('');

  const [desiredItems, setDesiredItems] = useState<string[]>([...DEFAULT_DESIRED_ACTIONS]);
  const [selectedDesired, setSelectedDesired] = useState<string[]>([]);
  const [customDesiredInput, setCustomDesiredInput] = useState('');

  const [avoidItems, setAvoidItems] = useState<string[]>([...DEFAULT_AVOID_ACTIONS]);
  const [selectedAvoid, setSelectedAvoid] = useState<string[]>([]);
  const [customAvoidInput, setCustomAvoidInput] = useState('');

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadFutureVision().then((data) => {
      if (!data) return;
      setIdealFuture(data.idealFuture);
      setIdealSelf(data.idealSelf);

      // デフォルト候補にない保存済み行動もチップとして追加
      const extraDesired = data.desiredActions.filter(
        (a) => !DEFAULT_DESIRED_ACTIONS.includes(a)
      );
      if (extraDesired.length > 0) {
        setDesiredItems([...DEFAULT_DESIRED_ACTIONS, ...extraDesired]);
      }
      setSelectedDesired(data.desiredActions);

      const extraAvoid = data.avoidActions.filter(
        (a) => !DEFAULT_AVOID_ACTIONS.includes(a)
      );
      if (extraAvoid.length > 0) {
        setAvoidItems([...DEFAULT_AVOID_ACTIONS, ...extraAvoid]);
      }
      setSelectedAvoid(data.avoidActions);
    });
  }, []);

  const toggleDesired = (item: string) => {
    setSelectedDesired((prev) =>
      prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]
    );
  };

  const toggleAvoid = (item: string) => {
    setSelectedAvoid((prev) =>
      prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]
    );
  };

  const addCustomDesired = () => {
    const trimmed = customDesiredInput.trim();
    if (!trimmed) return;
    if (!desiredItems.includes(trimmed)) {
      setDesiredItems((prev) => [...prev, trimmed]);
    }
    if (!selectedDesired.includes(trimmed)) {
      setSelectedDesired((prev) => [...prev, trimmed]);
    }
    setCustomDesiredInput('');
  };

  const addCustomAvoid = () => {
    const trimmed = customAvoidInput.trim();
    if (!trimmed) return;
    if (!avoidItems.includes(trimmed)) {
      setAvoidItems((prev) => [...prev, trimmed]);
    }
    if (!selectedAvoid.includes(trimmed)) {
      setSelectedAvoid((prev) => [...prev, trimmed]);
    }
    setCustomAvoidInput('');
  };

  const handleSave = async () => {
    if (!idealFuture.trim()) {
      Alert.alert('入力が必要です', '叶えたい将来を入力してください');
      return;
    }
    if (!idealSelf.trim()) {
      Alert.alert('入力が必要です', '近づきたい自分を入力してください');
      return;
    }
    if (selectedDesired.length === 0) {
      Alert.alert('選択が必要です', '増やしたい行動を1つ以上選んでください');
      return;
    }
    if (selectedAvoid.length === 0) {
      Alert.alert('選択が必要です', '減らしたい行動を1つ以上選んでください');
      return;
    }

    const vision: FutureVision = {
      idealFuture: idealFuture.trim(),
      idealSelf: idealSelf.trim(),
      desiredActions: [...new Set(selectedDesired.filter(Boolean))],
      avoidActions: [...new Set(selectedAvoid.filter(Boolean))],
    };

    setSaving(true);
    try {
      await saveFutureVision(vision);
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
            <Text style={styles.title}>叶えたい将来を設定</Text>
            <Text style={styles.subtitle}>天使・悪魔判定の基準になります</Text>
          </View>

          {/* 叶えたい将来 */}
          <Card style={styles.fieldCard}>
            <Text style={styles.fieldLabel}>🎯 叶えたい将来</Text>
            <TextInput
              style={styles.textInput}
              placeholder="例：フリーランスとして独立し、好きな場所で仕事をする"
              placeholderTextColor="#C0C0D0"
              value={idealFuture}
              onChangeText={setIdealFuture}
              multiline
              textAlignVertical="top"
            />
          </Card>

          {/* 近づきたい自分 */}
          <Card style={styles.fieldCard}>
            <Text style={styles.fieldLabel}>✨ 近づきたい自分</Text>
            <TextInput
              style={styles.textInput}
              placeholder="例：自律した行動ができる、副業で月5万円稼いでいる人"
              placeholderTextColor="#C0C0D0"
              value={idealSelf}
              onChangeText={setIdealSelf}
              multiline
              textAlignVertical="top"
            />
          </Card>

          {/* 増やしたい行動 */}
          <Card style={styles.sectionCard}>
            <Text style={styles.fieldLabel}>📈 増やしたい行動</Text>
            <Text style={styles.fieldHint}>
              未来に近づくために増やしたい行動を選んでください
            </Text>
            <View style={styles.chipWrap}>
              {desiredItems.map((item) => (
                <ChoiceChip
                  key={item}
                  label={item}
                  selected={selectedDesired.includes(item)}
                  onPress={() => toggleDesired(item)}
                />
              ))}
            </View>
            <CustomAddRow
              value={customDesiredInput}
              onChangeText={setCustomDesiredInput}
              onAdd={addCustomDesired}
              placeholder="自由に追加"
            />
          </Card>

          {/* 減らしたい行動 */}
          <Card style={styles.sectionCard}>
            <Text style={styles.fieldLabel}>📉 減らしたい行動</Text>
            <Text style={styles.fieldHint}>未来から遠ざかる行動を選んでください</Text>
            <View style={styles.chipWrap}>
              {avoidItems.map((item) => (
                <ChoiceChip
                  key={item}
                  label={item}
                  selected={selectedAvoid.includes(item)}
                  onPress={() => toggleAvoid(item)}
                  selectedColor="#E05C5C"
                />
              ))}
            </View>
            <CustomAddRow
              value={customAvoidInput}
              onChangeText={setCustomAvoidInput}
              onAdd={addCustomAvoid}
              placeholder="自由に追加"
            />
          </Card>

          <PrimaryButton
            label={saving ? '保存中...' : 'この未来に向かう →'}
            onPress={handleSave}
            style={styles.saveButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

type CustomAddRowProps = {
  value: string;
  onChangeText: (text: string) => void;
  onAdd: () => void;
  placeholder: string;
};

function CustomAddRow({ value, onChangeText, onAdd, placeholder }: CustomAddRowProps) {
  return (
    <View style={addRowStyles.row}>
      <TextInput
        style={addRowStyles.input}
        placeholder={placeholder}
        placeholderTextColor="#C0C0D0"
        value={value}
        onChangeText={onChangeText}
        returnKeyType="done"
        onSubmitEditing={onAdd}
      />
      <TouchableOpacity style={addRowStyles.button} onPress={onAdd} activeOpacity={0.7}>
        <Text style={addRowStyles.buttonText}>追加</Text>
      </TouchableOpacity>
    </View>
  );
}

const addRowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  input: {
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
  button: {
    backgroundColor: '#4A90E2',
    borderRadius: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F5F7FF',
  },
  flex: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 48,
    gap: 16,
  },
  header: {
    gap: 4,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A2E',
  },
  subtitle: {
    fontSize: 14,
    color: '#8A8A9A',
  },
  fieldCard: {
    gap: 10,
  },
  sectionCard: {
    gap: 12,
  },
  fieldLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  fieldHint: {
    fontSize: 12,
    color: '#8A8A9A',
    marginTop: -4,
  },
  textInput: {
    backgroundColor: '#F5F7FF',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: '#2C2C3E',
    borderWidth: 1.5,
    borderColor: '#E0E0EE',
    minHeight: 80,
    paddingTop: 12,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  saveButton: {
    marginTop: 8,
  },
});

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
  View,
} from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import type { FutureVision } from '../types';
import { loadFutureVision, saveFutureVision } from '../utils/storage';

export default function FutureVisionSetupScreen() {
  const [idealFuture, setIdealFuture] = useState('');
  const [idealSelf, setIdealSelf] = useState('');
  const [desiredActionsText, setDesiredActionsText] = useState('');
  const [avoidActionsText, setAvoidActionsText] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadFutureVision().then((data) => {
      if (!data) return;
      setIdealFuture(data.idealFuture);
      setIdealSelf(data.idealSelf);
      setDesiredActionsText(data.desiredActions.join(', '));
      setAvoidActionsText(data.avoidActions.join(', '));
    });
  }, []);

  const handleSave = async () => {
    if (!idealFuture.trim()) {
      Alert.alert('入力が必要です', '「叶えたい将来」を入力してください。');
      return;
    }

    const vision: FutureVision = {
      idealFuture: idealFuture.trim(),
      idealSelf: idealSelf.trim(),
      desiredActions: desiredActionsText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      avoidActions: avoidActionsText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
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
          <View style={styles.header}>
            <Text style={styles.title}>未来ビジョンを設定</Text>
            <Text style={styles.subtitle}>天使・悪魔判定の基準になります</Text>
          </View>

          <View style={styles.form}>
            <InputField
              label="🎯 叶えたい将来"
              placeholder="例：フリーランスとして独立し、好きな場所で仕事をする"
              value={idealFuture}
              onChangeText={setIdealFuture}
              multiline
            />
            <InputField
              label="✨ 近づきたい自分"
              placeholder="例：自律した行動ができる、副業で月5万円稼いでいる人"
              value={idealSelf}
              onChangeText={setIdealSelf}
              multiline
            />
            <InputField
              label="📈 増やしたい行動"
              placeholder="例：学習, 副業, 運動, 読書, 発信"
              value={desiredActionsText}
              onChangeText={setDesiredActionsText}
              hint="カンマ区切りで入力"
            />
            <InputField
              label="📉 減らしたい行動"
              placeholder="例：先延ばし, SNSだらだら, 夜更かし, 浪費"
              value={avoidActionsText}
              onChangeText={setAvoidActionsText}
              hint="カンマ区切りで入力"
            />
          </View>

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

type InputFieldProps = {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  multiline?: boolean;
  hint?: string;
};

function InputField({ label, placeholder, value, onChangeText, multiline, hint }: InputFieldProps) {
  return (
    <View style={inputStyles.container}>
      <Text style={inputStyles.label}>{label}</Text>
      {hint && <Text style={inputStyles.hint}>{hint}</Text>}
      <TextInput
        style={[inputStyles.input, multiline && inputStyles.multiline]}
        placeholder={placeholder}
        placeholderTextColor="#C0C0D0"
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
    </View>
  );
}

const inputStyles = StyleSheet.create({
  container: {
    gap: 6,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  hint: {
    fontSize: 12,
    color: '#A0A0B8',
    marginTop: -2,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#2C2C3E',
    borderWidth: 1.5,
    borderColor: '#E8E8F0',
    minHeight: 52,
  },
  multiline: {
    minHeight: 88,
    paddingTop: 14,
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
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 40,
    gap: 24,
  },
  header: {
    gap: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1A1A2E',
  },
  subtitle: {
    fontSize: 14,
    color: '#8A8A9A',
  },
  form: {
    gap: 20,
  },
  saveButton: {
    marginTop: 8,
  },
});

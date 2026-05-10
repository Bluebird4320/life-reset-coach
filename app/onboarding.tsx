import { router } from 'expo-router';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';

type Feature = {
  icon: string;
  text: string;
};

const FEATURES: Feature[] = [
  { icon: '🎯', text: '叶えたい未来を設定する' },
  { icon: '📊', text: '今日の行動を見える化する' },
  { icon: '👼', text: '天使・悪魔キャラで状態が分かる' },
];

export default function OnboardingScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <Text style={styles.appIcon}>🌟</Text>
          <Text style={styles.appName}>Life Reset Coach</Text>
          <Text style={styles.catchCopy}>未来の自分に近づく、{'\n'}1日3分のリセット習慣</Text>
        </View>

        <View style={styles.featuresSection}>
          {FEATURES.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <Text style={styles.featureIcon}>{f.icon}</Text>
              <Text style={styles.featureText}>{f.text}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <PrimaryButton
            label="はじめる →"
            onPress={() => router.push('/future-vision-setup')}
            style={styles.startButton}
          />
          <Text style={styles.note}>ログイン不要・無料で使えます</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F5F7FF',
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 60,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  heroSection: {
    alignItems: 'center',
    gap: 16,
    marginBottom: 48,
  },
  appIcon: {
    fontSize: 64,
    marginBottom: 4,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1A2E',
    letterSpacing: 0.5,
  },
  catchCopy: {
    fontSize: 18,
    color: '#4A90E2',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 28,
  },
  featuresSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    gap: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 48,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  featureIcon: {
    fontSize: 28,
    width: 40,
    textAlign: 'center',
  },
  featureText: {
    fontSize: 16,
    color: '#2C2C3E',
    fontWeight: '500',
    flex: 1,
  },
  footer: {
    gap: 16,
    alignItems: 'center',
  },
  startButton: {
    width: '100%',
    paddingVertical: 18,
  },
  note: {
    fontSize: 13,
    color: '#A0A0B8',
  },
});

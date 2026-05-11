import { Redirect } from 'expo-router';
import { useSettingsStore } from '../store/settingsStore';

// アプリ起動時のルーティング
export default function IndexScreen() {
  const onboardingDone = useSettingsStore((s) => s.onboardingDone);
  return <Redirect href={onboardingDone ? '/(tabs)' : '/(auth)/onboarding'} />;
}

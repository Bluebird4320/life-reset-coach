import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { initDB } from '../db/client';
import { useSettingsStore } from '../store/settingsStore';

export default function RootLayout() {
  const load = useSettingsStore((s) => s.load);
  const loaded = useSettingsStore((s) => s.loaded);

  useEffect(() => {
    // DB 初期化と設定ロードを並行実行
    initDB().catch(console.error);
    load();
  }, []);

  // 設定ロード完了まで何も表示しない
  if (!loaded) return null;

  return (
    <>
      {/* animation / presentation の string 型は Expo Go の New Arch で不安定なため省略 */}
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="record" />
      </Stack>
      <StatusBar style="dark" />
    </>
  );
}

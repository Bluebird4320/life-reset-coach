import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#F5F7FF' },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="future-vision-setup" />
        <Stack.Screen name="home" />
        <Stack.Screen name="morning-reset" />
        <Stack.Screen name="today-action" />
        <Stack.Screen name="night-review" />
        <Stack.Screen name="result" />
        <Stack.Screen name="history" />
      </Stack>
      <StatusBar style="dark" />
    </>
  );
}

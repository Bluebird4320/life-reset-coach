import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { loadFutureVision } from '../utils/storage';

export default function Index() {
  const [target, setTarget] = useState<'onboarding' | 'home' | null>(null);

  useEffect(() => {
    loadFutureVision().then((data) => {
      setTarget(data ? 'home' : 'onboarding');
    });
  }, []);

  if (!target) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F7FF' }}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  return <Redirect href={target === 'home' ? '/home' : '/onboarding'} />;
}

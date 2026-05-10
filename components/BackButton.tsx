import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

export function BackButton() {
  const handlePress = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/home');
    }
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handlePress} activeOpacity={0.7}>
      <Text style={styles.label}>← 戻る</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 2,
    marginBottom: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5A5A7A',
  },
});

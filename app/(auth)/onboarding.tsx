import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button } from '../../components/ui/Button';
import { Colors, Radius, Spacing } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { useSettingsStore } from '../../store/settingsStore';

const { width } = Dimensions.get('window');

type Slide = {
  emoji: string;
  title: string;
  body: string;
  gradColors: [string, string];
};

const SLIDES: Slide[] = [
  {
    emoji: '🎯',
    title: '未来のビジョンを\n決めよう',
    body: '叶えたい未来を言葉にすることで\n行動の意味が変わります',
    gradColors: ['#7B5EA7', '#9B7EC8'],
  },
  {
    emoji: '⚡',
    title: '今日の最低限\nアクションを1つ',
    body: '大きな目標より、今日できる\n小さな一歩を積み重ねます',
    gradColors: ['#5E7CB8', '#7B9EC8'],
  },
  {
    emoji: '📈',
    title: '積み上げを\n見える化する',
    body: '継続した日数・時間を記録して\n自分の成長を実感しましょう',
    gradColors: ['#5EA77B', '#7EC89B'],
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatRef = useRef<FlatList<Slide>>(null);
  const update = useSettingsStore((s) => s.update);

  const goNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      const next = currentIndex + 1;
      flatRef.current?.scrollToIndex({ index: next, animated: true });
      setCurrentIndex(next);
    } else {
      handleStart();
    }
  };

  const handleStart = async () => {
    // オンボーディング完了フラグを保存
    await update({ onboardingDone: true });
    router.replace('/(auth)/goal-setup');
  };

  const isLast = currentIndex === SLIDES.length - 1;

  return (
    <SafeAreaView style={styles.safe}>
      {/* スライドエリア */}
      <FlatList
        ref={flatRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        keyExtractor={(_, i) => String(i)}
        style={styles.flatList}
        renderItem={({ item }) => (
          <LinearGradient colors={item.gradColors} style={styles.slide}>
            <Text style={styles.emoji}>{item.emoji}</Text>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.body}>{item.body}</Text>
          </LinearGradient>
        )}
      />

      {/* フッター */}
      <View style={styles.footer}>
        {/* ページインジケーター */}
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === currentIndex && styles.dotActive]}
            />
          ))}
        </View>

        {/* ボタン */}
        <Button
          label={isLast ? 'はじめる →' : '次へ →'}
          onPress={goNext}
          style={styles.btn}
        />

        {/* スキップリンク */}
        {!isLast && (
          <TouchableOpacity onPress={handleStart} activeOpacity={0.7}>
            <Text style={styles.skip}>スキップ</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.primaryDark },
  flatList: { flex: 1 },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
    gap: Spacing.xl,
  },
  emoji: { fontSize: 80 },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 42,
  },
  body: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.md,
    alignItems: 'center',
  },
  dots: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.xs },
  dot: {
    width: 8,
    height: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.border,
  },
  // アクティブなインジケーターはワイドピル形状
  dotActive: {
    width: 24,
    backgroundColor: Colors.primary,
  },
  btn: { width: '100%' },
  skip: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontWeight: '600',
  },
});

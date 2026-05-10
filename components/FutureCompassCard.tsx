import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { CharacterStatus } from '../types';
import { getCharacterStatus } from '../utils/score';

type Props = {
  score: number;
};

type CharacterConfig = {
  emoji: string;
  statusLabel: string;
  message: string;
  bgColor: string;
  accentColor: string;
};

const CHARACTER_CONFIG: Record<CharacterStatus, CharacterConfig> = {
  angel: {
    emoji: '👼',
    statusLabel: '天使モード',
    message: '素晴らしい！あなたは理想の未来に向かっています✨',
    bgColor: '#EBF4FF',
    accentColor: '#4A90E2',
  },
  neutral: {
    emoji: '🌤️',
    statusLabel: 'ニュートラル',
    message: 'まずまずです。もう少し意識してみましょう。',
    bgColor: '#FFF9EB',
    accentColor: '#F5A623',
  },
  devil: {
    emoji: '😈',
    statusLabel: '要注意モード',
    message: 'ちょっと道がずれてるかも。一緒に立て直そう！',
    bgColor: '#FFF0F0',
    accentColor: '#E05C5C',
  },
};

export function FutureCompassCard({ score }: Props) {
  const status = getCharacterStatus(score);
  const config = CHARACTER_CONFIG[status];

  return (
    <View style={[styles.card, { backgroundColor: config.bgColor }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Future Compass</Text>
        <View style={[styles.scoreBadge, { backgroundColor: config.accentColor }]}>
          <Text style={styles.scoreText}>{score}点</Text>
        </View>
      </View>

      <View style={styles.body}>
        {/* キャラクター表示領域 - 後で画像/SVGに差し替え可能 */}
        <View style={[styles.characterContainer, { borderColor: config.accentColor }]}>
          <Text style={styles.characterEmoji}>{config.emoji}</Text>
        </View>

        <View style={styles.info}>
          <View style={[styles.statusBadge, { backgroundColor: config.accentColor }]}>
            <Text style={styles.statusLabel}>{config.statusLabel}</Text>
          </View>
          <Text style={[styles.message, { color: config.accentColor }]}>{config.message}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8A8A9A',
    letterSpacing: 1,
  },
  scoreBadge: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  scoreText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  body: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  characterContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  characterEmoji: {
    fontSize: 40,
  },
  info: {
    flex: 1,
    gap: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  message: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '500',
  },
});

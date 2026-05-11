import { StyleSheet, View } from 'react-native';
import { Colors, Radius } from '../../constants/colors';

type ProgressBarProps = {
  progress: number; // 0.0 〜 1.0
  color?: string;
  height?: number;
};

export function ProgressBar({
  progress,
  color = Colors.primary,
  height = 8,
}: ProgressBarProps) {
  const pct = Math.min(Math.max(progress, 0), 1) * 100;

  return (
    <View style={[styles.track, { height }]}>
      <View
        style={[
          styles.fill,
          {
            width: `${pct}%`,
            backgroundColor: color,
            height,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    backgroundColor: Colors.border,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: Radius.full,
  },
});

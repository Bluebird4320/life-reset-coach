import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Radius, Spacing } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { formatSeconds } from '../../lib/dateUtils';

type TimerWidgetProps = {
  elapsed: number;
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
};

export function TimerWidget({
  elapsed,
  isRunning,
  onStart,
  onPause,
  onReset,
}: TimerWidgetProps) {
  return (
    <View style={styles.container}>
      {/* 経過時間表示 */}
      <View style={styles.timeBox}>
        <Text style={styles.timeText}>{formatSeconds(elapsed)}</Text>
        <Text style={styles.timeLabel}>経過時間</Text>
      </View>

      {/* コントロールボタン */}
      <View style={styles.controls}>
        {!isRunning ? (
          <TouchableOpacity style={styles.startBtn} onPress={onStart} activeOpacity={0.85}>
            <Text style={styles.startBtnText}>▶ 開始</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.pauseBtn} onPress={onPause} activeOpacity={0.85}>
            <Text style={styles.pauseBtnText}>⏸ 一時停止</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.resetBtn} onPress={onReset} activeOpacity={0.85}>
          <Text style={styles.resetBtnText}>↺ リセット</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: Spacing.lg,
  },
  timeBox: {
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.xl,
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.xxl,
    minWidth: 200,
  },
  timeText: {
    fontSize: 42,
    fontWeight: '800',
    color: Colors.primaryDark,
    letterSpacing: 2,
  },
  timeLabel: {
    ...Typography.caption,
    marginTop: Spacing.xs,
  },
  controls: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  startBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
  startBtnText: {
    ...Typography.buttonText,
  },
  pauseBtn: {
    backgroundColor: Colors.primaryMid,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
  pauseBtnText: {
    ...Typography.buttonText,
    color: Colors.primaryDark,
  },
  resetBtn: {
    backgroundColor: 'transparent',
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  resetBtnText: {
    ...Typography.buttonText,
    color: Colors.textMuted,
  },
});

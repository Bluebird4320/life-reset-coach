import { StyleSheet, Text, View } from 'react-native';
import { Colors, Radius, Spacing } from '../../constants/colors';
import { Typography } from '../../constants/typography';

type DayStatus = 'done' | 'partial' | 'failed' | 'empty';

type CalendarDay = {
  date: string;
  status: DayStatus;
};

type CalendarHeatmapProps = {
  days: CalendarDay[];
};

const STATUS_COLORS: Record<DayStatus, string> = {
  done: Colors.success,
  partial: Colors.warning,
  failed: Colors.danger,
  empty: Colors.border,
};

// TODO: Phase 2 で本格実装（現在は簡易グリッド表示）
export function CalendarHeatmap({ days }: CalendarHeatmapProps) {
  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {days.map((day) => (
          <View
            key={day.date}
            style={[styles.cell, { backgroundColor: STATUS_COLORS[day.status] }]}
          />
        ))}
      </View>
      <View style={styles.legend}>
        {(Object.entries(STATUS_COLORS) as [DayStatus, string][])
          .filter(([k]) => k !== 'empty')
          .map(([status, color]) => (
            <View key={status} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: color }]} />
              <Text style={styles.legendText}>
                {status === 'done' ? 'できた' : status === 'partial' ? '一部' : '未達成'}
              </Text>
            </View>
          ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.sm },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  cell: {
    width: 14,
    height: 14,
    borderRadius: Radius.sm / 2,
  },
  legend: {
    flexDirection: 'row',
    gap: Spacing.md,
    justifyContent: 'flex-end',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    ...Typography.caption,
    fontSize: 11,
  },
});

import { BarChart } from 'react-native-gifted-charts';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, Radius, Spacing } from '../../constants/colors';
import { Typography } from '../../constants/typography';

type DayData = {
  label: string;
  minutes: number;
};

type BarChartWeeklyProps = {
  data: DayData[];
};

export function BarChartWeekly({ data }: BarChartWeeklyProps) {
  const barData = data.map((d) => ({
    value: d.minutes,
    label: d.label,
    frontColor: Colors.primary,
    gradientColor: Colors.primaryMid,
    topLabelComponent: () =>
      d.minutes > 0 ? (
        <Text style={styles.barLabel}>{d.minutes}</Text>
      ) : null,
  }));

  if (data.every((d) => d.minutes === 0)) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>この期間の記録はありません</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BarChart
        data={barData}
        barWidth={32}
        spacing={16}
        roundedTop
        roundedBottom
        hideRules
        hideAxesAndRules
        isAnimated
        noOfSections={4}
        maxValue={Math.max(...data.map((d) => d.minutes), 30)}
        barBorderRadius={Radius.sm}
        labelWidth={32}
        xAxisLabelTextStyle={styles.xLabel}
        yAxisTextStyle={styles.yLabel}
        disableScroll
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: Spacing.sm,
  },
  barLabel: {
    ...Typography.caption,
    color: Colors.primaryDark,
    fontSize: 10,
  },
  xLabel: {
    ...Typography.caption,
    fontSize: 11,
  },
  yLabel: {
    ...Typography.caption,
    fontSize: 10,
  },
  empty: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...Typography.caption,
  },
});

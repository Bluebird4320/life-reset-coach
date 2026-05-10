import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { formatMinutes } from '../utils/date';

export type BarChartItem = {
  label: string;
  value: number; // minutes
};

type SimpleBarChartProps = {
  data: BarChartItem[];
  maxValue?: number;
  accentColor?: string;
};

export function SimpleBarChart({
  data,
  maxValue,
  accentColor = '#4A90E2',
}: SimpleBarChartProps) {
  const computedMax = maxValue ?? Math.max(...data.map((d) => d.value), 1);

  if (data.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>データがありません</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {data.map((item, index) => {
        const pct = computedMax > 0 ? Math.min((item.value / computedMax) * 100, 100) : 0;
        const hasValue = item.value > 0;
        return (
          <View key={index} style={styles.row}>
            <Text style={styles.label} numberOfLines={1}>
              {item.label}
            </Text>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  { width: `${pct}%` as `${number}%`, backgroundColor: accentColor },
                  !hasValue && styles.barEmpty,
                ]}
              />
            </View>
            <Text style={[styles.value, !hasValue && styles.valueMuted]}>
              {hasValue ? formatMinutes(item.value) : '-'}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    width: 56,
    fontSize: 12,
    color: '#5A5A7A',
    fontWeight: '500',
  },
  barTrack: {
    flex: 1,
    height: 14,
    backgroundColor: '#EEEEF6',
    borderRadius: 7,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 7,
    minWidth: 4,
  },
  barEmpty: {
    width: 0,
  },
  value: {
    width: 64,
    fontSize: 12,
    color: '#4A90E2',
    fontWeight: '700',
    textAlign: 'right',
  },
  valueMuted: {
    color: '#C0C0D0',
    fontWeight: '500',
  },
  empty: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#A0A0B8',
  },
});

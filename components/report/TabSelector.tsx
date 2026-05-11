import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Radius, Spacing } from '../../constants/colors';
import { Typography } from '../../constants/typography';

type Tab = { key: string; label: string };

type TabSelectorProps = {
  tabs: Tab[];
  activeKey: string;
  onSelect: (key: string) => void;
};

export function TabSelector({ tabs, activeKey, onSelect }: TabSelectorProps) {
  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[styles.tab, activeKey === tab.key && styles.tabActive]}
          onPress={() => onSelect(tab.key)}
          activeOpacity={0.7}
        >
          <Text style={[styles.label, activeKey === tab.key && styles.labelActive]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.lg,
    padding: 4,
    gap: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: Radius.md,
  },
  tabActive: { backgroundColor: Colors.card },
  label: {
    ...Typography.caption,
    fontWeight: '600',
  },
  labelActive: { color: Colors.primary },
});

import { StyleSheet, Switch, Text, View } from 'react-native';
import { Colors, Spacing } from '../../constants/colors';
import { Typography } from '../../constants/typography';

type ToggleProps = {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
};

export function Toggle({ label, description, value, onValueChange }: ToggleProps) {
  return (
    <View style={styles.row}>
      <View style={styles.textWrap}>
        <Text style={styles.label}>{label}</Text>
        {description ? <Text style={styles.desc}>{description}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ true: Colors.primary, false: Colors.border }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  textWrap: { flex: 1, marginRight: Spacing.md },
  label: {
    ...Typography.cardTitle,
    fontSize: 14,
  },
  desc: {
    ...Typography.caption,
    marginTop: 2,
  },
});

import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Colors, Radius, Spacing } from '../../constants/colors';
import { Typography } from '../../constants/typography';

type MemoInputProps = {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  maxLength?: number;
};

export function MemoInput({
  label,
  placeholder,
  value,
  onChangeText,
  maxLength = 200,
}: MemoInputProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.count}>
          {value.length}/{maxLength}
        </Text>
      </View>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={Colors.primaryMid}
        value={value}
        onChangeText={onChangeText}
        maxLength={maxLength}
        multiline
        textAlignVertical="top"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.sm },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: { ...Typography.cardTitle },
  count: { ...Typography.caption },
  input: {
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.md,
    padding: Spacing.md,
    paddingTop: Spacing.md,
    fontSize: 14,
    color: Colors.primaryDark,
    borderWidth: 1.5,
    borderColor: Colors.border,
    minHeight: 80,
  },
});

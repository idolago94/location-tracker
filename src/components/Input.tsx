import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';

export interface InputProps extends TextInputProps {
  label?: string;
}

export default function Input({ label, style, ...restProps }: InputProps) {
  return (
    <View>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput style={[styles.input, style]} {...restProps} />
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    padding: 8,
    borderRadius: 8,
  },
});

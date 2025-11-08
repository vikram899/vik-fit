import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { COLORS, SPACING, TYPOGRAPHY } from "../../constants";

/**
 * FormInput
 * Reusable text input component with label for forms
 *
 * Props:
 * - label: string - label text
 * - placeholder: string - placeholder text
 * - value: string - input value
 * - onChangeText: function - callback when text changes
 * - keyboardType: string - keyboard type (default: 'default')
 * - editable: boolean - whether input is editable (default: true)
 */
const FormInput = ({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType = "default",
  editable = true,
}) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, !editable && styles.disabled]}
        placeholder={placeholder}
        placeholderTextColor={COLORS.mediumGray}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        editable={editable}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.container,
  },
  label: {
    ...TYPOGRAPHY.label,
    color: COLORS.textPrimary,
    marginBottom: SPACING.small,
  },
  input: {
    backgroundColor: COLORS.secondaryBackground,
    borderWidth: 1,
    borderColor: COLORS.mediumGray,
    borderRadius: SPACING.borderRadius,
    paddingHorizontal: SPACING.element,
    paddingVertical: SPACING.small,
    fontSize: TYPOGRAPHY.body.fontSize,
    color: COLORS.textPrimary,
    minHeight: 44,
  },
  disabled: {
    opacity: 0.6,
  },
});

export default FormInput;

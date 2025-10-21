import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { COLORS } from '../constants/colors';
import { SPACING, TYPOGRAPHY } from '../constants/spacing';

/**
 * Reusable Input Component
 * @param {string} placeholder - Placeholder text
 * @param {string} value - Input value
 * @param {function} onChangeText - Callback when text changes
 * @param {boolean} multiline - Allow multiline input
 * @param {string} label - Label text above input
 * @param {string} keyboardType - Keyboard type for input
 * @param {boolean} clearable - Show clear button when text is entered
 * @param {number} maxLength - Maximum character length
 * @param {object} style - Additional custom styles
 * @param {function} onClear - Callback when clear button is pressed
 */
export default function Input({
  placeholder,
  value,
  onChangeText,
  multiline = false,
  label,
  keyboardType = 'default',
  clearable = false,
  maxLength,
  style,
  onClear,
  ...props
}) {
  const [focused, setFocused] = useState(false);

  const handleClear = () => {
    onChangeText('');
    if (onClear) {
      onClear();
    }
  };

  const showClear = clearable && value && value.length > 0;

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          focused && styles.inputContainerFocused,
          multiline && styles.multilineContainer,
        ]}
      >
        <TextInput
          style={[
            styles.input,
            multiline && styles.multilineInput,
          ]}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textSecondary}
          value={value}
          onChangeText={onChangeText}
          multiline={multiline}
          keyboardType={keyboardType}
          maxLength={maxLength}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          editable={true}
          selectTextOnFocus
          {...props}
        />
        {showClear && (
          <TouchableOpacity
            onPress={handleClear}
            style={styles.clearButton}
            accessibilityLabel="Clear input"
            accessibilityRole="button"
          >
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: SPACING.element,
  },
  label: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textPrimary,
    marginBottom: SPACING.small,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: SPACING.inputHeight,
    borderRadius: SPACING.borderRadius,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    paddingHorizontal: SPACING.element,
    backgroundColor: COLORS.background,
  },
  inputContainerFocused: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  multilineContainer: {
    height: undefined,
    minHeight: 100,
    paddingVertical: SPACING.element,
    alignItems: 'flex-start',
  },
  input: {
    flex: 1,
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    padding: 0,
    margin: 0,
  },
  multilineInput: {
    textAlignVertical: 'top',
  },
  clearButton: {
    padding: SPACING.small,
    marginLeft: SPACING.small,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: SPACING.minTouchTarget,
    minHeight: SPACING.minTouchTarget,
  },
  clearIcon: {
    fontSize: 20,
    color: COLORS.textSecondary,
    fontWeight: 'bold',
  },
});

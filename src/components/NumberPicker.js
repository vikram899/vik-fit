import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';
import { SPACING, TYPOGRAPHY } from '../constants/spacing';

/**
 * NumberPicker Component - Plus/Minus control for numeric input
 * @param {string} label - Label text above component
 * @param {number} value - Current numeric value
 * @param {function} onChange - Callback when value changes
 * @param {number} min - Minimum value (default: 0)
 * @param {number} max - Maximum value (default: 1000)
 * @param {number} step - Increment/decrement step (default: 1)
 * @param {boolean} allowDecimal - Allow decimal values (default: false)
 */
export default function NumberPicker({
  label,
  value,
  onChange,
  min = 0,
  max = 1000,
  step = 1,
  allowDecimal = false,
  ...props
}) {
  const handleMinus = () => {
    const newValue = Math.max(min, value - step);
    onChange(newValue);
  };

  const handlePlus = () => {
    const newValue = Math.min(max, value + step);
    onChange(newValue);
  };

  const displayValue = allowDecimal
    ? value.toFixed(1).replace(/\.?0+$/, '') // Remove trailing zeros
    : Math.floor(value);

  return (
    <View style={styles.container} {...props}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.pickerContainer}>
        <TouchableOpacity
          style={[styles.button, styles.minusButton]}
          onPress={handleMinus}
          disabled={value <= min}
          activeOpacity={0.7}
          accessibilityLabel={`Decrease ${label || 'value'}`}
          accessibilityRole="button"
          accessibilityHint={`Current value: ${displayValue}`}
        >
          <Text style={styles.buttonText}>−</Text>
        </TouchableOpacity>

        <View style={styles.valueContainer}>
          <Text style={styles.value}>{displayValue}</Text>
        </View>

        <TouchableOpacity
          style={[styles.button, styles.plusButton]}
          onPress={handlePlus}
          disabled={value >= max}
          activeOpacity={0.7}
          accessibilityLabel={`Increase ${label || 'value'}`}
          accessibilityRole="button"
          accessibilityHint={`Current value: ${displayValue}`}
        >
          <Text style={styles.buttonText}>+</Text>
        </TouchableOpacity>
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
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  button: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.gray,
  },
  minusButton: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  plusButton: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  buttonText: {
    fontSize: 28,
    color: COLORS.primary,
    fontWeight: '300',
  },
  valueContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  value: {
    ...TYPOGRAPHY.screenTitle,
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
});

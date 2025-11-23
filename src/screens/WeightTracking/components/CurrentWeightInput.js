/**
 * CURRENT WEIGHT INPUT COMPONENT
 *
 * Input field for current weight with quick adjustment buttons.
 * Users can type directly or use ±0.5kg and ±1kg buttons for quick adjustments.
 */

import React from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../shared/constants';

const CurrentWeightInput = ({ value, onValueChange, title = "Today's Weight" }) => {
  const handleAdjustment = (adjustment) => {
    const currentValue = parseFloat(value) || 0;
    const newValue = currentValue + adjustment;
    // Ensure value stays within reasonable bounds
    if (newValue > 0) {
      onValueChange(newValue.toString());
    }
  };

  const adjustmentButtons = [
    { label: '-1', value: -1 },
    { label: '-0.5', value: -0.5 },
    { label: '+0.5', value: 0.5 },
    { label: '+1', value: 1 },
  ];

  return (
    <View style={styles.card}>
      {/* Header with title and icon */}
      <View style={styles.header}>
        <MaterialCommunityIcons
          name="scale-bathroom"
          size={20}
          color={COLORS.primary}
        />
        <Text style={styles.title}>{title}</Text>
      </View>

      {/* Input field with unit */}
      <View style={styles.inputField}>
        <TextInput
          style={styles.input}
          placeholder="0"
          placeholderTextColor={COLORS.textTertiary}
          keyboardType="decimal-pad"
          value={value}
          onChangeText={onValueChange}
        />
        <Text style={styles.unit}>kg</Text>
      </View>

      {/* Adjustment buttons row */}
      <View style={styles.buttonsContainer}>
        {adjustmentButtons.map((btn) => (
          <TouchableOpacity
            key={btn.label}
            style={[
              styles.adjustmentButton,
              btn.value < 0 ? styles.negativeButton : styles.positiveButton,
            ]}
            onPress={() => handleAdjustment(btn.value)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.buttonText,
                btn.value < 0 ? styles.negativeText : styles.positiveText,
              ]}
            >
              {btn.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.secondaryBackground,
    borderRadius: SPACING.borderRadiusLarge,
    padding: SPACING.element,
    marginHorizontal: SPACING.element,
    marginVertical: SPACING.small,
    borderWidth: 1,
    borderColor: COLORS.mediumGray,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.element,
  },
  title: {
    ...TYPOGRAPHY.sectionTitle,
    marginLeft: SPACING.small,
    color: COLORS.textPrimary,
  },
  inputField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.mainBackground,
    borderWidth: 1,
    borderColor: COLORS.mediumGray,
    borderRadius: SPACING.borderRadius,
    paddingHorizontal: SPACING.small,
    marginBottom: SPACING.element,
  },
  input: {
    flex: 1,
    paddingVertical: SPACING.element,
    ...TYPOGRAPHY.pageTitle,
    color: COLORS.primary,
  },
  unit: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textTertiary,
    marginLeft: SPACING.small,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.small,
  },
  adjustmentButton: {
    flex: 1,
    paddingVertical: SPACING.small,
    paddingHorizontal: SPACING.xs,
    borderRadius: SPACING.borderRadius,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  negativeButton: {
    backgroundColor: COLORS.mainBackground,
    borderColor: COLORS.weightGain,
  },
  positiveButton: {
    backgroundColor: COLORS.mainBackground,
    borderColor: COLORS.weightLoss,
  },
  buttonText: {
    ...TYPOGRAPHY.body,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  negativeText: {
    color: COLORS.weightGain,
  },
  positiveText: {
    color: COLORS.weightLoss,
  },
});

export default CurrentWeightInput;

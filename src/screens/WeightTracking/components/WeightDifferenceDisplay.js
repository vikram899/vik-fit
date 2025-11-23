/**
 * WEIGHT DIFFERENCE DISPLAY COMPONENT
 *
 * Shows the difference between current and target weight.
 * Color-coded: green for loss, red for gain, gray for on-target.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../shared/constants';

const WeightDifferenceDisplay = ({ currentWeight, targetWeight }) => {
  if (!currentWeight || !targetWeight) {
    return null;
  }

  const current = parseFloat(currentWeight);
  const target = parseFloat(targetWeight);
  const difference = current - target;

  const getDifferenceColor = () => {
    if (difference > 0) return COLORS.weightGain; // Red for gaining
    if (difference < 0) return COLORS.weightLoss; // Green for losing
    return COLORS.textSecondary; // Gray for on target
  };

  const getDifferenceText = () => {
    if (difference > 0) {
      return `Reduce ${Math.abs(difference).toFixed(1)} kgs`;
    }
    if (difference < 0) {
      return `Gain ${Math.abs(difference).toFixed(1)} kgs`;
    }
    return "You're at your goal!";
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.text, { color: getDifferenceColor() }]}>
        {getDifferenceText()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.mainBackground,
    borderRadius: SPACING.borderRadius,
    padding: SPACING.small,
    marginHorizontal: SPACING.element,
    marginVertical: SPACING.small,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.mediumGray,
  },
  text: {
    ...TYPOGRAPHY.pageTitle,
  },
});

export default WeightDifferenceDisplay;

/**
 * PROGRESS SUMMARY CARD COMPONENT
 *
 * Displays weight change progress over 30 days and latest entry date.
 * Color-coded: green for loss, red for gain.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../shared/constants';
import { Card } from '../../../shared/components/ui';

const ProgressSummaryCard = ({ weightChange, latestEntryDate }) => {
  if (weightChange === null) {
    return null;
  }

  const getChangeColor = () => {
    return weightChange > 0 ? COLORS.weightGain : COLORS.weightLoss;
  };

  return (
    <Card title="Progress">
      <View style={styles.row}>
        <Text style={styles.label}>Weight Change (30 Days)</Text>
        <Text style={[styles.value, { color: getChangeColor() }]}>
          {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} kg
        </Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.row}>
        <Text style={styles.label}>Latest Entry</Text>
        <Text style={styles.value}>{latestEntryDate}</Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.small,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.mediumGray,
    marginVertical: SPACING.small,
  },
  label: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  value: {
    ...TYPOGRAPHY.body,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
  },
});

export default ProgressSummaryCard;

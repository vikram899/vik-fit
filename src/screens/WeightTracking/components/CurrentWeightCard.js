/**
 * CURRENT WEIGHT CARD COMPONENT
 *
 * Displays current weight prominently and weight change over last 30 days.
 * Color-coded: green for loss, red for gain.
 */

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, SPACING, TYPOGRAPHY } from "../../../shared/constants";
import { Card } from "../../../shared/components/ui";

const CurrentWeightCard = ({ currentWeight, weightChange }) => {
  if (!currentWeight) {
    return null;
  }

  const current = parseFloat(currentWeight);
  const getChangeColor = () => {
    if (weightChange === null || weightChange === undefined)
      return COLORS.textTertiary;
    return weightChange > 0 ? COLORS.weightGain : COLORS.weightLoss;
  };

  const getChangeLabel = () => {
    if (weightChange === null || weightChange === undefined) return "No data";
    return weightChange > 0
      ? `+${weightChange.toFixed(1)} kg`
      : `${weightChange.toFixed(1)} kg`;
  };

  return (
    <Card>
      <View style={styles.container}>
        {/* Current Weight */}
        <View style={styles.weightSection}>
          <Text style={styles.label}>Current Weight</Text>
          <Text style={styles.weight}>{current.toFixed(1)} kg</Text>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* 30-Day Change */}
        <View style={styles.changeSection}>
          <Text style={styles.label}>Change (30 Days)</Text>
          <Text style={[styles.change, { color: getChangeColor() }]}>
            {getChangeLabel()}
          </Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  weightSection: {
    flex: 1,
    alignItems: "center",
  },
  changeSection: {
    flex: 1,
    alignItems: "center",
  },
  label: {
    ...TYPOGRAPHY.small,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  weight: {
    ...TYPOGRAPHY.pageTitle,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.bold,
    fontSize: 24,
  },
  change: {
    ...TYPOGRAPHY.sectionTitle,
    fontWeight: TYPOGRAPHY.weights.bold,
    fontSize: 24,
  },
  divider: {
    width: 1,
    height: 50,
    backgroundColor: COLORS.mediumGray,
    marginHorizontal: SPACING.element,
  },
});

export default CurrentWeightCard;

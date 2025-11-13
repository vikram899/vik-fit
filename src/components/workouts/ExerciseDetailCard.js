import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, SPACING, TYPOGRAPHY } from "../../shared/constants";

/**
 * ExerciseDetailCard
 * Reusable card component for displaying exercise details (sets, reps, weight)
 * Uses dark theme with tertiaryBackground
 *
 * Props:
 * - label: Label text for the detail (e.g., "Sets", "Reps", "Weight")
 * - value: Value to display
 * - unit: Optional unit text (e.g., "kg", "s")
 */
const ExerciseDetailCard = ({ label, value, unit = "" }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.valueContainer}>
        <Text style={styles.value}>{value}</Text>
        {unit && <Text style={styles.unit}>{unit}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: COLORS.tertiaryBackground,
    paddingHorizontal: SPACING.element,
    paddingVertical: SPACING.small,
    borderRadius: SPACING.borderRadius,
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.weights.medium,
    marginBottom: SPACING.xs,
  },
  valueContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: SPACING.xs,
  },
  value: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
  },
  unit: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.textSecondary,
  },
});

export default ExerciseDetailCard;

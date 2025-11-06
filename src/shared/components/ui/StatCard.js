/**
 * REUSABLE STAT CARD COMPONENT
 *
 * Displays a statistic with icon, label, value, and optional progress.
 * Used for macro tracking, achievement badges, metrics display, etc.
 *
 * Features:
 * - Icon support
 * - Optional progress indicator
 * - Optional goal comparison
 * - Color-coded status
 * - Compact and expanded modes
 *
 * @example
 * <StatCard
 *   icon="flame"
 *   label="Calories"
 *   value="1,250"
 *   unit="kcal"
 *   progress={75}
 *   goal="1,667"
 * />
 *
 * @example simple
 * <StatCard
 *   label="Workouts"
 *   value="5"
 *   unit="this week"
 * />
 */

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import ProgressBar from "./ProgressBar";
import { getProgressColor } from "../../../shared/utils";
import { COLORS, SPACING, TYPOGRAPHY } from "../../../shared/constants";

const StatCard = ({
  // Content
  label,
  value,
  unit,
  icon,
  goal,
  progress,

  // Appearance
  variant = "default", // 'default', 'highlighted'
  showProgress = false,
}) => {
  // Determine if progress should be shown
  const shouldShowProgress = showProgress && progress !== undefined;

  // Get icon color based on progress if available
  const getIconColor = () => {
    if (!shouldShowProgress) return COLORS.primary;
    return getProgressColor(progress);
  };

  return (
    <View
      style={[
        styles.container,
        variant === "highlighted" && styles.containerHighlighted,
      ]}
    >
      {/* Icon and Label Row */}
      <View style={styles.headerRow}>
        {icon && (
          <MaterialCommunityIcons
            name={icon}
            size={24}
            color={getIconColor()}
            style={styles.icon}
          />
        )}
        <Text style={styles.label}>{label}</Text>
      </View>

      {/* Value and Unit Row */}
      <View style={styles.valueRow}>
        <Text style={styles.value}>{value}</Text>
        {unit && <Text style={styles.unit}>{unit}</Text>}
      </View>

      {/* Goal comparison */}
      {goal && !shouldShowProgress && (
        <Text style={styles.goal}>Goal: {goal}</Text>
      )}

      {/* Progress bar */}
      {shouldShowProgress && (
        <View style={styles.progressContainer}>
          <ProgressBar percentage={progress} animated height={6} />
          <Text style={styles.progressText}>{Math.round(progress)}%</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: SPACING.borderRadiusLarge,
    padding: SPACING.element,
    borderWidth: 1,
    borderColor: COLORS.mediumGray,
    marginBottom: SPACING.element,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  containerHighlighted: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
    borderWidth: 2,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.small,
  },

  icon: {
    marginRight: SPACING.small,
  },

  label: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textTertiary,
    fontWeight: TYPOGRAPHY.weights.semibold,
    flex: 1,
  },

  valueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: SPACING.small,
  },

  value: {
    ...TYPOGRAPHY.pageTitle,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.bold,
  },

  unit: {
    ...TYPOGRAPHY.small,
    color: COLORS.textTertiary,
    marginLeft: SPACING.xs,
  },

  goal: {
    ...TYPOGRAPHY.tiny,
    color: COLORS.textTertiary,
  },

  progressContainer: {
    marginTop: SPACING.small,
  },

  progressText: {
    ...TYPOGRAPHY.tiny,
    color: COLORS.textTertiary,
    marginTop: SPACING.xs,
    textAlign: "right",
  },
});

export default StatCard;

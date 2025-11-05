import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, SPACING, TYPOGRAPHY } from "../shared/constants";

/**
 * StatBadge Component - Reusable nutrition stat badge
 * Displays a stat (calories, protein, carbs, fats) with icon, label, and value
 *
 * Props:
 * - icon: string - Material Community Icons name (e.g., 'fire', 'dumbbell')
 * - label: string - Label text (e.g., 'cal', 'protein', 'carbs', 'fats')
 * - value: number - The numeric value to display
 * - unit: string - Unit text (e.g., 'g', '' for calories)
 * - iconColor: string - Color for the icon
 * - backgroundColor: string - Background color for the badge
 */
const StatBadge = ({
  icon,
  label,
  value,
  unit = "",
  iconColor,
  backgroundColor,
}) => {
  return (
    <View style={[styles.statBadge, { backgroundColor }]}>
      <MaterialCommunityIcons name={icon} size={13} color={iconColor} />
      <View style={styles.badgeContent}>
        <Text style={styles.statBadgeLabel}>{label}</Text>
        <Text style={styles.statBadgeValue}>
          {Math.round(value || 0)}
          {unit}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  statBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.small,
    paddingVertical: SPACING.small,
    borderRadius: SPACING.borderRadiusLarge,
    gap: SPACING.xs,
    flex: 1,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.08)",
    opacity: 0.8,
  },
  badgeContent: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: SPACING.xs,
  },
  statBadgeLabel: {
    ...TYPOGRAPHY.tiny,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text,
    textTransform: "capitalize",
  },
  statBadgeValue: {
    ...TYPOGRAPHY.small,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
  },
});

export default StatBadge;

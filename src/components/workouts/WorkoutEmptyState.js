import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, SPACING, TYPOGRAPHY } from "../../shared/constants";

/**
 * WorkoutEmptyState
 * Empty state component displayed when there are no workouts
 *
 * Props:
 * - type: 'no-assigned' | 'no-found' | 'no-created'
 */
const WorkoutEmptyState = ({ type = "no-created" }) => {
  const config = {
    "no-assigned": {
      icon: "calendar-blank",
      title: "No Workouts Assigned for Today",
      subtitle: "",
      iconColor: COLORS.primary,
    },
    "no-found": {
      icon: "dumbbell",
      title: "No Workouts Found",
      subtitle: "Try adjusting your search or filters",
      iconColor: COLORS.textSecondary,
    },
    "no-created": {
      icon: "dumbbell",
      title: "No Workouts Created",
      subtitle: "Create your first workout routine",
      iconColor: COLORS.textSecondary,
    },
  };

  const current = config[type] || config["no-created"];

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons
        name={current.icon}
        size={64}
        color={current.iconColor}
      />
      <Text style={styles.title}>{current.title}</Text>
      {current.subtitle && (
        <Text style={styles.subtitle}>{current.subtitle}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: SPACING.container,
    paddingHorizontal: SPACING.element,
    gap: SPACING.medium,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
    textAlign: "center",
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
});

export default WorkoutEmptyState;

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, SPACING, TYPOGRAPHY } from "../../shared/constants";

/**
 * WorkoutHeader
 * Reusable header component for workout screens
 *
 * Props:
 * - title: Workout name/title
 * - subtitle: Subtitle text (e.g., "5 exercises")
 * - isEditMode: Boolean to show edit/done button
 * - onEditModeToggle: Callback when edit/done button is pressed
 * - onMenuPress: Callback when menu button is pressed
 */
const WorkoutHeader = ({
  title,
  subtitle,
  isEditMode = false,
  onEditModeToggle,
  onMenuPress,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.titleSection}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>

      <TouchableOpacity onPress={isEditMode ? onEditModeToggle : onMenuPress}>
        {isEditMode ? (
          <Text style={styles.doneText}>Done</Text>
        ) : (
          <MaterialCommunityIcons
            name="dots-vertical"
            size={24}
            color={COLORS.textSecondary}
          />
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: SPACING.element,
    paddingVertical: SPACING.element,
    backgroundColor: COLORS.mainBackground,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.secondaryBackground,
  },
  titleSection: {
    flex: 1,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  doneText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.primary,
  },
});

export default WorkoutHeader;

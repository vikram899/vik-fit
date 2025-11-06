import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, SPACING, TYPOGRAPHY } from "../../shared/constants";

/**
 * AllMealsEmptyState Component
 * Reusable empty state for when no meals are found
 *
 * Props:
 * - hasAnyMeals: boolean - whether any meals exist (true = show "No Meals Found", false = show "No Meals Created")
 * - onCreatePress: function - callback when user clicks create button
 */
const AllMealsEmptyState = ({ hasAnyMeals = false, onCreatePress }) => {
  const isNoMealsAtAll = !hasAnyMeals;

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons
        name="silverware-fork-knife"
        size={64}
        color={COLORS.textSecondary}
      />
      <Text style={styles.title}>
        {isNoMealsAtAll ? "No Meals Created" : "No Meals Found"}
      </Text>
      <Text style={styles.subtitle}>
        {isNoMealsAtAll
          ? "Create your first meal"
          : "Try adjusting your search"}
      </Text>
      {isNoMealsAtAll && (
        <TouchableOpacity onPress={onCreatePress} style={styles.button}>
          <MaterialCommunityIcons name="plus" size={20} color={COLORS.white} />
          <Text style={styles.buttonText}>Create Meal</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: SPACING.container * 2,
    paddingHorizontal: SPACING.element,
  },
  title: {
    ...TYPOGRAPHY.sectionTitle,
    color: COLORS.textPrimary,
    marginTop: SPACING.small,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: SPACING.container,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.small,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.small,
    paddingHorizontal: SPACING.container,
    borderRadius: SPACING.borderRadius,
  },
  buttonText: {
    ...TYPOGRAPHY.small,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.white,
  },
});

export default AllMealsEmptyState;

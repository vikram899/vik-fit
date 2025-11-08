import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { COLORS, SPACING, TYPOGRAPHY } from "../../shared/constants";

/**
 * WorkoutTabNavigation
 * Tab navigation component for Today/All Workouts tabs
 *
 * Props:
 * - activeTab: 'today' or 'all'
 * - onTabChange: callback when tab is pressed
 * - todayWorkoutCount: number of workouts for today
 */
const WorkoutTabNavigation = ({
  activeTab,
  onTabChange,
  todayWorkoutCount = 0,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.tab, activeTab === "today" && styles.tabActive]}
        onPress={() => onTabChange("today")}
      >
        <Text
          style={[styles.tabText, activeTab === "today" && styles.tabTextActive]}
        >
          Today
        </Text>
        {todayWorkoutCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{todayWorkoutCount}</Text>
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, activeTab === "all" && styles.tabActive]}
        onPress={() => onTabChange("all")}
      >
        <Text
          style={[styles.tabText, activeTab === "all" && styles.tabTextActive]}
        >
          All Workouts
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: COLORS.mainBackground,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.secondaryBackground,
    paddingHorizontal: SPACING.element,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.medium,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
    flexDirection: "row",
    gap: SPACING.xs,
  },
  tabActive: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.primary,
  },
  badge: {
    backgroundColor: COLORS.primary,
    borderRadius: SPACING.borderRadiusSmall,
    paddingHorizontal: SPACING.xs,
    paddingVertical: SPACING.xs,
    minWidth: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.white,
  },
});

export default WorkoutTabNavigation;

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { StatCard } from "../common";
import { COLORS, SPACING, TYPOGRAPHY } from "../../shared/constants";

/**
 * WeeklyWorkoutSummaryCards Component
 * Shows weekly workout and exercise totals vs last week with percentage change
 * Uses reusable StatCard component for consistency
 */
const WeeklyWorkoutSummaryCards = ({ currentWeekData, lastWeekData, scheduledGoals }) => {
  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>Weekly Summary</Text>
        <Text style={styles.subtitle}>vs Last Week</Text>
      </View>

      <View style={styles.cardsGrid}>
        <StatCard
          label="Workouts"
          icon="dumbbell"
          currentValue={currentWeekData.workoutsCompleted}
          previousValue={lastWeekData.workoutsCompleted}
          goal={scheduledGoals?.totalScheduledWorkouts}
          unit=""
          showGoal={false}
        />
        <StatCard
          label="Exercises"
          icon="lightning-bolt"
          currentValue={currentWeekData.exercisesCompleted}
          previousValue={lastWeekData.exercisesCompleted}
          goal={scheduledGoals?.totalScheduledExercises}
          unit=""
          showGoal={false}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.element,
    marginBottom: SPACING.container,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.element,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textSecondary,
  },
  cardsGrid: {
    flexDirection: "row",
    gap: SPACING.medium,
  },
});

export default WeeklyWorkoutSummaryCards;

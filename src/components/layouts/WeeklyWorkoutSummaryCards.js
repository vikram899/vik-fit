import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { StatCard } from "../common";
import { COLORS } from "../../styles";

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
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
  },
  subtitle: {
    fontSize: 12,
    color: "#999",
  },
  cardsGrid: {
    flexDirection: "row",
    gap: 12,
  },
});

export default WeeklyWorkoutSummaryCards;

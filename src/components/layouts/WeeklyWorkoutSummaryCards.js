import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS } from "../../styles";

/**
 * WeeklyWorkoutSummaryCards Component
 * Shows weekly workout and exercise totals vs last week with percentage change
 */
const WeeklyWorkoutSummaryCards = ({ currentWeekData, lastWeekData, scheduledGoals }) => {
  const calculateChange = (current, previous) => {
    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }
    return ((current - previous) / previous) * 100;
  };

  const getTrendIcon = (percentage) => {
    if (percentage > 5) return "trending-up";
    if (percentage < -5) return "trending-down";
    return "minus";
  };

  const getTrendColor = (percentage) => {
    if (percentage > 5) return "#FF6B6B"; // Red for increase
    if (percentage < -5) return "#4CAF50"; // Green for decrease
    return "#999"; // Gray for stable
  };

  const StatCard = ({ label, icon, currentValue, previousValue, unit, totalValue }) => {
    const percentageChange = calculateChange(currentValue, previousValue);
    const trendIcon = getTrendIcon(percentageChange);
    const trendColor = getTrendColor(percentageChange);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.labelSection}>
            <MaterialCommunityIcons
              name={icon}
              size={20}
              color={COLORS.primary}
            />
            <Text style={styles.label}>{label}</Text>
          </View>
          <View style={styles.trendSection}>
            <MaterialCommunityIcons
              name={trendIcon}
              size={16}
              color={trendColor}
            />
            <Text style={[styles.percentageChange, { color: trendColor }]}>
              {percentageChange > 0 ? "+" : ""}
              {percentageChange.toFixed(1)}%
            </Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.valueRow}>
            <Text style={styles.currentValue}>
              {Math.round(currentValue)}
              {totalValue !== undefined && (
                <Text style={styles.totalValue}>/{Math.round(totalValue)}</Text>
              )}
              {unit}
            </Text>
          </View>

          {previousValue > 0 && (
            <Text style={styles.previousValue}>
              Last week: {Math.round(previousValue)}
              {unit}
            </Text>
          )}
        </View>
      </View>
    );
  };

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
          totalValue={scheduledGoals?.totalScheduledWorkouts}
          unit=""
        />
        <StatCard
          label="Exercises"
          icon="repeat"
          currentValue={currentWeekData.exercisesCompleted}
          previousValue={lastWeekData.exercisesCompleted}
          totalValue={scheduledGoals?.totalScheduledExercises}
          unit=""
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
  card: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    paddingLeft: 5,
    paddingRight: 5,
    paddingTop: 12,
    paddingBottom: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  labelSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
  },
  trendSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  percentageChange: {
    fontSize: 12,
    fontWeight: "700",
  },
  cardBody: {
    gap: 8,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  currentValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
  },
  totalValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#999",
  },
  previousValue: {
    fontSize: 10,
    color: "#999",
    fontStyle: "italic",
  },
});

export default WeeklyWorkoutSummaryCards;

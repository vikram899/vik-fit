import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { StatCard } from "../common";
import { COLORS, SPACING, TYPOGRAPHY } from "../../shared/constants";

/**
 * WeeklySummaryCards Component
 * Shows weekly macro totals vs goals with percentage change from last week
 */
const WeeklySummaryCards = ({ currentWeekData, lastWeekData, weeklyGoals }) => {

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>Weekly Summary</Text>
        <Text style={styles.subtitle}>vs Last Week</Text>
      </View>

      <View style={styles.cardsGrid}>
        <StatCard
          label="Calories"
          icon="fire"
          currentValue={currentWeekData.totalCalories}
          goal={weeklyGoals.calorieGoal}
          previousValue={lastWeekData.totalCalories}
          unit=""
          showGoal={true}
        />
        <StatCard
          label="Protein"
          icon="flash"
          currentValue={currentWeekData.totalProtein}
          goal={weeklyGoals.proteinGoal}
          previousValue={lastWeekData.totalProtein}
          unit="g"
          showGoal={true}
        />
        <StatCard
          label="Carbs"
          icon="bread-slice"
          currentValue={currentWeekData.totalCarbs}
          goal={weeklyGoals.carbsGoal}
          previousValue={lastWeekData.totalCarbs}
          unit="g"
          showGoal={true}
        />
        <StatCard
          label="Fats"
          icon="water"
          currentValue={currentWeekData.totalFats}
          goal={weeklyGoals.fatsGoal}
          previousValue={lastWeekData.totalFats}
          unit="g"
          showGoal={true}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.element,
    marginBottom: SPACING.container,
    marginTop: -8,
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
    flexWrap: "wrap",
    gap: SPACING.medium,
  },
});

export default WeeklySummaryCards;

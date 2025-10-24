import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { StatCard } from "../common";
import { COLORS } from "../../styles";

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
    flexWrap: "wrap",
    gap: 12,
  },
});

export default WeeklySummaryCards;

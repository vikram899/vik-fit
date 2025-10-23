import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS } from "../../styles";

/**
 * WeeklySummaryCards Component
 * Shows weekly macro totals vs goals with percentage change from last week
 */
const WeeklySummaryCards = ({ currentWeekData, lastWeekData, weeklyGoals }) => {
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

  const MacroCard = ({
    label,
    icon,
    currentValue,
    goal,
    previousValue,
    unit,
  }) => {
    const percentageChange = calculateChange(currentValue, previousValue);
    const goalPercentage = goal > 0 ? (currentValue / goal) * 100 : 0;
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
              size={18}
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
              {unit}
            </Text>
            {goal > 0 && (
              <Text style={styles.goalText}>
                / {Math.round(goal)}
                {unit} goal
              </Text>
            )}
          </View>

          {goal > 0 && (
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(goalPercentage, 100)}%`,
                    backgroundColor:
                      goalPercentage >= 90
                        ? "#4CAF50"
                        : goalPercentage >= 70
                        ? "#FFC107"
                        : "#FF6B6B",
                  },
                ]}
              />
            </View>
          )}

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
        <MacroCard
          label="Calories"
          icon="fire"
          currentValue={currentWeekData.totalCalories}
          goal={weeklyGoals.calorieGoal}
          previousValue={lastWeekData.totalCalories}
          unit=""
        />
        <MacroCard
          label="Protein"
          icon="flash"
          currentValue={currentWeekData.totalProtein}
          goal={weeklyGoals.proteinGoal}
          previousValue={lastWeekData.totalProtein}
          unit="g"
        />
        <MacroCard
          label="Carbs"
          icon="bread-slice"
          currentValue={currentWeekData.totalCarbs}
          goal={weeklyGoals.carbsGoal}
          previousValue={lastWeekData.totalCarbs}
          unit="g"
        />
        <MacroCard
          label="Fats"
          icon="water"
          currentValue={currentWeekData.totalFats}
          goal={weeklyGoals.fatsGoal}
          previousValue={lastWeekData.totalFats}
          unit="g"
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
  card: {
    width: "48%",
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
  goalText: {
    fontSize: 11,
    color: "#999",
  },
  progressBar: {
    height: 6,
    backgroundColor: "#e0e0e0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  previousValue: {
    fontSize: 10,
    color: "#999",
    fontStyle: "italic",
  },
});

export default WeeklySummaryCards;

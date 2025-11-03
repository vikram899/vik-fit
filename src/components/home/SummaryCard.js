import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import MacroItem from "./MacroItem";
import { appStyles } from "../../styles/app.styles";
import { COLORS } from "../../constants/colors";

export default function SummaryCard({
  dailyTotals,
  macroGoals,
  onLogPress,
  onEditMacrosPress,
  hideHeader = false,
  hideLogButton = false,
  showDate = false,
}) {
  const today = new Date().toISOString().split('T')[0];

  return (
    <View style={appStyles.summaryCard}>
      {!hideHeader && (
        <View style={styles.header}>
          <Text style={appStyles.summaryTitle}>
            {showDate ? today : "Today's Summary"}
          </Text>
          {!hideLogButton && (
            <View style={styles.headerButtons}>
              <TouchableOpacity style={styles.logButton} onPress={onLogPress}>
                <Text style={styles.logButtonText}>+ Log</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      <View style={appStyles.summaryContent}>
        <MacroItem
          icon="fire"
          iconColor={COLORS.calories}
          label="Calories"
          value={Math.round(dailyTotals.totalCalories)}
          goal={Math.round(macroGoals.calorieGoal)}
          progress={(dailyTotals.totalCalories / macroGoals.calorieGoal) * 100}
          progressColor={COLORS.calories}
        />

        <MacroItem
          icon="flash"
          iconColor={COLORS.protein}
          label="Protein"
          value={Math.round(dailyTotals.totalProtein)}
          goal={Math.round(macroGoals.proteinGoal)}
          unit="g"
          progress={(dailyTotals.totalProtein / macroGoals.proteinGoal) * 100}
          progressColor={COLORS.protein}
        />

        <MacroItem
          icon="bread-slice"
          iconColor={COLORS.carbs}
          label="Carbs"
          value={Math.round(dailyTotals.totalCarbs)}
          goal={Math.round(macroGoals.carbsGoal)}
          unit="g"
          progress={(dailyTotals.totalCarbs / macroGoals.carbsGoal) * 100}
          progressColor={COLORS.carbs}
        />

        <MacroItem
          icon="water"
          iconColor={COLORS.fats}
          label="Fats"
          value={Math.round(dailyTotals.totalFats)}
          goal={Math.round(macroGoals.fatsGoal)}
          unit="g"
          progress={(dailyTotals.totalFats / macroGoals.fatsGoal) * 100}
          progressColor={COLORS.fats}
        />
      </View>
    </View>
  );
}

const styles = {
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  editButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: COLORS.protein,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    height: 28,
    width: 28,
  },
  logButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: COLORS.calories,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    height: 28,
  },
  logButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.white,
    lineHeight: 12,
  },
};

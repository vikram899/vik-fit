import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import MacroItem from "./MacroItem";
import { appStyles } from "../../styles/app.styles";

export default function SummaryCard({
  dailyTotals,
  macroGoals,
  onLogPress,
  onEditMacrosPress,
}) {
  return (
    <View style={appStyles.summaryCard}>
      <View style={styles.header}>
        <Text style={appStyles.summaryTitle}>Today's Summary</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.logButton} onPress={onLogPress}>
            <Text style={styles.logButtonText}>+ Log</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={appStyles.summaryContent}>
        <MacroItem
          icon="silverware-fork-knife"
          iconColor="#007AFF"
          label="Calories"
          value={Math.round(dailyTotals.totalCalories)}
          goal={Math.round(macroGoals.calorieGoal)}
          progress={(dailyTotals.totalCalories / macroGoals.calorieGoal) * 100}
          progressColor="#007AFF"
        />

        <MacroItem
          icon="flash"
          iconColor="#FF9800"
          label="Protein"
          value={Math.round(dailyTotals.totalProtein)}
          goal={Math.round(macroGoals.proteinGoal)}
          unit="g"
          progress={(dailyTotals.totalProtein / macroGoals.proteinGoal) * 100}
          progressColor="#FF9800"
        />

        <MacroItem
          icon="bread-slice"
          iconColor="#4CAF50"
          label="Carbs"
          value={Math.round(dailyTotals.totalCarbs)}
          goal={Math.round(macroGoals.carbsGoal)}
          unit="g"
          progress={(dailyTotals.totalCarbs / macroGoals.carbsGoal) * 100}
          progressColor="#4CAF50"
        />

        <MacroItem
          icon="water"
          iconColor="#FF6B6B"
          label="Fats"
          value={Math.round(dailyTotals.totalFats)}
          goal={Math.round(macroGoals.fatsGoal)}
          unit="g"
          progress={(dailyTotals.totalFats / macroGoals.fatsGoal) * 100}
          progressColor="#FF6B6B"
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
    backgroundColor: "#FF9800",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    height: 28,
    width: 28,
  },
  logButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#007AFF",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    height: 28,
  },
  logButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
    lineHeight: 12,
  },
};

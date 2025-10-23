import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { appStyles } from "../styles/app.styles";
import { COLORS } from "../styles";
import { getMacroGoals, setMacroGoals } from "../services/database";

/**
 * MacroGoalsScreen
 * Screen to set default macro goals for all days
 */
export default function MacroGoalsScreen({ navigation }) {
  const defaultGoalDate = "0000-01-01"; // Special date for default goals
  const [calorieGoal, setCalorieGoal] = useState("2500");
  const [proteinGoal, setProteinGoal] = useState("120");
  const [carbsGoal, setCarbsGoal] = useState("300");
  const [fatsGoal, setFatsGoal] = useState("80");
  const [loading, setLoading] = useState(true);

  // Load existing default macro goals
  useEffect(() => {
    const loadMacroGoals = async () => {
      try {
        const goals = await getMacroGoals(defaultGoalDate);
        if (goals) {
          setCalorieGoal(goals.calorieGoal.toString());
          setProteinGoal(goals.proteinGoal.toString());
          setCarbsGoal(goals.carbsGoal.toString());
          setFatsGoal(goals.fatsGoal.toString());
        }
        setLoading(false);
      } catch (error) {
        console.error("Error loading macro goals:", error);
        setLoading(false);
      }
    };

    loadMacroGoals();
  }, []);

  const handleSaveGoals = async () => {
    try {
      const calories = parseFloat(calorieGoal) || 0;
      const protein = parseFloat(proteinGoal) || 0;
      const carbs = parseFloat(carbsGoal) || 0;
      const fats = parseFloat(fatsGoal) || 0;

      if (calories <= 0 || protein <= 0 || carbs <= 0 || fats <= 0) {
        Alert.alert("Invalid Input", "All values must be greater than 0");
        return;
      }

      // Save as default goals (for all days)
      await setMacroGoals(defaultGoalDate, calories, protein, carbs, fats);
      Alert.alert("Success", "Default macro goals saved successfully!");
      navigation.goBack();
    } catch (error) {
      console.error("Error saving macro goals:", error);
      Alert.alert("Error", "Failed to save macro goals");
    }
  };

  if (loading) {
    return (
      <View style={appStyles.screenContainer}>
        <Text style={{ textAlign: "center", marginTop: 20 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={appStyles.screenContainer}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Daily Macro Goals</Text>
        <Text style={styles.subtitle}>
          Set your default daily macro nutrient targets
        </Text>

        <View style={styles.gridContainer}>
          {/* Calories Goal */}
          <View style={styles.goalSection}>
            <View style={styles.goalHeader}>
              <MaterialCommunityIcons
                name="fire"
                size={24}
                color="#FF6B6B"
                style={styles.icon}
              />
              <Text style={styles.goalLabel}>Calories</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="2500"
              placeholderTextColor="#999"
              value={calorieGoal}
              onChangeText={setCalorieGoal}
              keyboardType="decimal-pad"
            />
            <Text style={styles.unit}>kcal</Text>
          </View>

          {/* Protein Goal */}
          <View style={styles.goalSection}>
            <View style={styles.goalHeader}>
              <MaterialCommunityIcons
                name="dumbbell"
                size={24}
                color="#4ECDC4"
                style={styles.icon}
              />
              <Text style={styles.goalLabel}>Protein</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="120"
              placeholderTextColor="#999"
              value={proteinGoal}
              onChangeText={setProteinGoal}
              keyboardType="decimal-pad"
            />
            <Text style={styles.unit}>grams</Text>
          </View>

          {/* Carbs Goal */}
          <View style={styles.goalSection}>
            <View style={styles.goalHeader}>
              <MaterialCommunityIcons
                name="bread-slice"
                size={24}
                color="#FFD93D"
                style={styles.icon}
              />
              <Text style={styles.goalLabel}>Carbs</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="300"
              placeholderTextColor="#999"
              value={carbsGoal}
              onChangeText={setCarbsGoal}
              keyboardType="decimal-pad"
            />
            <Text style={styles.unit}>grams</Text>
          </View>

          {/* Fats Goal */}
          <View style={styles.goalSection}>
            <View style={styles.goalHeader}>
              <MaterialCommunityIcons
                name="water"
                size={24}
                color="#FF9671"
                style={styles.icon}
              />
              <Text style={styles.goalLabel}>Fats</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="80"
              placeholderTextColor="#999"
              value={fatsGoal}
              onChangeText={setFatsGoal}
              keyboardType="decimal-pad"
            />
            <Text style={styles.unit}>grams</Text>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSaveGoals}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name="check-circle"
            size={24}
            color="#fff"
            style={styles.buttonIcon}
          />
          <Text style={styles.saveButtonText}>Save Macro Goals</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#000",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 24,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  goalSection: {
    width: "48%",
    marginBottom: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  goalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  icon: {
    marginRight: 8,
  },
  goalLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: "#000",
    marginBottom: 8,
  },
  unit: {
    fontSize: 13,
    color: "#999",
    fontStyle: "italic",
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 24,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonIcon: {
    marginRight: 8,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

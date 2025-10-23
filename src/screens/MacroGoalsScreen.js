import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  FlatList,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { appStyles } from "../styles/app.styles";
import { COLORS } from "../styles";
import { getMacroGoals, setMacroGoals } from "../services/database";
import { calculateMacroGoals, getActivityLevels, getFitnessGoals } from "../services/api";

/**
 * MacroGoalsScreen
 * Screen to set default macro goals for all days
 */
export default function MacroGoalsScreen({ navigation }) {
  const defaultGoalDate = "0000-01-01"; // Special date for default goals
  const [tab, setTab] = useState("manual"); // "manual" or "calculate"
  const [calorieGoal, setCalorieGoal] = useState("2500");
  const [proteinGoal, setProteinGoal] = useState("120");
  const [carbsGoal, setCarbsGoal] = useState("300");
  const [fatsGoal, setFatsGoal] = useState("80");
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);

  // Calculator form fields
  const [age, setAge] = useState("30");
  const [gender, setGender] = useState("male");
  const [height, setHeight] = useState("180");
  const [weight, setWeight] = useState("75");
  const [activityLevel, setActivityLevel] = useState("moderate");
  const [fitnessGoal, setFitnessGoal] = useState("maintain");

  // Dropdown visibility states
  const [genderDropdownOpen, setGenderDropdownOpen] = useState(false);
  const [activityDropdownOpen, setActivityDropdownOpen] = useState(false);
  const [goalDropdownOpen, setGoalDropdownOpen] = useState(false);

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

  const handleCalculateMacros = async () => {
    try {
      if (!age || !height || !weight) {
        Alert.alert("Missing Information", "Please fill in age, height, and weight");
        return;
      }

      setCalculating(true);

      const result = await calculateMacroGoals({
        age: parseInt(age),
        gender,
        height: parseInt(height),
        weight: parseInt(weight),
        activityLevel,
        goal: fitnessGoal,
      });

      setCalorieGoal(result.calorieGoal.toString());
      setProteinGoal(result.proteinGoal.toString());
      setCarbsGoal(result.carbsGoal.toString());
      setFatsGoal(result.fatsGoal.toString());

      // Automatically save the calculated macros
      try {
        await setMacroGoals(
          defaultGoalDate,
          result.calorieGoal,
          result.proteinGoal,
          result.carbsGoal,
          result.fatsGoal
        );
        console.log("Macros saved automatically");
      } catch (saveError) {
        console.error("Error auto-saving macros:", saveError);
      }

      // Switch back to manual entry tab
      setTab("manual");
    } catch (error) {
      console.error("Error calculating macros:", error);
      Alert.alert("Error", error.message || "Failed to calculate macros. Please check your API key.");
    } finally {
      setCalculating(false);
    }
  };

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

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, tab === "manual" && styles.activeTab]}
            onPress={() => setTab("manual")}
          >
            <Text style={[styles.tabText, tab === "manual" && styles.activeTabText]}>
              Manual Entry
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, tab === "calculate" && styles.activeTab]}
            onPress={() => setTab("calculate")}
          >
            <Text style={[styles.tabText, tab === "calculate" && styles.activeTabText]}>
              Calculate
            </Text>
          </TouchableOpacity>
        </View>

        {tab === "manual" ? (
          /* Manual Entry Form */
          <>
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
          </>
        ) : (
          /* Calculate Form */
          <View>
            {/* 2x2 Grid for Age, Gender, Height, Weight */}
            <View style={styles.formGrid}>
              {/* Age */}
              <View style={styles.formGridItem}>
                <Text style={styles.formLabel}>Age</Text>
                <TextInput
                  style={styles.inputField}
                  placeholder="30"
                  placeholderTextColor="#999"
                  value={age}
                  onChangeText={setAge}
                  keyboardType="number-pad"
                />
              </View>

              {/* Gender */}
              <View style={styles.formGridItem}>
                <Text style={styles.formLabel}>Gender</Text>
                <TouchableOpacity
                  style={styles.dropdownButton}
                  onPress={() => setGenderDropdownOpen(!genderDropdownOpen)}
                >
                  <Text style={styles.dropdownButtonText}>
                    {gender === "male" ? "Male" : "Female"}
                  </Text>
                  <MaterialCommunityIcons
                    name={genderDropdownOpen ? "chevron-up" : "chevron-down"}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
                {genderDropdownOpen && (
                  <View style={styles.dropdownMenu}>
                    <TouchableOpacity
                      style={styles.dropdownItem}
                      onPress={() => {
                        setGender("male");
                        setGenderDropdownOpen(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>Male</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.dropdownItem}
                      onPress={() => {
                        setGender("female");
                        setGenderDropdownOpen(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>Female</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* Height */}
              <View style={styles.formGridItem}>
                <Text style={styles.formLabel}>Height (cm)</Text>
                <TextInput
                  style={styles.inputField}
                  placeholder="180"
                  placeholderTextColor="#999"
                  value={height}
                  onChangeText={setHeight}
                  keyboardType="number-pad"
                />
              </View>

              {/* Weight */}
              <View style={styles.formGridItem}>
                <Text style={styles.formLabel}>Weight (kg)</Text>
                <TextInput
                  style={styles.inputField}
                  placeholder="75"
                  placeholderTextColor="#999"
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <Text style={styles.formLabel}>Activity Level</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setActivityDropdownOpen(!activityDropdownOpen)}
            >
              <Text style={styles.dropdownButtonText}>
                {getActivityLevels().find(l => l.value === activityLevel)?.label || "Select"}
              </Text>
              <MaterialCommunityIcons
                name={activityDropdownOpen ? "chevron-up" : "chevron-down"}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
            {activityDropdownOpen && (
              <View style={styles.dropdownMenu}>
                {getActivityLevels().map((level) => (
                  <TouchableOpacity
                    key={level.value}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setActivityLevel(level.value);
                      setActivityDropdownOpen(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{level.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={styles.formLabel}>Fitness Goal</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setGoalDropdownOpen(!goalDropdownOpen)}
            >
              <Text style={styles.dropdownButtonText}>
                {getFitnessGoals().find(g => g.value === fitnessGoal)?.label || "Select"}
              </Text>
              <MaterialCommunityIcons
                name={goalDropdownOpen ? "chevron-up" : "chevron-down"}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
            {goalDropdownOpen && (
              <View style={styles.dropdownMenu}>
                {getFitnessGoals().map((goal) => (
                  <TouchableOpacity
                    key={goal.value}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setFitnessGoal(goal.value);
                      setGoalDropdownOpen(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{goal.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Calculate Button */}
            <TouchableOpacity
              style={[styles.calculateButton, calculating && styles.calculatingButton]}
              onPress={handleCalculateMacros}
              disabled={calculating}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name={calculating ? "loading" : "calculator"}
                size={24}
                color="#fff"
                style={styles.buttonIcon}
              />
              <Text style={styles.calculateButtonText}>
                {calculating ? "Calculating..." : "Calculate Macros"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
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
  tabContainer: {
    flexDirection: "row",
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
    alignItems: "center",
  },
  activeTab: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#999",
  },
  activeTabText: {
    color: COLORS.primary,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  formGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  formGridItem: {
    width: "48%",
    marginBottom: 16,
  },
  inputField: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: "#000",
  },
  dropdownButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownButtonText: {
    fontSize: 16,
    color: "#000",
    flex: 1,
  },
  dropdownMenu: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    borderTopWidth: 0,
    marginTop: -8,
    paddingTop: 0,
    zIndex: 1,
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  dropdownItemText: {
    fontSize: 14,
    color: "#333",
  },
  calculateButton: {
    backgroundColor: "#4CAF50",
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
  calculatingButton: {
    opacity: 0.6,
  },
  calculateButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

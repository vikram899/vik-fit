import React, { useEffect, useState } from "react";
import { View, ScrollView, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SummaryCard, EnhancedSummaryCard, WorkoutsSection } from "../components/home";
import { Card, LogButton } from "../shared/components";
import WeightProgressGraph from "../components/WeightProgressGraph";
import StepsCard from "../components/health/StepsCard";
import { BottomSheet } from "../components/common";
import { useMealData, useWorkoutData, useWeightData, useBottomTabPadding } from "../shared/hooks";
import { useHealthData } from "../services/healthKit";
import { COLORS, SPACING, TYPOGRAPHY } from "../shared/constants";
import {
  getUserSetting,
  updateUserSetting,
  getCaloriesBurnedForDate,
  getDailyTotals,
  getMacroGoals,
  saveManualSteps,
  getManualSteps
} from "../services/database";

// Default card visibility settings
const DEFAULT_CARD_SETTINGS = {
  summary: true,
  workouts: true,
  steps: true,
  weight: true,
};

/**
 * HomeScreen
 * Shows user's daily summary (meals/macros) and today's scheduled workouts
 *
 * REFACTORED: Uses custom hooks to manage data loading
 * - useMealData: Loads daily totals and macro goals
 * - useWorkoutData: Loads today's workouts (scheduled + ad-hoc)
 * - useWeightData: Loads weight tracking data
 *
 * Previous: 287 lines with 6 useState + 2 useEffect
 * Current: ~98 lines with 3 hooks
 * Benefit: Clean separation of data loading from presentation
 */
export default function HomeScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const bottomPadding = useBottomTabPadding();

  // Customization state
  const [customizationVisible, setCustomizationVisible] = useState(false);
  const [cardSettings, setCardSettings] = useState(DEFAULT_CARD_SETTINGS);

  // Date selection state
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  // Enhanced summary data
  const [dailyTotals, setDailyTotals] = useState({
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFats: 0,
  });
  const [macroGoals, setMacroGoals] = useState({
    calorieGoal: 2500,
    proteinGoal: 150,
    carbsGoal: 300,
    fatsGoal: 85,
  });
  const [caloriesBurned, setCaloriesBurned] = useState(0);
  const [stepGoal, setStepGoal] = useState(10000);
  const [manualSteps, setManualSteps] = useState(0);
  const [displaySteps, setDisplaySteps] = useState(0);

  // Load all required data using custom hooks
  const { workouts: todayWorkouts, workoutLogs: todayWorkoutLogs } =
    useWorkoutData();
  const { weightData, targetWeight } = useWeightData();
  const { steps: healthKitSteps } = useHealthData();

  // Load saved card preferences
  useEffect(() => {
    const loadCardSettings = async () => {
      try {
        const savedSettings = await getUserSetting("homeScreenCards");
        if (savedSettings) {
          setCardSettings(JSON.parse(savedSettings));
        }
      } catch (error) {
        console.error("Failed to load card settings:", error);
      }
    };
    loadCardSettings();
  }, []);

  // Load daily data for selected date
  useEffect(() => {
    const loadDailyData = async () => {
      try {
        // Load meal totals
        const totals = await getDailyTotals(selectedDate);
        setDailyTotals(totals);

        // Load macro goals
        const goals = await getMacroGoals(selectedDate);
        setMacroGoals(goals);

        // Load calories burned from workouts
        const burned = await getCaloriesBurnedForDate(selectedDate);
        setCaloriesBurned(burned);

        // Load manual steps for selected date
        const savedManualSteps = await getManualSteps(selectedDate);
        setManualSteps(savedManualSteps);

        // Load step goal
        const savedStepGoal = await getUserSetting("stepGoal");
        if (savedStepGoal) {
          setStepGoal(parseInt(savedStepGoal, 10));
        }
      } catch (error) {
        console.error("Failed to load daily data:", error);
      }
    };

    loadDailyData();
  }, [selectedDate]);

  // Combine HealthKit steps and manual steps (prioritize manual if set)
  useEffect(() => {
    const isToday = selectedDate === new Date().toISOString().split("T")[0];

    if (manualSteps > 0) {
      // Use manual steps if user has entered them
      setDisplaySteps(manualSteps);
    } else if (isToday && healthKitSteps > 0) {
      // Use HealthKit steps for today if available and no manual entry
      setDisplaySteps(healthKitSteps);
    } else {
      // Default to 0
      setDisplaySteps(0);
    }
  }, [selectedDate, manualSteps, healthKitSteps]);

  // Handle customization button press from navigation
  useEffect(() => {
    if (route?.params?.openCustomization) {
      setCustomizationVisible(true);
      // Reset the param
      navigation.setParams({ openCustomization: false });
    }
  }, [route?.params?.openCustomization]);

  // Toggle card visibility
  const toggleCard = (cardKey) => {
    setCardSettings((prev) => ({
      ...prev,
      [cardKey]: !prev[cardKey],
    }));
  };

  // Save card settings
  const saveCardSettings = async () => {
    try {
      await updateUserSetting("homeScreenCards", JSON.stringify(cardSettings));
      setCustomizationVisible(false);
    } catch (error) {
      console.error("Failed to save card settings:", error);
    }
  };

  // Handle manual steps update
  const handleStepsUpdate = async (steps) => {
    try {
      await saveManualSteps(selectedDate, steps);
      setManualSteps(steps);
      setDisplaySteps(steps);
    } catch (error) {
      console.error("Failed to save manual steps:", error);
    }
  };

  return (
    <>
      <ScrollView
        style={{ flex: 1, backgroundColor: COLORS.mainBackground }}
        contentContainerStyle={{ paddingBottom: bottomPadding }}
        showsVerticalScrollIndicator={false}
      >
        {/* Today's Summary Card */}
        {cardSettings.summary && (
          <EnhancedSummaryCard
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            dailyTotals={dailyTotals}
            macroGoals={macroGoals}
            caloriesBurned={caloriesBurned}
            steps={displaySteps}
            stepGoal={stepGoal}
            onLogPress={() => navigation.navigate("LogMeals")}
            onStepsUpdate={handleStepsUpdate}
          />
        )}

        {/* Today's Workouts Section */}
        {cardSettings.workouts && (
          <WorkoutsSection
            workouts={todayWorkouts}
            workoutLogs={todayWorkoutLogs}
            onLogPress={() => navigation.navigate("LogWorkout")}
            onWorkoutPress={() => navigation.navigate("LogWorkout")}
          />
        )}

        {/* Daily Steps Card - Synced from Apple Health */}
        {cardSettings.steps && <StepsCard />}

        {/* Weight Progress Card - Using reusable Card component with LogButton */}
        {cardSettings.weight && (
          <Card
            title="Weight Progress"
            actionComponent={
              <LogButton
                onPress={() => navigation.navigate("WeightTracking")}
                size="small"
              />
            }
          >
            <WeightProgressGraph data={weightData} targetWeight={targetWeight} />
          </Card>
        )}
      </ScrollView>

      {/* Customization Bottom Sheet */}
      <BottomSheet
        visible={customizationVisible}
        onClose={() => setCustomizationVisible(false)}
        title="Customize Home Screen"
      >
        <View style={styles.customizationContainer}>
          <Text style={styles.customizationDescription}>
            Select which cards you want to see on your home screen
          </Text>

          {/* Card checkboxes */}
          <View style={styles.checkboxContainer}>
            <CheckboxItem
              label="Daily Summary"
              description="Calories, protein, carbs, and fats"
              icon="food-apple"
              checked={cardSettings.summary}
              onToggle={() => toggleCard("summary")}
            />
            <CheckboxItem
              label="Today's Workouts"
              description="Scheduled workouts and logs"
              icon="dumbbell"
              checked={cardSettings.workouts}
              onToggle={() => toggleCard("workouts")}
            />
            <CheckboxItem
              label="Daily Steps"
              description="Steps from Apple Health"
              icon="walk"
              checked={cardSettings.steps}
              onToggle={() => toggleCard("steps")}
            />
            <CheckboxItem
              label="Weight Progress"
              description="Weight tracking graph"
              icon="scale-bathroom"
              checked={cardSettings.weight}
              onToggle={() => toggleCard("weight")}
            />
          </View>

          {/* Save button */}
          <TouchableOpacity
            style={styles.saveButton}
            onPress={saveCardSettings}
          >
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>
    </>
  );
}

// Checkbox component for card selection
const CheckboxItem = ({ label, description, icon, checked, onToggle }) => (
  <TouchableOpacity
    style={styles.checkboxItem}
    onPress={onToggle}
    activeOpacity={0.7}
  >
    <View style={styles.checkboxLeft}>
      <MaterialCommunityIcons
        name={icon}
        size={24}
        color={COLORS.primary}
        style={styles.checkboxIcon}
      />
      <View style={styles.checkboxTextContainer}>
        <Text style={styles.checkboxLabel}>{label}</Text>
        <Text style={styles.checkboxDescription}>{description}</Text>
      </View>
    </View>
    <MaterialCommunityIcons
      name={checked ? "checkbox-marked" : "checkbox-blank-outline"}
      size={24}
      color={checked ? COLORS.primary : COLORS.mediumGray}
    />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  customizationContainer: {
    gap: SPACING.element,
  },
  customizationDescription: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.small,
  },
  checkboxContainer: {
    gap: SPACING.small,
  },
  checkboxItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.secondaryBackground,
    padding: SPACING.medium,
    borderRadius: SPACING.borderRadius,
    borderWidth: 1,
    borderColor: COLORS.mediumGray,
  },
  checkboxLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: SPACING.medium,
  },
  checkboxIcon: {
    width: 24,
  },
  checkboxTextContainer: {
    flex: 1,
  },
  checkboxLabel: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  checkboxDescription: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textSecondary,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.medium,
    borderRadius: SPACING.borderRadius,
    alignItems: "center",
    marginTop: SPACING.small,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
});
